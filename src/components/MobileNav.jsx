import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/dashboard', label: 'Results', icon: '📊' },
  { path: '/lifestyle', label: 'Tips', icon: '🌿' },
  { path: '/history', label: 'History', icon: '📋' },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="no-print" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.375rem 0',
        paddingBottom: 'env(safe-area-inset-bottom, 0.375rem)',
      }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.125rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0F766E' : 'var(--text-muted)',
                background: isActive ? 'rgba(15,118,110,0.08)' : 'transparent',
                minWidth: '56px',
                minHeight: '44px',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button — Upload */}
      <button
        className="no-print"
        onClick={() => navigate('/upload')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '1rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 15px rgba(15,118,110,0.4)',
          zIndex: 49,
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
        aria-label="Upload new report"
      >
        📤
      </button>

      <style>{`
        @media (max-width: 768px) {
          nav[style] { display: flex !important; }
          button[aria-label="Upload new report"] { display: flex !important; }
        }
      `}</style>
    </>
  );
}
