import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';

const systemIcons = {
  heart_cardiovascular: '❤️',
  liver: '🫐',
  kidneys: '🫘',
  blood_immunity: '🩸',
  thyroid: '🦋',
  pancreas_metabolism: '⚡',
  bones_joints: '🦴',
  vitamins_minerals: '💊',
  hormones: '🧪',
  inflammation_infection: '🛡️',
};

const systemKeys = {
  heart_cardiovascular: 'organs.heart_cardiovascular',
  liver: 'organs.liver',
  kidneys: 'organs.kidneys',
  blood_immunity: 'organs.blood_immunity',
  thyroid: 'organs.thyroid',
  pancreas_metabolism: 'organs.pancreas_metabolism',
  bones_joints: 'organs.bones_joints',
  vitamins_minerals: 'organs.vitamins_minerals',
  hormones: 'organs.hormones',
  inflammation_infection: 'organs.inflammation_infection',
};

export default function OrganSystemCard({ system, parameters, onClick, expanded }) {
  const { t } = useTranslation();
  const icon = systemIcons[system] || '🔬';
  let name = t(systemKeys[system] || system);
  
  // If no translation was found, i18next returns the key. Format it nicely (e.g., "eye_test" -> "Eye Test")
  if (name === system) {
    name = system.split(/_|-/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Determine worst status in params
  const statuses = parameters.map(p => p.status);
  let overallStatus = 'excellent';
  if (statuses.includes('review_recommended')) overallStatus = 'review_recommended';
  else if (statuses.includes('needs_attention')) overallStatus = 'needs_attention';
  else if (statuses.includes('normal')) overallStatus = 'normal';

  return (
    <div
      className="card card-interactive"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{icon}</span>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {parameters.length} {parameters.length === 1 ? 'parameter' : 'parameters'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={overallStatus} size="sm" />
          <span style={{
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>▼</span>
        </div>
      </div>
    </div>
  );
}

export { systemIcons, systemKeys };
