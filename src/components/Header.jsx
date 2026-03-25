import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: '🏠' },
    { path: '/upload', label: t('nav.upload'), icon: '📄' },
    { path: '/history', label: t('nav.history'), icon: '📋' },
    { path: '/compare', label: t('nav.compare'), icon: '📊' },
    { path: '/settings', label: t('nav.settings'), icon: '⚙️' },
  ];

  return (
    <header className="no-print" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(250, 250, 249, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          color: 'var(--text-primary)',
        }}>
          <span style={{ fontSize: '1.75rem' }}>🧬</span>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>LabDecode</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: location.pathname === item.path ? '#0F766E' : 'var(--text-secondary)',
                background: location.pathname === item.path
                  ? (theme === 'dark' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(15, 118, 110, 0.08)')
                  : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="nav-icon" style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          <button onClick={toggleTheme} className="btn-ghost" style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            background: 'transparent',
            marginLeft: '0.25rem',
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-label { display: none; }
          .nav-icon { font-size: 1.25rem !important; }
        }
      `}</style>
    </header>
  );
}
