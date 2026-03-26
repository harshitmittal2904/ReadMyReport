import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
const SEX_OPTIONS = ['male', 'female', 'prefer_not_to_say'];
const CONDITIONS = ['diabetes', 'thyroid', 'heart', 'kidney', 'anemia', 'none'];

export default function PreAnalysisPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [ageRange, setAgeRange] = useState(null);
  const [sex, setSex] = useState(null);
  const [pregnant, setPregnant] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [skipped, setSkipped] = useState(false);

  const handleConditionToggle = (condition) => {
    if (condition === 'none') {
      setConditions(['none']);
      return;
    }
    setConditions(prev => {
      const without = prev.filter(c => c !== 'none');
      return without.includes(condition)
        ? without.filter(c => c !== condition)
        : [...without, condition];
    });
  };

  const handleSkip = () => {
    setSkipped(true);
    sessionStorage.removeItem('ld-user-context');
    navigate('/analyzing');
  };

  const handleContinue = () => {
    const context = {
      ageRange,
      sex,
      pregnant: sex === 'female' ? pregnant : null,
      conditions: conditions.includes('none') ? [] : conditions,
    };
    sessionStorage.setItem('ld-user-context', JSON.stringify(context));
    navigate('/analyzing');
  };

  const chipStyle = (isSelected) => ({
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: isSelected ? '2px solid #0F766E' : '2px solid var(--border-color)',
    background: isSelected ? 'rgba(15, 118, 110, 0.1)' : 'var(--bg-card)',
    color: isSelected ? '#0F766E' : 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: isSelected ? 600 : 400,
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {t('preanalysis.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t('preanalysis.subtitle')}
        </p>
      </div>

      {/* Age Range */}
      <div className="card animate-slide-up" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {t('preanalysis.age_range')}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {AGE_RANGES.map(range => (
            <button
              key={range}
              onClick={() => setAgeRange(range)}
              className={`btn ${ageRange === range ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Biological Sex */}
      <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {t('preanalysis.biological_sex')}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SEX_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => {
                setSex(option);
                if (option !== 'female') setPregnant(null);
              }}
              className={`btn ${sex === option ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {t(`preanalysis.sex_${option}`)}
            </button>
          ))}
        </div>

        {/* Pregnancy sub-question */}
        {sex === 'female' && (
          <div className="animate-fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {t('preanalysis.pregnant')}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setPregnant(true)}
                className={`btn ${pregnant === true ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                {t('preanalysis.yes')}
              </button>
              <button
                onClick={() => setPregnant(false)}
                className={`btn ${pregnant === false ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                {t('preanalysis.no')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Known Conditions */}
      <div className="card animate-slide-up" style={{ marginBottom: '1.5rem', animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {t('preanalysis.conditions')}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CONDITIONS.map(condition => {
            const isSelected = conditions.includes(condition);
            return (
              <button
                key={condition}
                onClick={() => handleConditionToggle(condition)}
                style={chipStyle(isSelected)}
              >
                {isSelected ? '\u2713 ' : ''}{t(`preanalysis.condition_${condition}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="animate-slide-up" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        animationDelay: '0.15s',
      }}>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          style={{ width: '100%', minHeight: '48px', fontSize: '1rem', fontWeight: 600 }}
        >
          {t('preanalysis.continue')}
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleSkip}
          style={{ width: '100%', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
        >
          {t('preanalysis.skip')}
        </button>
      </div>

      {/* Skip note */}
      {skipped && (
        <div className="animate-fade-in" style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          {t('preanalysis.skip_note')}
        </div>
      )}
    </div>
  );
}
