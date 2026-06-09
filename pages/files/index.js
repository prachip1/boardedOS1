import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { FiUpload, FiFile, FiImage, FiFileText, FiDownload, FiShare2, FiTrash2, FiFolder } from 'react-icons/fi'
import { format } from 'date-fns'

export default function Files() {
  const [viewMode, setViewMode] = useState('grid')

  // Mock data
  const files = [
    {
      id: '1',
      name: 'Website_Mockup_v2.fig',
      type: 'design',
      size: 2456789,
      client: 'Acme Corporation',
      project: 'Website Redesign',
      uploadedAt: new Date('2025-10-18'),
      sharedLink: 'https://files.boarded.app/abc123',
    },
    {
      id: '2',
      name: 'Project_Proposal.pdf',
      type: 'document',
      size: 1234567,
      client: 'Tech Startup Inc',
      project: 'Mobile App',
      uploadedAt: new Date('2025-10-17'),
      sharedLink: null,
    },
    {
      id: '3',
      name: 'Homepage_Screenshot.png',
      type: 'image',
      size: 987654,
      client: 'Design Co',
      project: 'Brand Identity',
      uploadedAt: new Date('2025-10-16'),
      sharedLink: 'https://files.boarded.app/def456',
    },
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return FiImage
      case 'document': return FiFileText
      case 'design': return FiFile
      default: return FiFile
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

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
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Files & Assets
              </h1>
              <p className="text-text-secondary">
                Manage and share project files with clients
              </p>
            </div>
            <button className="btn btn-primary">
              <FiUpload size={18} />
              Upload Files
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiFile className="text-blue-500" size={20} />
                <p className="text-text-secondary text-sm">Total Files</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">{files.length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiFolder className="text-green-500" size={20} />
                <p className="text-text-secondary text-sm">Storage Used</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">{formatFileSize(totalSize)}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <FiShare2 className="text-yellow-500" size={20} />
                <p className="text-text-secondary text-sm">Shared Links</p>
              </div>
              <p className="text-2xl font-semibold text-text-primary">
                {files.filter(f => f.sharedLink).length}
              </p>
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {files.map(file => {
              const FileIcon = getFileIcon(file.type)
              
              return (
                <div key={file.id} className="card group hover:border-border-hover transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-background-elevated flex items-center justify-center">
                      <FileIcon className="text-accent" size={24} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-text-secondary hover:text-text-primary transition-colors">
                        <FiDownload size={16} />
                      </button>
                      <button className="p-1 text-text-secondary hover:text-text-primary transition-colors">
                        <FiShare2 size={16} />
                      </button>
                      <button className="p-1 text-red-500 hover:text-red-400 transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      {file.project} • {file.client}
                    </p>
                    <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{format(file.uploadedAt, 'MMM dd')}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upload Area */}
          <div className="card border-2 border-dashed border-border hover:border-accent transition-colors cursor-pointer">
            <div className="text-center py-12">
              <FiUpload className="mx-auto mb-4 text-text-tertiary" size={48} />
              <p className="text-text-primary font-medium mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-text-tertiary">
                Supports: Images, PDFs, Documents, Design files
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

