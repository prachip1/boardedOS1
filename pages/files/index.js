import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import {
  FiUpload, FiFile, FiImage, FiFileText, FiDownload, FiShare2, FiTrash2,
  FiFolder, FiLoader, FiX, FiCheck,
} from 'react-icons/fi'
import { format } from 'date-fns'
import { getFiles, uploadAndCreateFile, deleteFileComplete, generateShareableLink } from '../../lib/api/files'
import { getClients } from '../../lib/api/clients'
import { getProjects } from '../../lib/api/projects'

const iconForType = (mime = '') => {
  if (mime.startsWith('image/')) return FiImage
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('text') || mime.includes('sheet') || mime.includes('excel')) return FiFileText
  return FiFile
}

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function Files() {
  const [files, setFiles] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)

  // Upload modal
  const [pending, setPending] = useState([]) // File[] chosen but not yet uploaded
  const [uploadProject, setUploadProject] = useState('')
  const [uploadClient, setUploadClient] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [f, c, p] = await Promise.all([getFiles(), getClients(), getProjects()])
      setFiles(f)
      setClients(c)
      setProjects(p)
    } catch (err) {
      console.error('Error loading files:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // -------- choosing files --------------------------------------------------
  const onFilesChosen = (fileList) => {
    const arr = Array.from(fileList || [])
    if (arr.length) {
      setPending(arr)
      setUploadProject('')
      setUploadClient('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    onFilesChosen(e.dataTransfer.files)
  }

  // Picking a project auto-fills its client.
  const handleProjectChange = (projectId) => {
    setUploadProject(projectId)
    const proj = projects.find((p) => p.id === projectId)
    if (proj?.client_id) setUploadClient(proj.client_id)
  }

  const handleUpload = async () => {
    if (!pending.length) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of pending) {
        const rec = await uploadAndCreateFile(file, {
          projectId: uploadProject || null,
          clientId: uploadClient || null,
        })
        uploaded.push(rec)
      }
      // Reload so joined client/project names show up.
      await load()
      setPending([])
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err.message || 'Upload failed. Make sure the "files" storage bucket exists (run files-collab.sql).')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this file? This removes it from storage too.')) return
    try {
      await deleteFileComplete(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      alert(err.message || 'Could not delete file.')
    }
  }

  const handleShare = async (id) => {
    try {
      const { shareUrl } = await generateShareableLink(id, 168) // 7 days
      await navigator.clipboard.writeText(shareUrl)
      alert(`Share link copied (valid 7 days):\n${shareUrl}`)
    } catch (err) {
      alert(err.message || 'Could not create share link.')
    }
  }

  const totalSize = files.reduce((s, f) => s + (f.size || 0), 0)
  const sharedCount = files.filter((f) => f.shared_link).length

  return (
    <>
      <Head>
        <title>Files - Boarded</title>
      </Head>
      <Layout>
        <div className="space-y-6 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">Files &amp; Assets</h1>
              <p className="text-text-secondary">Upload any file and tag it to a project to share it with the team.</p>
            </div>
            <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>
              <FiUpload size={18} /> Upload Files
            </button>
            <input
              ref={inputRef} type="file" multiple className="hidden"
              onChange={(e) => { onFilesChosen(e.target.files); e.target.value = '' }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2"><FiFile className="text-blue-500" size={20} /><p className="text-text-secondary text-sm">Total Files</p></div>
              <p className="text-2xl font-semibold text-text-primary">{files.length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2"><FiFolder className="text-green-500" size={20} /><p className="text-text-secondary text-sm">Storage Used</p></div>
              <p className="text-2xl font-semibold text-text-primary">{formatSize(totalSize)}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2"><FiShare2 className="text-yellow-500" size={20} /><p className="text-text-secondary text-sm">Shared Links</p></div>
              <p className="text-2xl font-semibold text-text-primary">{sharedCount}</p>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <FiLoader className="animate-spin text-accent mx-auto mb-4" size={32} />
              <p className="text-text-secondary">Loading files…</p>
            </div>
          )}

          {/* Files grid */}
          {!loading && files.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {files.map((file) => {
                const FileIcon = iconForType(file.file_type)
                return (
                  <div key={file.id} className="card group hover:border-accent/40 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-background-elevated flex items-center justify-center">
                        <FileIcon className="text-accent" size={24} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={file.public_url} target="_blank" rel="noopener noreferrer" className="p-1 text-text-secondary hover:text-text-primary" title="Download">
                          <FiDownload size={16} />
                        </a>
                        <button onClick={() => handleShare(file.id)} className="p-1 text-text-secondary hover:text-text-primary" title="Copy share link">
                          <FiShare2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(file.id)} className="p-1 text-red-500 hover:text-red-400" title="Delete">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-text-primary truncate" title={file.name}>{file.name}</h3>
                      <p className="text-xs text-text-tertiary truncate">
                        {file.project?.name || 'No project'}{file.client?.name ? ` • ${file.client.name}` : ''}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
                        <span>{formatSize(file.size)}</span>
                        <span>{file.created_at ? format(new Date(file.created_at), 'MMM dd') : ''}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`card border-2 border-dashed transition-colors cursor-pointer ${dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'}`}
          >
            <div className="text-center py-12">
              <FiUpload className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-primary font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-text-tertiary">Any file type — Excel, PDF, images, design files…</p>
            </div>
          </div>
        </div>

        {/* Upload details modal */}
        {pending.length > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Upload {pending.length} file{pending.length > 1 ? 's' : ''}
                </h2>
                <button onClick={() => setPending([])} className="text-text-tertiary hover:text-text-primary" disabled={uploading}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {pending.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <FiFile size={14} className="text-text-tertiary flex-shrink-0" />
                    <span className="truncate flex-1">{f.name}</span>
                    <span className="text-xs text-text-tertiary">{formatSize(f.size)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Project (optional)</label>
                  <select value={uploadProject} onChange={(e) => handleProjectChange(e.target.value)} className="select">
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}{p.client?.name ? ` — ${p.client.name}` : ''}</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-tertiary mt-1">Tag a project and the whole team can see this file under that project.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Client (optional)</label>
                  <select value={uploadClient} onChange={(e) => setUploadClient(e.target.value)} className="select">
                    <option value="">No client</option>
                    {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setPending([])} className="btn btn-secondary" disabled={uploading}>Cancel</button>
                <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>
                  {uploading ? <><FiLoader className="animate-spin" size={16} /> Uploading…</> : <><FiCheck size={16} /> Upload</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}
