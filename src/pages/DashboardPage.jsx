import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import DisclaimerBanner from '../components/DisclaimerBanner';
import HealthSpectrum from '../components/HealthSpectrum';
import OrganSystemCard from '../components/OrganSystemCard';
import ParameterDetail from '../components/ParameterDetail';
import ReadAloud from '../components/ReadAloud';
import StatusBadge from '../components/StatusBadge';
import { saveReport } from '../utils/storage';

const STATUS_FILTERS = ['all', 'excellent', 'normal', 'needs_attention', 'review_recommended'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { simpleMode } = useTheme();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedSystem, setExpandedSystem] = useState(null);
  const [view, setView] = useState('organs'); // 'organs' | 'list'
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('ld-analysis-result');
    if (data) {
      try { setAnalysis(JSON.parse(data)); }
      catch { navigate('/upload', { replace: true }); }
    } else {
      navigate('/upload', { replace: true });
    }
  }, []);

  const handleSave = () => {
    if (analysis && !saved) {
      saveReport({
        name: analysis.lab_name ? `${analysis.lab_name} Report` : `Report ${analysis.report_date || new Date().toLocaleDateString()}`,
        date: analysis.report_date || new Date().toISOString(),
        labName: analysis.lab_name,
        patientName: analysis.patient_name,
        analysis,
      });
      setSaved(true);
    }
  };

  // Group by organ system
  const systems = useMemo(() => {
    if (!analysis?.parameters) return {};
    const grouped = {};
    analysis.parameters.forEach(p => {
      const sys = p.organ_system || 'other';
      if (!grouped[sys]) grouped[sys] = [];
      grouped[sys].push(p);
    });
    return grouped;
  }, [analysis]);

  // Filter parameters
  const filteredParams = useMemo(() => {
    if (!analysis?.parameters) return [];
    if (filter === 'all') return analysis.parameters;
    return analysis.parameters.filter(p => p.status === filter);
  }, [analysis, filter]);

  const counts = useMemo(() => {
    if (!analysis?.parameters) return { inRange: 0, outRange: 0 };
    const inRange = analysis.parameters.filter(p => p.status === 'excellent' || p.status === 'normal').length;
    return { inRange, outRange: analysis.parameters.length - inRange };
  }, [analysis]);

  if (!analysis) return null;

  const summaryText = `${analysis.summary || ''} ${analysis.total_parameters || analysis.parameters?.length || 0} parameters were tested. ${counts.inRange} are in range and ${counts.outRange} need attention.`;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Disclaimer Banner */}
      <DisclaimerBanner style={{ marginBottom: '1.5rem' }} />

      {/* Summary Card */}
      <div className="card animate-slide-up" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('dashboard.summary')}</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
              {analysis.summary}
            </p>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F766E' }}>{analysis.total_parameters || analysis.parameters?.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>{t('dashboard.parameters_tested')}</span>
              </div>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{counts.inRange}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>{t('dashboard.in_range')}</span>
              </div>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>{counts.outRange}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>{t('dashboard.out_of_range')}</span>
              </div>
            </div>
            {analysis.report_date && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📅 {t('dashboard.report_date')}: {analysis.report_date}
                {analysis.lab_name && <> · 🏥 {analysis.lab_name}</>}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <ReadAloud text={summaryText} />
            <button className="btn btn-secondary" onClick={handleSave} style={{ fontSize: '0.85rem' }}>
              {saved ? '✓ Saved' : '💾 Save Report'}
            </button>
          </div>
        </div>
        <HealthSpectrum parameters={analysis.parameters} />
      </div>

      {/* View Toggle & Filters */}
      <div className="animate-slide-up" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${view === 'organs' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('organs')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            🫀 {t('dashboard.organ_systems')}
          </button>
          <button
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('list')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            📋 {t('dashboard.all_parameters')}
          </button>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/lifestyle')} style={{ fontSize: '0.85rem' }}>
          🌿 {t('dashboard.lifestyle')}
        </button>
      </div>

      {/* Status Filters */}
      <div style={{
        display: 'flex', gap: '0.375rem', marginBottom: '1.5rem',
        overflowX: 'auto', paddingBottom: '0.25rem',
      }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', borderRadius: '999px', whiteSpace: 'nowrap' }}
          >
            {f === 'all' ? t('dashboard.filter_all') : t(`dashboard.filter_${f === 'needs_attention' ? 'attention' : f === 'review_recommended' ? 'review' : f}`)}
          </button>
        ))}
      </div>

      {/* Organ System View */}
      {view === 'organs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(systems).map(([sys, params]) => {
            const filteredSystemParams = filter === 'all' ? params : params.filter(p => p.status === filter);
            if (filteredSystemParams.length === 0) return null;
            return (
              <div key={sys}>
                <OrganSystemCard
                  system={sys}
                  parameters={filteredSystemParams}
                  expanded={expandedSystem === sys}
                  onClick={() => setExpandedSystem(expandedSystem === sys ? null : sys)}
                />
                {expandedSystem === sys && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {filteredSystemParams.map((p, i) => (
                      <ParameterDetail key={i} parameter={p} simple={simpleMode} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div>
          {filteredParams.map((p, i) => (
            <ParameterDetail key={i} parameter={p} simple={simpleMode} />
          ))}
          {filteredParams.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              No parameters match this filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
