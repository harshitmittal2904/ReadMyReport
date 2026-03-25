import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CameraCapture({ onCapture, onClose }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState([]);

  const startCamera = useCallback(async () => {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError(t('errors.camera_denied'));
    }
  }, [facingMode, t]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(prev => [...prev, dataUrl]);
  };

  const switchCamera = () => {
    setFacingMode(f => f === 'environment' ? 'user' : 'environment');
  };

  const done = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    const images = captured.map(dataUrl => ({
      data: dataUrl.split(',')[1],
      mediaType: 'image/jpeg',
      preview: dataUrl,
    }));
    onCapture(images);
  };

  const removeCapture = (idx) => {
    setCaptured(prev => prev.filter((_, i) => i !== idx));
  };

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>📷 {error}</p>
        <button className="btn btn-secondary" onClick={onClose}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ flex: 1, objectFit: 'cover', width: '100%' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Captured thumbnails */}
      {captured.length > 0 && (
        <div style={{
          position: 'absolute', top: '1rem', left: '1rem', right: '1rem',
          display: 'flex', gap: '0.5rem', overflowX: 'auto',
          padding: '0.5rem',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '8px',
        }}>
          {captured.map((img, i) => (
            <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
              <img src={img} alt={`Page ${i + 1}`} style={{
                width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px',
              }} />
              <button onClick={() => removeCapture(i)} style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#FB7185', color: 'white', border: 'none',
                fontSize: '0.7rem', cursor: 'pointer',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        background: 'rgba(0,0,0,0.6)',
      }}>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
          width: '50px', height: '50px', color: 'white', fontSize: '1.5rem', cursor: 'pointer',
        }}>✕</button>

        <button onClick={capture} style={{
          width: '70px', height: '70px', borderRadius: '50%',
          border: '4px solid white', background: 'rgba(255,255,255,0.2)',
          cursor: 'pointer',
        }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%', background: 'white',
            margin: 'auto',
          }} />
        </button>

        <button onClick={switchCamera} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
          width: '50px', height: '50px', color: 'white', fontSize: '1.25rem', cursor: 'pointer',
        }}>🔄</button>
      </div>

      {captured.length > 0 && (
        <button onClick={done} className="btn btn-primary" style={{
          position: 'absolute', bottom: '7rem', right: '1rem',
          padding: '0.5rem 1rem',
        }}>
          ✓ Done ({captured.length} {captured.length === 1 ? 'page' : 'pages'})
        </button>
      )}
    </div>
  );
}
