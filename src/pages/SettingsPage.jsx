import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const {
    theme, toggleTheme,
    largeText, toggleLargeText,
    highContrast, toggleHighContrast,
    simpleMode, toggleSimpleMode,
    unitSystem, setUnitSystem,
  } = useTheme();


  const handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('ld-lang', lang);
  };

  const Toggle = ({ checked, onChange, label }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{label}</span>
      <button
        onClick={onChange}
        style={{
          width: '52px', height: '28px', borderRadius: '14px',
          background: checked ? '#0F766E' : 'var(--border-color)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: 'white', position: 'absolute',
          top: '3px', left: checked ? '27px' : '3px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 className="animate-slide-up" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        ⚙️ {t('settings.title')}
      </h1>

      {/* Language */}
      <div className="card animate-slide-up" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>🌍 {t('settings.language')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLangChange(lang.code)}
              className={`btn ${i18n.language === lang.code ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Theme & Accessibility */}
      <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>🎨 Appearance & Accessibility</h2>
        <Toggle checked={theme === 'dark'} onChange={toggleTheme} label={`${t('settings.theme')}: ${theme === 'dark' ? t('settings.dark') : t('settings.light')}`} />
        <Toggle checked={largeText} onChange={toggleLargeText} label={`🔤 ${t('settings.text_size')}`} />
        <Toggle checked={highContrast} onChange={toggleHighContrast} label={`🔲 ${t('settings.high_contrast')}`} />
        <Toggle checked={simpleMode} onChange={toggleSimpleMode} label={`📝 ${t('settings.simple_mode')}`} />
      </div>

      {/* Unit System */}
      <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>📐 {t('settings.unit_system')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setUnitSystem('conventional')}
            className={`btn ${unitSystem === 'conventional' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.9rem' }}
          >
            Conventional (US) — mg/dL
          </button>
          <button
            onClick={() => setUnitSystem('si')}
            className={`btn ${unitSystem === 'si' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.9rem' }}
          >
            SI (International) — mmol/L
          </button>
        </div>
      </div>


    </div>
  );
}
