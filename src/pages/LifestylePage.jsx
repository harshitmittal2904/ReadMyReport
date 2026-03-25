import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DisclaimerBanner from '../components/DisclaimerBanner';

const categoryIcons = {
  nutrition: '🥗',
  movement: '🏃',
  sleep: '😴',
  hydration: '💧',
  supplements_to_discuss: '💊',
};

const categoryKeys = {
  nutrition: 'lifestyle.nutrition',
  movement: 'lifestyle.movement',
  sleep: 'lifestyle.sleep',
  hydration: 'lifestyle.hydration',
  supplements_to_discuss: 'lifestyle.supplements',
};

export default function LifestylePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('ld-analysis-result');
    if (data) {
      try { setAnalysis(JSON.parse(data)); }
      catch { navigate('/dashboard', { replace: true }); }
    } else {
      navigate('/upload', { replace: true });
    }
  }, []);

  if (!analysis) return null;

  const suggestions = analysis.overall_lifestyle || [];
  const grouped = {};
  suggestions.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div className="animate-slide-up" style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🌿 {t('lifestyle.title')}
        </h1>
      </div>

      <DisclaimerBanner textKey="lifestyle.disclaimer" style={{ marginBottom: '1.5rem' }} />

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="card animate-slide-up" style={{ marginBottom: '1rem' }}>
          <h2 style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem',
          }}>
            <span>{categoryIcons[category] || '📌'}</span>
            {(() => {
              let name = t(categoryKeys[category] || category);
              if (name === category) {
                name = category.split(/_|-/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              }
              return name;
            })()}
          </h2>
          {items.map((item, i) => (
            <div key={i} style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.75rem',
            }}>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {item.suggestion}
              </p>
              {item.source && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                  📚 {item.source}
                </p>
              )}
              {item.related_parameters && item.related_parameters.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                  {item.related_parameters.map((rp, j) => (
                    <span key={j} style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: 'var(--bg-card)',
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}>{rp}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {suggestions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>All your values look great!</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No specific lifestyle suggestions needed at this time.</p>
        </div>
      )}

      <div className="disclaimer-banner" style={{ marginTop: '1.5rem' }}>
        <span>💡</span>
        <span>{t('disclaimers.lifestyle_footer')}</span>
      </div>
    </div>
  );
}
