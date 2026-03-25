import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReports, deleteReport } from '../utils/storage';

export default function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState(() => getReports());

  const handleView = (report) => {
    sessionStorage.setItem('ld-analysis-result', JSON.stringify(report.analysis));
    navigate('/dashboard');
  };

  const handleDelete = (id) => {
    deleteReport(id);
    setReports(getReports());
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 className="animate-slide-up" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        📋 {t('nav.history')}
      </h1>

      {reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📄</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>No saved reports yet</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Upload and analyze a lab report, then save it to see it here.
          </p>
          <Link to="/upload" className="btn btn-primary">Upload Report</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reports.map(r => (
            <div key={r.id} className="card card-interactive" onClick={() => handleView(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{r.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.date ? new Date(r.date).toLocaleDateString() : ''}
                    {r.labName && ` · ${r.labName}`}
                    {r.analysis?.total_parameters && ` · ${r.analysis.total_parameters} parameters`}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '1.1rem', padding: '0.5rem',
                  }}
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
