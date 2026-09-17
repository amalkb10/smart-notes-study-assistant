import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Folder
} from 'lucide-react';

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUploadSuccess, 
  subjects = [] 
}) {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('Computer Science');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      await onUploadSuccess(file, subject);
      onClose();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 520,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={18} color="var(--accent-violet)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Import Study Document</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PDF, TXT, or Markdown lecture materials</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-violet)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '36px 20px',
            textAlign: 'center',
            background: dragActive ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            marginBottom: 20,
            transition: 'var(--transition)'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <FileText size={24} color={file ? 'var(--accent-emerald)' : 'var(--accent-cyan)'} />
          </div>

          {file ? (
            <div>
              <p style={{ fontSize: '0.94rem', fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>
                {file.name}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {(file.size / 1024).toFixed(1)} KB • Click to change file
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>
                Click or drag & drop lecture file here
              </p>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Supports PDF slides, study notes (.txt, .md) up to 20MB
              </p>
            </div>
          )}
        </div>

        {/* Subject Assignment */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
            Assign to Subject
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="input-field"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science, Physics..."
            />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={!file || isUploading}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{isUploading ? 'Extracting & Synthesizing...' : 'Extract & Create Smart Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
