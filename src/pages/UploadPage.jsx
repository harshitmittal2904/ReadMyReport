import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CameraCapture from '../components/CameraCapture';
import { processPDF, processImages, processImage } from '../services/pdfService';

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

  const handlePDFSelect = async (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    const pdfFile = fileList.find(f => f.type === 'application/pdf');
    if (pdfFile) {
      setFiles([pdfFile]);
      setPreviews([{ name: pdfFile.name, type: 'pdf', size: (pdfFile.size / 1024).toFixed(1) + ' KB' }]);
      setUploadMode('pdf');
    }
  };

  const handleImageSelect = async (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    const imageFiles = fileList.filter(f => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic'));
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
    if (previews.length <= 1) setUploadMode(null);
  };

  const handleAnalyze = async () => {
    setProcessing(true);
    try {
      let content;
      if (uploadMode === 'pdf' && files[0]) {
        content = await processPDF(files[0]);
      } else if (uploadMode === 'camera') {
        const images = previews.map(p => ({ data: p.data, mediaType: p.mediaType }));
        content = { images, mode: 'vision' };
      } else if (uploadMode === 'image') {
        content = await processImages(files);
      }
      // Store processed content and navigate to pre-analysis form
      sessionStorage.setItem('ld-upload-content', JSON.stringify(content));
      navigate('/pre-analysis');
    } catch (error) {
      console.error('Processing error:', error);
      setProcessing(false);
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
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(15,118,110,0.05)' : 'var(--bg-card)',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
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
            accept=".pdf,.jpg,.jpeg,.png,.heic"
            multiple
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files[0]?.type === 'application/pdf') handlePDFSelect(e.target.files);
              else handleImageSelect(e.target.files);
            }}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleImageSelect(e.target.files)}
          />

          {/* Option Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            <div className="card card-interactive" onClick={() => fileInputRef.current?.click()}>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('upload.pdf_title')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('upload.pdf_desc')}</p>
              </div>
            </div>
            <div className="card card-interactive" onClick={() => setShowCamera(true)}>
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📸</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('upload.camera_title')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('upload.camera_desc')}</p>
              </div>
            </div>
            <div className="card card-interactive" onClick={() => imageInputRef.current?.click()}>
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{preview.name}</span>
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
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#FB7185', color: 'white', border: 'none',
                  cursor: 'pointer', fontSize: '0.75rem',
                }}>✕</button>
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
              style={{ minWidth: '200px' }}
            >
              {processing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>✨ {t('upload.looks_good')}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
