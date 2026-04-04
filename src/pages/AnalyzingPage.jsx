import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analyzeReport } from '../services/claudeService';

const STEPS = ['reading', 'identifying', 'categorizing', 'generating', 'almost'];

export default function AnalyzingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Progress steps
    const interval = setInterval(() => {
      setStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    runAnalysis().finally(() => clearInterval(interval));
  }, []);

  const runAnalysis = async () => {
    const contentStr = sessionStorage.getItem('ld-upload-content');
    const contextStr = sessionStorage.getItem('ld-user-context');

    if (!contentStr) {
      setError('No report content found to analyze. Please go back and upload a report.');
      return;
    }

    try {
      const content = JSON.parse(contentStr);
      const userContext = contextStr ? JSON.parse(contextStr) : {};
      const analysis = await analyzeReport(content, userContext);
      sessionStorage.setItem('ld-analysis-result', JSON.stringify(analysis));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessages = {
        'NO_API_KEY': t('errors.no_api_key'),
        'RATE_LIMITED': t('errors.rate_limit'),
        'HOURLY_LIMIT': "You've reached the maximum number of analyses for this hour. Please try again later.",
        'OFFLINE': 'You appear to be offline. Please check your internet connection and try again.',
        'TIMEOUT': 'The analysis timed out. Please try again — this usually resolves on retry. If it persists, try uploading a clearer or smaller image.',
        'EMPTY_RESPONSE': "We couldn't extract any parameters from this report. Please verify it's a lab test report and try again.",
        'NOT_LAB_REPORT': "This doesn't appear to be a medical lab report, or we couldn't find any test parameters in it. Please upload a lab test report.",
        'PARSE_ERROR': 'We had trouble reading the AI response. Please try again.',
        'API_ERROR': 'The analysis service returned an error. Please try again. If the problem persists, the report may be too large or in an unsupported format.',
        'NETWORK_ERROR': 'Unable to connect to the analysis service. Please check your internet connection and try again.',
      };
      setError(errorMessages[err.message] || t('errors.analysis_failed'));
    }
  };

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {error ? (
        <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>&#x1F614;</span>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              Upload Again
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setError(null);
              setStep(0);
              hasStarted.current = false;
              // Re-trigger analysis
              const interval = setInterval(() => {
                setStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
              }, 2500);
              runAnalysis().finally(() => clearInterval(interval));
            }}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
          {/* Animated DNA helix */}
          <div style={{ marginBottom: '2rem', fontSize: '4rem' }}>
            <span className="animate-spin" style={{ display: 'inline-block' }}>&#x1F9EC;</span>
          </div>

          {/* Progress steps */}
          <div style={{ marginBottom: '2rem' }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={i <= step ? 'animate-slide-up' : ''}
                style={{
                  padding: '0.5rem 0',
                  fontSize: '1rem',
                  color: i === step ? '#0F766E' : i < step ? 'var(--text-muted)' : 'transparent',
                  fontWeight: i === step ? 600 : 400,
                  transition: 'all 0.5s ease',
                  display: i > step + 1 ? 'none' : 'block',
                }}
              >
                {i < step && '✓ '}
                {i === step && (
                  <span className="animate-pulse" style={{ display: 'inline-block' }}>●</span>
                )}{' '}
                {t(`analyzing.${s}`)}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            width: '300px',
            maxWidth: '80vw',
            height: '4px',
            background: 'var(--bg-secondary)',
            borderRadius: '2px',
            overflow: 'hidden',
            margin: '0 auto',
          }}>
            <div style={{
              height: '100%',
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #0F766E, #14B8A6)',
              borderRadius: '2px',
              transition: 'width 0.5s ease',
            }} />
          </div>

          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            This usually takes 5–10 seconds
          </p>
        </div>
      )}
    </div>
  );
}
