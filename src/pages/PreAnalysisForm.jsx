import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PreAnalysisForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ age: '', sex: '', pregnant: false, conditions: '' });

  const handleSubmit = () => {
    sessionStorage.setItem('ld-user-context', JSON.stringify(form));
    navigate('/analyzing');
  };

  const handleSkip = () => {
    sessionStorage.setItem('ld-user-context', JSON.stringify({}));
    navigate('/analyzing');
  };

  return (
    <div style={{ maxWidth: '550px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🩺</span>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('preanalysis.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t('preanalysis.subtitle')}</p>
      </div>

      <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Age */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9rem' }}>
            {t('preanalysis.age')}
          </label>
          <input
            type="number"
            placeholder={t('preanalysis.age_placeholder')}
            value={form.age}
            onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
            min="0" max="120"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>

        {/* Sex */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9rem' }}>
            {t('preanalysis.sex')}
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['male', 'female', 'prefer_not'].map(opt => (
              <button
                key={opt}
                onClick={() => setForm(f => ({ ...f, sex: opt === 'prefer_not' ? '' : opt }))}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${form.sex === opt || (opt === 'prefer_not' && !form.sex) ? '#0F766E' : 'var(--border-color)'}`,
                  background: form.sex === opt || (opt === 'prefer_not' && !form.sex)
                    ? 'rgba(15,118,110,0.08)' : 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {t(`preanalysis.${opt}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Pregnancy */}
        {form.sex === 'female' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9rem' }}>
              {t('preanalysis.pregnant')}
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[true, false].map(opt => (
                <button
                  key={String(opt)}
                  onClick={() => setForm(f => ({ ...f, pregnant: opt }))}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${form.pregnant === opt ? '#0F766E' : 'var(--border-color)'}`,
                    background: form.pregnant === opt ? 'rgba(15,118,110,0.08)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  {opt ? t('preanalysis.yes') : t('preanalysis.no')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9rem' }}>
            {t('preanalysis.conditions')}
          </label>
          <input
            type="text"
            placeholder={t('preanalysis.conditions_placeholder')}
            value={form.conditions}
            onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
          💡 {t('preanalysis.note')}
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleSkip} style={{ flex: 1 }}>
            {t('preanalysis.skip')}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ flex: 1 }}>
            {t('preanalysis.continue')} →
          </button>
        </div>
      </div>
    </div>
  );
}
