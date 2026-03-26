import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { icon: '📱', title: t('landing.feature_1_title'), desc: t('landing.feature_1_desc') },
    { icon: '🫀', title: t('landing.feature_2_title'), desc: t('landing.feature_2_desc') },
    { icon: '📈', title: t('landing.feature_3_title'), desc: t('landing.feature_3_desc') },
    { icon: '🌍', title: t('landing.feature_4_title'), desc: t('landing.feature_4_desc') },
  ];

  const trustBadges = [
    { icon: '🔒', label: 'Your data stays on your device — nothing is stored' },
    { icon: '📋', label: 'Based on NIH, WHO & international medical reference ranges' },
    { icon: '🌍', label: 'Works with lab reports from any country' },
    { icon: '🆓', label: 'Completely free — no signup required' },
  ];

  const handleTrySample = () => {
    // Lazy-load sample data and navigate to dashboard
    import('../data/sampleReport').then(mod => {
      sessionStorage.setItem('ld-analysis-result', JSON.stringify(mod.sampleReport));
      navigate('/dashboard');
    }).catch(() => {
      navigate('/upload');
    });
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
      }}>
        {/* Animated gradient background */}
        <div className="gradient-bg" style={{
          position: 'absolute', inset: 0, opacity: 0.07, zIndex: 0,
        }} />
        {/* Floating shapes */}
        <div style={{
          position: 'absolute', top: '10%', left: '5%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,118,110,0.08), transparent)',
          animation: 'pulse 4s ease infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '8%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.08), transparent)',
          animation: 'pulse 5s ease infinite 1s',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px' }}>
          <div className="animate-slide-up">
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
            }}>
              {t('landing.hero_title')}
            </h1>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #0F766E, #14B8A6, #0EA5E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {t('landing.hero_title2')}
            </h1>
          </div>

          <p className="animate-slide-up" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
            maxWidth: '650px',
            margin: '0 auto 2.5rem',
            animationDelay: '0.1s',
          }}>
            {t('landing.hero_subtitle')}
          </p>

          <div className="animate-slide-up" style={{
            display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
            animationDelay: '0.2s',
          }}>
            <Link to="/upload" className="btn btn-primary" style={{
              fontSize: '1.125rem',
              padding: '1rem 2.5rem',
              borderRadius: '999px',
              boxShadow: '0 4px 15px rgba(15,118,110,0.3)',
            }}>
              🧬 {t('landing.cta')}
            </Link>
            <button onClick={handleTrySample} className="btn btn-secondary" style={{
              fontSize: '1rem',
              padding: '1rem 2rem',
              borderRadius: '999px',
            }}>
              📊 Try with a Sample Report
            </button>
          </div>

          {/* Trust Badges */}
          <div className="animate-slide-up" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '3rem',
            flexWrap: 'wrap',
            animationDelay: '0.3s',
          }}>
            {trustBadges.map((badge, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer below hero */}
      <div style={{
        textAlign: 'center',
        padding: '0 1.5rem',
        marginTop: '-2rem',
        marginBottom: '2rem',
      }}>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          LabDecode is an educational health literacy tool. It does not diagnose, prescribe, or replace professional medical advice.
        </p>
      </div>

      {/* Features Section */}
      <section style={{
        padding: '4rem 1.5rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          color: 'var(--text-primary)',
        }}>
          How LabDecode Works
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '3rem',
          maxWidth: '500px',
          margin: '0 auto 3rem',
        }}>
          Three simple steps to understand your lab reports
        </p>

        {/* Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '4rem',
          flexWrap: 'wrap',
        }}>
          {[
            { num: '1', icon: '📤', label: 'Upload', desc: 'PDF, photo, or camera' },
            { num: '2', icon: '🤖', label: 'AI Analyzes', desc: 'Parameters extracted & categorized' },
            { num: '3', icon: '📊', label: 'Understand', desc: 'Clear visual dashboard' },
          ].map((step, i) => (
            <div key={i} style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: '0.25rem',
              }}>{step.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{step.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {features.map((feature, i) => (
            <div key={i} className="card" style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>{feature.icon}</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div className="card" style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(15,118,110,0.05), rgba(14,165,233,0.05))',
          border: '1px solid rgba(15,118,110,0.15)',
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Ready to understand your lab report?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Upload your report and get instant, AI-powered insights — completely private and free.
          </p>
          <Link to="/upload" className="btn btn-primary" style={{
            fontSize: '1rem',
            padding: '0.875rem 2rem',
            borderRadius: '999px',
          }}>
            Get Started →
          </Link>
        </div>
      </section>
    </div>
  );
}
