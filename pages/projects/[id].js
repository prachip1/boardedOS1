import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import {
  FiArrowLeft, FiLoader, FiAlertCircle, FiUserPlus, FiTrash2, FiMail,
  FiFolder, FiCalendar, FiDollarSign, FiClock, FiEdit2,
  FiUpload, FiFile, FiDownload, FiTrello
} from 'react-icons/fi'
import {
  getProject, deleteProject, getProjectMembers, addProjectMember,
  updateProjectMemberRole, removeProjectMember, notifyMemberInvited
} from '../../lib/api/projects'
import { getFiles, uploadAndCreateFile, deleteFileComplete } from '../../lib/api/files'
import { useAuth } from '../../contexts/AuthContext'

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const ROLES = ['owner', 'admin', 'member', 'viewer']

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-500',
  completed: 'bg-blue-500/10 text-blue-500',
  on_hold: 'bg-yellow-500/10 text-yellow-500',
  cancelled: 'bg-red-500/10 text-red-500',
}

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  const [files, setFiles] = useState([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef(null)

  const isOwner = project && user && project.user_id === user.id

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [proj, mem, fls] = await Promise.all([
        getProject(id), getProjectMembers(id), getFiles({ projectId: id }),
      ])
      setProject(proj)
      setMembers(mem)
      setFiles(fls)
    } catch (err) {
      setError(err.message)
      console.error('Error loading project:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  const handleUploadToProject = async (fileList) => {
    const arr = Array.from(fileList || [])
    if (!arr.length) return
    setUploadingFile(true)
    try {
      for (const file of arr) {
        await uploadAndCreateFile(file, { projectId: id, clientId: project?.client_id || null })
      }
      setFiles(await getFiles({ projectId: id }))
    } catch (err) {
      alert(err.message || 'Upload failed. Make sure the "files" storage bucket exists (run files-collab.sql).')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return
    try {
      await deleteFileComplete(fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      alert(err.message || 'Could not delete file.')
    }
  }

  useEffect(() => {
    if (id) load()
  }, [id, load])

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError(null)
    try {
      await addProjectMember(id, inviteEmail, inviteRole)
      // Best-effort email — don't block or fail the invite on this.
      notifyMemberInvited({
        to: inviteEmail.trim().toLowerCase(),
        projectName: project?.name,
        role: inviteRole,
        inviterEmail: user?.email,
      })
      setInviteEmail('')
      setInviteRole('member')
      const mem = await getProjectMembers(id)
      setMembers(mem)
    } catch (err) {
      setInviteError(err.message)
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId, role) => {
    try {
      await updateProjectMemberRole(memberId, role)
      setMembers(members.map(m => (m.id === memberId ? { ...m, role } : m)))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the project?')) return
    try {
      await removeProjectMember(memberId)
      setMembers(members.filter(m => m.id !== memberId))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    try {
      await deleteProject(id)
      router.push('/projects')
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </Layout>
    )
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto card bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-500 font-medium mb-1">Couldn&apos;t load this project</h3>
              <p className="text-red-400 text-sm">{error || 'Project not found'}</p>
              <Link href="/projects" className="btn btn-secondary mt-4 inline-flex">
                <FiArrowLeft size={16} /> Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{project.name} - Boarded</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors mt-1">
                <FiArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-semibold text-text-primary">{project.name}</h1>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_STYLES[project.status] || 'bg-gray-500/10 text-gray-400'}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                  {!isOwner && <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">Shared with you</span>}
                </div>
                {project.client?.name && (
                  <p className="text-text-secondary text-sm mt-1">Client: {project.client.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/tasks/${id}`} className="btn btn-secondary">
                <FiTrello size={16} /> Open Board
              </Link>
              {isOwner && (
                <button onClick={handleDeleteProject} className="btn btn-secondary text-red-500">
                  <FiTrash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-text-secondary text-xs mb-1 flex items-center gap-1"><FiDollarSign size={12} /> Budget</p>
              <p className="text-lg font-semibold text-text-primary">
                {project.budget != null ? `$${Number(project.budget).toLocaleString()}` : '—'}
              </p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-xs mb-1 flex items-center gap-1"><FiCalendar size={12} /> Start</p>
              <p className="text-lg font-semibold text-text-primary">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="card">
              <p className="text-text-secondary text-xs mb-1 flex items-center gap-1"><FiClock size={12} /> Due</p>
              <p className="text-lg font-semibold text-text-primary">
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {project.description && (
            <div className="card">
              <h2 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <FiFolder size={15} /> About
              </h2>
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Team / Members */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Team</h2>
              <span className="text-xs text-text-tertiary">{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Invite by email (owner/admin only) */}
            {isOwner && (
              <form onSubmit={handleInvite} className="space-y-3 bg-background-secondary rounded-md p-4">
                <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <FiUserPlus size={15} /> Invite someone by email
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
                    <input
                      type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@example.com" className="input pl-9" required
                    />
                  </div>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="input sm:w-36">
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button type="submit" className="btn btn-primary" disabled={inviting}>
                    {inviting ? <FiLoader className="animate-spin" size={16} /> : <FiUserPlus size={16} />}
                    Invite
                  </button>
                </div>
                {inviteError && <p className="text-red-400 text-sm">{inviteError}</p>}
                <p className="text-xs text-text-tertiary">
                  They&apos;ll see this project in their own Projects list as soon as they sign in with this email.
                </p>
              </form>
            )}

            {/* Member list */}
            <div className="divide-y divide-border">
              {/* Owner row */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {(project.owner_email || 'O').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {isOwner ? 'You' : 'Project owner'}
                    </p>
                    <p className="text-xs text-text-tertiary">Full access</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent capitalize">owner</span>
              </div>

              {members.length === 0 && (
                <p className="text-sm text-text-tertiary py-4 text-center">
                  No collaborators yet{isOwner ? ' — invite someone above.' : '.'}
                </p>
              )}

              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-background-elevated text-text-secondary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {m.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{m.email}</p>
                      <p className="text-xs text-text-tertiary">
                        {m.status === 'active' ? 'Joined' : 'Invited — pending sign in'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="input py-1 text-xs w-28"
                      >
                        {ROLES.filter(r => r !== 'owner').map(r => (
                          <option key={r} value={r} className="capitalize">{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-background-elevated text-text-secondary capitalize">{m.role}</span>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-2 text-text-tertiary hover:text-red-500 transition-colors"
                        title="Remove member"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Files</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                disabled={uploadingFile}
              >
                {uploadingFile ? <FiLoader className="animate-spin" size={15} /> : <FiUpload size={15} />}
                Upload
              </button>
              <input
                ref={fileInputRef} type="file" multiple className="hidden"
                onChange={(e) => { handleUploadToProject(e.target.files); e.target.value = '' }}
              />
            </div>

            {files.length === 0 ? (
              <p className="text-sm text-text-tertiary py-4 text-center">
                No files yet. Upload one here, or tag a file to this project from the Files page.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FiFile className="text-accent flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{f.name}</p>
                        <p className="text-xs text-text-tertiary">{formatSize(f.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={f.public_url} target="_blank" rel="noopener noreferrer" className="p-2 text-text-tertiary hover:text-text-primary" title="Download">
                        <FiDownload size={15} />
                      </a>
                      <button onClick={() => handleDeleteFile(f.id)} className="p-2 text-text-tertiary hover:text-red-500" title="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  )
}
