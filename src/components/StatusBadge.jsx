import { useTranslation } from 'react-i18next';

const statusConfig = {
  excellent: { color: '#10B981', bg: 'var(--bg-status-excellent)', icon: '🟢' },
  normal: { color: '#0EA5E9', bg: 'var(--bg-status-normal)', icon: '🔵' },
  needs_attention: { color: '#F59E0B', bg: 'var(--bg-status-attention)', icon: '🟡' },
  review_recommended: { color: '#FB7185', bg: 'var(--bg-status-review)', icon: '🔴' },
};

const statusKeys = {
  excellent: 'status.excellent',
  normal: 'status.normal',
  needs_attention: 'status.needs_attention',
  review_recommended: 'status.review_recommended',
};

export default function StatusBadge({ status, showIcon = true, size = 'md' }) {
  const { t } = useTranslation();
  const cfg = statusConfig[status] || statusConfig.normal;
  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: isSmall ? '0.2rem 0.5rem' : '0.3rem 0.75rem',
      borderRadius: '999px',
      fontSize: isSmall ? '0.7rem' : '0.8rem',
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      whiteSpace: 'nowrap',
    }}>
      {showIcon && <span style={{ fontSize: isSmall ? '0.5rem' : '0.6rem' }}>{cfg.icon}</span>}
      {t(statusKeys[status] || 'status.normal')}
    </span>
  );
}

export function getStatusConfig(status) {
  return statusConfig[status] || statusConfig.normal;
}
