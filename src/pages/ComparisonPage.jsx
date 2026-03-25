import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getReports, deleteReport } from '../utils/storage';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function ComparisonPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState(() => getReports());
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedParam, setSelectedParam] = useState(null);

  const toggleReport = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    deleteReport(id);
    setReports(getReports());
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  // Collect all unique parameter names from selected reports
  const allParams = useMemo(() => {
    const params = new Set();
    reports
      .filter(r => selectedIds.includes(r.id))
      .forEach(r => {
        r.analysis?.parameters?.forEach(p => params.add(p.name));
      });
    return Array.from(params).sort();
  }, [reports, selectedIds]);

  // Build chart data for selected parameter
  const chartData = useMemo(() => {
    if (!selectedParam) return [];
    return reports
      .filter(r => selectedIds.includes(r.id))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(r => {
        const param = r.analysis?.parameters?.find(p => p.name === selectedParam);
        return {
          date: r.date ? new Date(r.date).toLocaleDateString() : r.name,
          value: param ? parseFloat(param.value) : null,
          unit: param?.unit,
          refLow: param?.reference_range?.low,
          refHigh: param?.reference_range?.high,
        };
      })
      .filter(d => d.value !== null);
  }, [reports, selectedIds, selectedParam]);

  // Trend analysis
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const refHigh = chartData[0].refHigh;
    const refLow = chartData[0].refLow;

    // Is the value moving toward the reference range?
    if (first > refHigh && last < first) return 'positive';
    if (first < refLow && last > first) return 'positive';
    if (first > refHigh && last > first) return 'negative';
    if (first < refLow && last < first) return 'negative';
    return 'stable';
  }, [chartData]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 className="animate-slide-up" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        📊 {t('compare.title')}
      </h1>

      <DisclaimerBanner textKey="disclaimers.trends" style={{ marginBottom: '1.5rem' }} />

      {reports.length < 2 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📈</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{t('compare.no_reports')}</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Upload and save at least two reports to see trends over time.
          </p>
        </div>
      ) : (
        <>
          {/* Report Selector */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>{t('compare.select_reports')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reports.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedIds.includes(r.id) ? 'rgba(15,118,110,0.08)' : 'var(--bg-secondary)',
                  border: `2px solid ${selectedIds.includes(r.id) ? '#0F766E' : 'transparent'}`,
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => toggleReport(r.id)}
                    style={{ width: '18px', height: '18px', accentColor: '#0F766E' }}
                  />
                  <div style={{ flex: 1 }} onClick={() => toggleReport(r.id)}>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{r.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                      {r.date ? new Date(r.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '1rem', padding: '0.25rem',
                    }}
                  >🗑️</button>
                </div>
              ))}
            </div>
          </div>

          {selectedIds.length >= 2 && allParams.length > 0 && (
            <>
              {/* Parameter Selector */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Select a parameter to compare:</h3>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {allParams.map(param => (
                    <button
                      key={param}
                      onClick={() => setSelectedParam(param)}
                      className={`btn ${selectedParam === param ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', borderRadius: '999px' }}
                    >
                      {param}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              {selectedParam && chartData.length > 0 && (
                <div className="card animate-fade-in">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                    📈 {selectedParam} Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="date" fontSize={12} stroke="var(--text-muted)" />
                      <YAxis fontSize={12} stroke="var(--text-muted)" />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={2} dot={{ fill: '#0F766E', r: 5 }} />
                      {chartData[0]?.refHigh && (
                        <Line type="monotone" dataKey="refHigh" stroke="#FB7185" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Upper Limit" />
                      )}
                      {chartData[0]?.refLow && (
                        <Line type="monotone" dataKey="refLow" stroke="#0EA5E9" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Lower Limit" />
                      )}
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>

                  {trend && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: trend === 'positive' ? 'var(--bg-status-excellent)' : trend === 'negative' ? 'var(--bg-status-attention)' : 'var(--bg-status-normal)',
                      fontSize: '0.9rem',
                    }}>
                      {trend === 'positive' && `📈 Your ${selectedParam} is ${t('compare.trending_positive')}`}
                      {trend === 'negative' && `📉 Your ${selectedParam} trend may be ${t('compare.trending_negative')}`}
                      {trend === 'stable' && `➡️ Your ${selectedParam} has been ${t('compare.stable')}`}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
