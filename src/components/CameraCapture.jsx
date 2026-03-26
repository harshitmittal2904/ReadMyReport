import { useState, useRef, useCallback, useEffect } from 'react';
import { compressBase64Image } from '../utils/imageCompression';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);
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
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. You can upload a photo from your gallery instead.'
          : 'Camera not available on this device. You can upload a photo from your gallery instead.'
      );
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Compress the captured image
    try {
      const compressed = await compressBase64Image(dataUrl);
      setCaptured(prev => [...prev, {
        preview: dataUrl,
        data: compressed.data,
        mediaType: compressed.mediaType,
      }]);
    } catch {
      // Fallback: use uncompressed
      setCaptured(prev => [...prev, {
        preview: dataUrl,
        data: dataUrl.split(',')[1],
        mediaType: 'image/jpeg',
      }]);
    }
  };

  const switchCamera = () => {
    setFacingMode(f => f === 'environment' ? 'user' : 'environment');
  };

  const done = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    const images = captured.map(c => ({
      data: c.data,
      mediaType: c.mediaType,
      preview: c.preview,
    }));
    onCapture(images);
  };

  const removeCapture = (idx) => {
    setCaptured(prev => prev.filter((_, i) => i !== idx));
  };

  // Handle gallery fallback when camera is unavailable
  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setCaptured(prev => [...prev, {
          preview: previewUrl,
          data: dataUrl.split(',')[1],
          mediaType: file.type || 'image/jpeg',
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera error state — show gallery fallback
  if (error) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</span>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', lineHeight: 1.6 }}>
          {error}
        </p>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleGallerySelect}
        />

        {captured.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {captured.map((c, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={c.preview} alt={`Page ${i + 1}`} style={{
                  width: '80px', height: '100px', objectFit: 'cover', borderRadius: '8px',
                }} />
                <button onClick={() => removeCapture(i)} style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#FB7185', color: 'white', border: 'none',
                  fontSize: '0.7rem', cursor: 'pointer',
                }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => galleryInputRef.current?.click()}
            style={{ minHeight: '44px' }}>
            🖼️ Upload from Gallery
          </button>
          {captured.length > 0 && (
            <button className="btn btn-primary" onClick={done} style={{ minHeight: '44px' }}>
              ✓ Use {captured.length} {captured.length === 1 ? 'photo' : 'photos'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose} style={{ minHeight: '44px' }}>
            Go Back
          </button>
        </div>
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
          {captured.map((c, i) => (
            <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
              <img src={c.preview} alt={`Page ${i + 1}`} style={{
                width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px',
              }} />
              <button onClick={() => removeCapture(i)} style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '22px', height: '22px', borderRadius: '50%',
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
          width: '50px', height: '50px', minWidth: '50px', minHeight: '50px',
          color: 'white', fontSize: '1.5rem', cursor: 'pointer',
        }}>✕</button>

        <button onClick={capture} style={{
          width: '70px', height: '70px', minWidth: '70px', minHeight: '70px',
          borderRadius: '50%',
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
          width: '50px', height: '50px', minWidth: '50px', minHeight: '50px',
          color: 'white', fontSize: '1.25rem', cursor: 'pointer',
        }}>🔄</button>
      </div>

      {captured.length > 0 && (
        <button onClick={done} className="btn btn-primary" style={{
          position: 'absolute', bottom: '7rem', right: '1rem',
          padding: '0.5rem 1rem',
          minHeight: '44px',
        }}>
          ✓ Done ({captured.length} {captured.length === 1 ? 'page' : 'pages'})
        </button>
      )}
    </div>
  );
}
