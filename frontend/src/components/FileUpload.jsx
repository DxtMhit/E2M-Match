import { useState, useRef } from 'react'
import './FileUpload.css'

const ACCEPTED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/plain': '.txt',
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt']

function FileUpload({ label, description, onFileSelect, accept = ACCEPTED_EXTENSIONS.join(','), id }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    return ACCEPTED_EXTENSIONS.includes(ext)
  }

  const handleFile = (f) => {
    if (validateFile(f)) {
      setFile(f)
      onFileSelect(f)
    } else {
      alert('Unsupported file format. Please upload PDF, DOCX, DOC, or TXT files.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'docx': case 'doc': return '📝'
      case 'txt': return '📃'
      default: return '📎'
    }
  }

  return (
    <div className="file-upload" id={id}>
      <label className="file-upload__label">{label}</label>
      {description && <p className="file-upload__description">{description}</p>}

      {!file ? (
        <div
          className={`file-upload__dropzone ${dragActive ? 'file-upload__dropzone--active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="file-upload__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="file-upload__text">
            <span className="file-upload__text-bold">Click to upload</span> or drag and drop
          </p>
          <p className="file-upload__formats">PDF, DOCX, DOC, or TXT (Max 10MB)</p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="file-upload__input"
          />
        </div>
      ) : (
        <div className="file-upload__preview">
          <div className="file-upload__file-info">
            <span className="file-upload__file-icon">{getFileIcon(file.name)}</span>
            <div className="file-upload__file-details">
              <p className="file-upload__file-name">{file.name}</p>
              <p className="file-upload__file-size">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            className="file-upload__remove"
            onClick={removeFile}
            aria-label="Remove file"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUpload
