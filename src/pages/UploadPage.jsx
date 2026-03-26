import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CameraCapture from '../components/CameraCapture';
import { processPDF, processImages } from '../services/pdfService';

export default function UploadPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState(null); // 'pdf' | 'image' | 'camera'
  const [error, setError] = useState(null);

  const handlePDFSelect = async (selectedFiles) => {
    setError(null);
    const fileList = Array.from(selectedFiles);
    const pdfFile = fileList.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFile) {
      setFiles([pdfFile]);
      setPreviews([{ name: pdfFile.name, type: 'pdf', size: (pdfFile.size / 1024).toFixed(1) + ' KB' }]);
      setUploadMode('pdf');
    }
  };

  const handleImageSelect = async (selectedFiles) => {
    setError(null);
    const fileList = Array.from(selectedFiles);
    const imageFiles = fileList.filter(f => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic'));
    if (imageFiles.length === 0) return;
    const newPreviews = [];
    for (const file of imageFiles) {
      const url = URL.createObjectURL(file);
      newPreviews.push({ name: file.name, type: 'image', url, file });
    }
    setFiles(prev => [...prev, ...imageFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setUploadMode('image');
  };

  const handleCameraCapture = (capturedImages) => {
    setShowCamera(false);
    setError(null);
    if (!capturedImages || capturedImages.length === 0) return;
    const newPreviews = capturedImages.map((img, i) => ({
      name: `Camera page ${previews.length + i + 1}`,
      type: 'camera',
      url: img.preview,
      data: img.data,
      mediaType: img.mediaType,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
    setUploadMode('camera');
  };

  const handleFileInput = (e) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    // Check if first file is PDF (by type or extension for mobile compatibility)
    const first = selected[0];
    if (first.type === 'application/pdf' || first.name.toLowerCase().endsWith('.pdf')) {
      handlePDFSelect(selected);
    } else {
      handleImageSelect(selected);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles[0]?.type === 'application/pdf') {
      handlePDFSelect(droppedFiles);
    } else {
      handleImageSelect(droppedFiles);
    }
  };

  const removePreview = (idx) => {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
    setFiles(prev => prev.filter((_, i) => i !== idx));
    if (previews.length <= 1) {
      setUploadMode(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (processing) return; // Prevent double-click

    // Offline check
    if (!navigator.onLine) {
      setError('You appear to be offline. Please check your internet connection and try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      let content;

      if (uploadMode === 'pdf' && files[0]) {
        content = await processPDF(files[0]);
      } else if (uploadMode === 'camera') {
        const images = previews
          .filter(p => p.data)
          .map(p => ({ data: p.data, mediaType: p.mediaType }));
        if (images.length === 0) {
          throw new Error('NO_IMAGES');
        }
        content = { images, mode: 'vision' };
      } else if (uploadMode === 'image' && files.length > 0) {
        content = await processImages(files);
      } else {
        throw new Error('NO_CONTENT');
      }

      // Validate content was created
      if (!content || (!content.text && (!content.images || content.images.length === 0))) {
        throw new Error('EMPTY_CONTENT');
      }

      // Try to store in sessionStorage (can fail if content too large)
      try {
        const contentStr = JSON.stringify(content);
        sessionStorage.setItem('ld-upload-content', contentStr);
      } catch (storageErr) {
        console.error('sessionStorage error:', storageErr);
        throw new Error('STORAGE_FULL');
      }

      navigate('/pre-analysis');
    } catch (err) {
      console.error('Processing error:', err);
      setProcessing(false);

      // Show user-friendly error messages
      switch (err.message) {
        case 'ENCRYPTED_PDF':
          setError('This PDF is password-protected. Please upload an unprotected version of your report.');
          break;
        case 'PDF_UNREADABLE':
          setError("We couldn't read your PDF. Try uploading a higher-quality scan or take a photo of each page instead.");
          break;
        case 'STORAGE_FULL':
          setError('Your report is too large to process. Try uploading fewer pages or a lower-resolution image.');
          break;
        case 'NO_IMAGES':
        case 'NO_CONTENT':
        case 'EMPTY_CONTENT':
          setError('No content found to analyze. Please upload your report again.');
          break;
        default:
          setError("Something went wrong while processing your report. Please try again, or use a different file format.");
          break;
      }
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('upload.title')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('upload.subtitle')}</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="animate-fade-in" style={{
          background: 'linear-gradient(135deg, #FEF2F2, #FECACA)',
          border: '1px solid #F87171',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.625rem',
          fontSize: '0.9rem',
          color: '#991B1B',
          lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>&#x26A0;&#xFE0F;</span>
          <div>
            <p style={{ margin: 0 }}>{error}</p>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none', border: 'none', color: '#DC2626',
                fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0',
                fontSize: '0.85rem', marginTop: '0.25rem',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      {previews.length === 0 ? (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Drag-and-drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? '#0F766E' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius)',
              padding: '3rem 2rem',
              minHeight: '30vh',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(15,118,110,0.05)' : 'var(--bg-card)',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📄</span>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {t('upload.drag_drop')}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('upload.supported_formats')}</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => { handleImageSelect(e.target.files); e.target.value = ''; }}
          />

          {/* Option Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            <div className="card card-interactive" onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: '100px' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('upload.pdf_title')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('upload.pdf_desc')}</p>
              </div>
            </div>
            <div className="card card-interactive" onClick={() => setShowCamera(true)}
              style={{ minHeight: '100px' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📸</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('upload.camera_title')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('upload.camera_desc')}</p>
              </div>
            </div>
            <div className="card card-interactive" onClick={() => imageInputRef.current?.click()}
              style={{ minHeight: '100px' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🖼️</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('upload.image_title')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('upload.image_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Section */
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{t('upload.preview_title')}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {previews.map((preview, i) => (
              <div key={i} className="card" style={{ position: 'relative', padding: '0.75rem' }}>
                {preview.type === 'pdf' ? (
                  <div style={{
                    height: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>📄</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'center', wordBreak: 'break-all', padding: '0 0.25rem' }}>{preview.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{preview.size}</span>
                  </div>
                ) : (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                )}
                <button onClick={() => removePreview(i)} style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#FB7185', color: 'white', border: 'none',
                  cursor: 'pointer', fontSize: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>&#x2715;</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {uploadMode === 'camera' && (
              <button className="btn btn-secondary" onClick={() => setShowCamera(true)}>
                📷 {t('upload.add_more')}
              </button>
            )}
            {uploadMode === 'image' && (
              <button className="btn btn-secondary" onClick={() => imageInputRef.current?.click()}>
                🖼️ {t('upload.add_more')}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={processing}
              style={{
                minWidth: '200px',
                minHeight: '48px',
                opacity: processing ? 0.7 : 1,
                pointerEvents: processing ? 'none' : 'auto',
              }}
            >
              {processing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>&#x2728; {t('upload.looks_good')}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
