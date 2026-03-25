import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="no-print" style={{
      borderTop: '1px solid var(--border-color)',
      padding: '1.5rem',
      textAlign: 'center',
      marginTop: 'auto',
      background: 'var(--bg-secondary)',
    }}>
      <p style={{
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        maxWidth: '700px',
        margin: '0 auto',
        lineHeight: 1.6,
      }}>
        {t('disclaimers.footer')}
      </p>
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.5rem',
        opacity: 0.7,
      }}>
        © {new Date().getFullYear()} LabDecode · Educational Tool
      </p>
    </footer>
  );
}
