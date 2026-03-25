export default function RangeBar({ value, low, high, optimalLow, optimalHigh, unit }) {
  // Calculate positions on the bar (0-100%)
  const rangeSpan = high - low;
  const padding = rangeSpan * 0.3; // 30% padding on each side
  const scaleMin = low - padding;
  const scaleMax = high + padding;
  const totalSpan = scaleMax - scaleMin;

  const toPercent = (val) => Math.max(0, Math.min(100, ((val - scaleMin) / totalSpan) * 100));

  const lowPos = toPercent(low);
  const highPos = toPercent(high);
  const valuePos = toPercent(parseFloat(value));
  const optLowPos = optimalLow ? toPercent(optimalLow) : null;
  const optHighPos = optimalHigh ? toPercent(optimalHigh) : null;

  const v = parseFloat(value);
  let markerColor = '#0EA5E9'; // normal blue
  if (optimalLow && optimalHigh && v >= optimalLow && v <= optimalHigh) {
    markerColor = '#10B981'; // excellent green
  } else if (v < low || v > high) {
    const deviation = v < low ? (low - v) / rangeSpan : (v - high) / rangeSpan;
    markerColor = deviation > 0.2 ? '#FB7185' : '#F59E0B'; // review red or attention amber
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{
        position: 'relative',
        height: '12px',
        borderRadius: '6px',
        background: 'var(--bg-secondary)',
        overflow: 'visible',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)',
      }}>
        {/* Normal range band */}
        <div style={{
          position: 'absolute',
          left: `${lowPos}%`,
          width: `${highPos - lowPos}%`,
          height: '100%',
          background: 'rgba(14, 165, 233, 0.2)',
          borderRadius: '6px',
        }} />
        {/* Optimal range band */}
        {optLowPos !== null && (
          <div style={{
            position: 'absolute',
            left: `${optLowPos}%`,
            width: `${optHighPos - optLowPos}%`,
            height: '100%',
            background: 'rgba(16, 185, 129, 0.25)',
            borderRadius: '4px',
          }} />
        )}
        {/* Value marker */}
        <div style={{
          position: 'absolute',
          left: `${valuePos}%`,
          top: '-3px',
          transform: 'translateX(-50%)',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: markerColor,
          border: '3px solid var(--bg-card)',
          boxShadow: `0 0 0 2px ${markerColor}40, 0 2px 4px rgba(0,0,0,0.2)`,
          zIndex: 2,
          transition: 'left 0.5s ease',
        }} />
        {/* Low label */}
        <span style={{
          position: 'absolute',
          left: `${lowPos}%`,
          top: '18px',
          transform: 'translateX(-50%)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}>{low}</span>
        {/* High label */}
        <span style={{
          position: 'absolute',
          left: `${highPos}%`,
          top: '18px',
          transform: 'translateX(-50%)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}>{high}</span>
      </div>
    </div>
  );
}
