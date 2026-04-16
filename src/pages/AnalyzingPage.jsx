import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analyzeReport } from '../services/claudeService';
import { validateAnalysis } from '../utils/validateAnalysis';

const STEPS = ['reading', 'identifying', 'categorizing', 'generating', 'almost'];

export default function AnalyzingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const hasStarted = useRef(false);

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

      // Cross-validate AI statuses against local reference ranges
      validateAnalysis(analysis);

      sessionStorage.setItem('ld-analysis-result', JSON.stringify(analysis));

      // Pass truncation info to dashboard if present
      if (content.truncated) {
        sessionStorage.setItem('ld-truncated-pages', String(content.truncated));
      } else {
        sessionStorage.removeItem('ld-truncated-pages');
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessages = {
        'RATE_LIMITED': t('errors.rate_limit'),
        'HOURLY_LIMIT': "You've reached the maximum number of analyses for this hour. Please try again later.",
        'OFFLINE': 'You appear to be offline. Please check your internet connection and try again.',
        'TIMEOUT': 'The analysis timed out. Please try again — this usually resolves on retry. If it persists, try uploading a clearer or smaller image.',
        'EMPTY_RESPONSE': "We couldn't extract any parameters from this report. Please verify it's a lab test report and try again.",
        'NOT_LAB_REPORT': "This doesn't appear to be a medical lab report. Please upload a lab test report.",
        'NO_PARAMETERS': "We couldn't find any test values in this report. Make sure the image is clear and shows the results table.",
        'PARSE_ERROR': 'We had trouble processing the response. Please try again.',
        'API_ERROR': 'The analysis service returned an error. Please try again.',
        'NETWORK_ERROR': 'Unable to connect to the analysis service. Please check your internet connection and try again.',
        'VISION_UNAVAILABLE': 'Vision analysis is temporarily unavailable. Please try again in a moment.',
      };
      setError(errorMessages[err.message] || t('errors.analysis_failed'));
    }
  };

  const handleRetry = () => {
    setError(null);
    setStep(0);
    setRetrying(true);
    hasStarted.current = false;

    const interval = setInterval(() => {
      setStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    runAnalysis().finally(() => {
      clearInterval(interval);
      setRetrying(false);
    });
  };

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const interval = setInterval(() => {
      setStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    runAnalysis().finally(() => clearInterval(interval));
  }, []);

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
            <button className="btn btn-secondary" onClick={handleRetry}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem', fontSize: '4rem' }}>
            <span className="animate-spin" style={{ display: 'inline-block' }}>&#x1F9EC;</span>
          </div>

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
                {i < step && '\u2713 '}
                {i === step && (
                  <span className="animate-pulse" style={{ display: 'inline-block' }}>&#x25CF;</span>
                )}{' '}
                {t(`analyzing.${s}`)}
              </div>
            ))}
          </div>

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
            {retrying ? 'Retrying analysis...' : 'This usually takes 5\u201315 seconds'}
          </p>
        </div>
      )}
    </div>
  );
}
