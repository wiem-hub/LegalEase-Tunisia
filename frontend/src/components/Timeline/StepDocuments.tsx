import React from 'react';
// src/components/Timeline/StepDocuments.tsx
// Theme: Blanc + Navy + Rouge accent — Pro & comfortable
import { useRef, useState } from 'react';
import type { StepDocument } from '../../types/procedure';
import { documentApi } from '../../services/documentApi';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

  :root {
    --navy:   #1C2B4A;
    --red:    #C8102E;
    --red-xs: #FFF0F2;
    --cream:  #FAF9F7;
    --white:  #FFFFFF;
    --gray1:  #F5F4F1;
    --gray2:  #ECEAE5;
    --gray3:  #9C9A96;
    --gray4:  #6A6865;
    --ink:    #1A1916;
    --border: #E8E5DF;
    --green:  #16A34A;
    --blue:   #2563EB;
  }

  .docs-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: 'Inter', sans-serif;
  }

  /* ── Drop zone ── */
  .docs-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1.5px dashed var(--border);
    border-radius: 12px;
    padding: 20px 16px;
    cursor: pointer;
    transition: all 0.18s;
    background: var(--gray1);
    user-select: none;
    text-align: center;
  }

  .docs-dropzone:hover {
    border-color: rgba(28,43,74,0.40);
    background: rgba(28,43,74,0.03);
  }

  .docs-dropzone.dragging {
    border-color: var(--navy);
    background: rgba(28,43,74,0.05);
    box-shadow: 0 0 0 3px rgba(28,43,74,0.08);
  }

  .docs-dropzone.uploading {
    pointer-events: none;
    opacity: 0.80;
  }

  .docs-drop-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: var(--white);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--gray3);
    transition: all 0.18s;
  }

  .docs-dropzone:hover .docs-drop-icon {
    border-color: rgba(28,43,74,0.30);
    color: var(--navy);
  }

  .docs-drop-label {
    font-size: 12.5px;
    color: var(--gray4);
    font-weight: 300;
    line-height: 1.5;
  }

  .docs-drop-label strong {
    color: var(--navy);
    font-weight: 600;
  }

  .docs-drop-hint {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.04em;
    color: var(--gray3);
  }

  /* Uploading state */
  .docs-uploading-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--navy);
    font-weight: 500;
  }

  /* ── Error ── */
  .docs-error {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    padding: 10px 13px;
    background: var(--red-xs);
    border: 1px solid rgba(200,16,46,0.18);
    border-radius: 9px;
    font-size: 12px;
    color: var(--red);
    line-height: 1.5;
  }

  .docs-error svg { flex-shrink: 0; margin-top: 1px; }

  /* ── File list ── */
  .docs-list { display: flex; flex-direction: column; gap: 6px; }

  .doc-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 14px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    transition: all 0.15s;
  }

  .doc-item:hover { border-color: rgba(28,43,74,0.20); background: var(--cream); }

  /* File type icon wrapper */
  .doc-icon-wrap {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .di-pdf  { background: rgba(200,16,46,0.09);  color: var(--red); }
  .di-img  { background: rgba(37,99,235,0.09);  color: var(--blue); }
  .di-word { background: rgba(28,43,74,0.09);   color: var(--navy); }
  .di-file { background: var(--gray1);           color: var(--gray3); }

  /* File info */
  .doc-info { flex: 1; min-width: 0; }

  .doc-name {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  .doc-meta {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    color: var(--gray3);
    letter-spacing: 0.03em;
  }

  /* Doc type badge */
  .doc-type-badge {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .dtb-pdf  { background: rgba(200,16,46,0.08);  color: var(--red); }
  .dtb-img  { background: rgba(37,99,235,0.08);  color: var(--blue); }
  .dtb-word { background: rgba(28,43,74,0.08);   color: var(--navy); }
  .dtb-file { background: var(--gray1);           color: var(--gray3); }

  /* Action buttons */
  .doc-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }

  .doc-btn {
    width: 28px; height: 28px;
    border-radius: 7px;
    border: none;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--gray3);
  }

  .doc-btn:hover { background: var(--gray1); color: var(--navy); }
  .doc-btn.delete:hover { background: var(--red-xs); color: var(--red); }
  .doc-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Empty state */
  .docs-empty {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--gray3);
    text-transform: uppercase;
    text-align: center;
    padding: 8px 0;
  }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.7s linear infinite; }
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const formatSize = (bytes: number): string => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type FileCategory = 'pdf' | 'img' | 'word' | 'file';

const categorize = (ct: string): FileCategory => {
  if (ct === 'application/pdf')     return 'pdf';
  if (ct.startsWith('image/'))      return 'img';
  if (ct.includes('word') || ct.includes('document')) return 'word';
  return 'file';
};

const FileIcon = ({ category }: { category: FileCategory }) => {
  const icons: Record<FileCategory, React.ReactNode> = {
    pdf: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    img: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
    word: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
    file: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
    ),
  };
  return icons[category];
};

const TYPE_LABELS: Record<FileCategory, string> = {
  pdf: 'PDF', img: 'Image', word: 'Word', file: 'File',
};

/* ─── Component ──────────────────────────────────────────────────────────── */

interface StepDocumentsProps {
  progressId: number;
  initialDocuments: StepDocument[];
  disabled?: boolean;
}

const StepDocuments = ({ progressId, initialDocuments, disabled = false }: StepDocumentsProps) => {
  const [docs,       setDocs]       = useState<StepDocument[]>(initialDocuments);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dragOver,   setDragOver]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(''); setUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(f => documentApi.upload(progressId, f))
      );
      setDocs(prev => [...prev, ...uploads]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Check file type and size (max 10 MB).');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: number) => {
    setDeletingId(docId);
    try {
      await documentApi.delete(docId);
      setDocs(prev => prev.filter(d => d.id !== docId));
    } catch {
      setError('Failed to delete document.');
    } finally { setDeletingId(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="docs-wrap">

        {/* Drop zone */}
        {!disabled && (
          <div
            className={`docs-dropzone ${dragOver ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />

            {uploading ? (
              <div className="docs-uploading-row">
                <svg className="spin" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/>
                </svg>
                Uploading...
              </div>
            ) : (
              <>
                <div className="docs-drop-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                </div>
                <p className="docs-drop-label">
                  <strong>Click to upload</strong> or drag &amp; drop
                </p>
                <span className="docs-drop-hint">PDF · PNG · JPEG · WEBP · DOC · DOCX — max 10 MB</span>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="docs-error">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* File list */}
        {docs.length > 0 && (
          <div className="docs-list">
            {docs.map(doc => {
              const cat = categorize(doc.content_type);
              return (
                <div key={doc.id} className="doc-item">
                  {/* Icon */}
                  <div className={`doc-icon-wrap di-${cat}`}>
                    <FileIcon category={cat} />
                  </div>

                  {/* Info */}
                  <div className="doc-info">
                    <div className="doc-name">{doc.original_filename}</div>
                    <div className="doc-meta">
                      {formatSize(doc.file_size)} · {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Type badge */}
                  <span className={`doc-type-badge dtb-${cat}`}>{TYPE_LABELS[cat]}</span>

                  {/* Actions */}
                  <div className="doc-actions">
                    {/* Download */}
                    <button
                      className="doc-btn"
                      title="Download"
                      onClick={e => { e.stopPropagation(); documentApi.download(doc.id, doc.original_filename); }}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                    </button>

                    {/* Delete */}
                    {!disabled && (
                      <button
                        className="doc-btn delete"
                        title="Delete"
                        disabled={deletingId === doc.id}
                        onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
                      >
                        {deletingId === doc.id
                          ? <svg className="spin" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                          : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {docs.length === 0 && disabled && (
          <p className="docs-empty">No documents uploaded yet</p>
        )}

      </div>
    </>
  );
};

export default StepDocuments;