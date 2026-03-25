import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatusBadge from './StatusBadge';
import RangeBar from './RangeBar';
import DisclaimerBanner from './DisclaimerBanner';

export default function ParameterDetail({ parameter, simple = false }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const p = parameter;

  const ref = p.reference_range || {};

  return (
    <div className="card animate-slide-up" style={{ marginBottom: '0.75rem' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</span>
            {p.abbreviation && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({p.abbreviation})</span>
            )}
            <StatusBadge status={p.status} size="sm" />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{p.value}</strong> {p.unit}
            {ref.low !== undefined && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ref: {ref.low} – {ref.high} {ref.unit || p.unit}
              </span>
            )}
          </div>
        </div>
        <span style={{
          transition: 'transform 0.2s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}>▼</span>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', animation: 'slideDown 0.3s ease' }}>
          {/* Range Bar */}
          {ref.low !== undefined && (
            <RangeBar 
              value={p.value}
              low={ref.low}
              high={ref.high}
              unit={p.unit}
            />
          )}

          {/* What is this */}
          {p.explanation && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {t('parameter.what_is')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.explanation}</p>
            </div>
          )}

          {!simple && (
            <>
              {/* Why it matters */}
              {p.why_it_matters && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {t('parameter.why_matters')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.why_it_matters}</p>
                </div>
              )}

              {/* Influences */}
              {p.influences && p.influences.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    {t('parameter.influences')}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {p.influences.map((inf, i) => (
                      <span key={i} style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'var(--bg-secondary)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                      }}>{inf}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialist */}
              {p.specialist && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {t('parameter.specialist')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>👨‍⚕️ {p.specialist}</p>
                </div>
              )}

              {/* Lifestyle Suggestions */}
              {p.lifestyle_suggestions && p.lifestyle_suggestions.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    Suggestions
                  </h4>
                  {p.lifestyle_suggestions.map((s, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.5rem',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                    }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)' }}>{s.suggestion}</p>
                      {s.source && (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          📚 {s.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Critical range disclaimer */}
          {p.status === 'review_recommended' && (
            <DisclaimerBanner textKey="disclaimers.critical_value" style={{ marginTop: '0.75rem' }} />
          )}
          {p.status === 'review_recommended' && (
            <a
              href={`https://www.google.com/maps/search/doctor+near+me`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: '#0F766E',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              📍 {t('disclaimers.find_doctor')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
