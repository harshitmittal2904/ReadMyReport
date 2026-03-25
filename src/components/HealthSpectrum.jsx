export default function HealthSpectrum({ parameters }) {
  if (!parameters || parameters.length === 0) return null;

  const counts = { excellent: 0, normal: 0, needs_attention: 0, review_recommended: 0 };
  parameters.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });

  const total = parameters.length;
  const goodPercent = ((counts.excellent + counts.normal) / total) * 100;

  let label, gradient, emoji;
  if (goodPercent >= 80) {
    label = 'Most values look good';
    gradient = 'linear-gradient(135deg, #10B981, #14B8A6)';
    emoji = '💚';
  } else if (goodPercent >= 50) {
    label = 'Some values need attention';
    gradient = 'linear-gradient(135deg, #F59E0B, #FBBF24)';
    emoji = '💛';
  } else {
    label = 'Several values need review';
    gradient = 'linear-gradient(135deg, #FB7185, #F59E0B)';
    emoji = '🧡';
  }

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem',
      }}>
        <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
        <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      {/* Spectrum bar */}
      <div style={{
        height: '10px',
        borderRadius: '5px',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
        display: 'flex',
      }}>
        {counts.excellent > 0 && (
          <div style={{ width: `${(counts.excellent / total) * 100}%`, background: '#10B981', transition: 'width 0.5s ease' }} />
        )}
        {counts.normal > 0 && (
          <div style={{ width: `${(counts.normal / total) * 100}%`, background: '#0EA5E9', transition: 'width 0.5s ease' }} />
        )}
        {counts.needs_attention > 0 && (
          <div style={{ width: `${(counts.needs_attention / total) * 100}%`, background: '#F59E0B', transition: 'width 0.5s ease' }} />
        )}
        {counts.review_recommended > 0 && (
          <div style={{ width: `${(counts.review_recommended / total) * 100}%`, background: '#FB7185', transition: 'width 0.5s ease' }} />
        )}
      </div>
      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}>
        <span>🟢 {counts.excellent} Excellent</span>
        <span>🔵 {counts.normal} Normal</span>
        <span>🟡 {counts.needs_attention} Attention</span>
        <span>🔴 {counts.review_recommended} Review</span>
      </div>
    </div>
  );
}
