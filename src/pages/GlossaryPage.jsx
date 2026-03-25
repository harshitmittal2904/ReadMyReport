import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { glossaryData } from '../data/glossaryData';
import { systemIcons, systemKeys } from '../components/OrganSystemCard';

export default function GlossaryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('all');

  const systems = ['all', ...Array.from(new Set(glossaryData.map(item => item.system)))];

  const filteredData = useMemo(() => {
    let result = glossaryData;

    if (selectedSystem !== 'all') {
      result = result.filter(item => item.system === selectedSystem);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAbbr = item.abbreviation.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesKeywords = item.keywords.some(kw => kw.toLowerCase().includes(q));
        return matchesName || matchesAbbr || matchesDesc || matchesKeywords;
      });
    }

    return result;
  }, [searchQuery, selectedSystem]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-slide-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Health Glossary</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Search for medical terms, parameters, or even symptoms like "tiredness" to see related tests.
        </p>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Search for 'sugar', 'anemia', or 'HbA1c'..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: '999px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }}
            onFocus={e => e.target.style.borderColor = '#0F766E'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
      </div>

      {/* System Filters */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
        {systems.map(sys => {
          let label = sys;
          if (sys === 'all') label = 'All Categories';
          else if (systemKeys[sys]) label = t(systemKeys[sys]);
          else label = sys.split(/_|-/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

          const icon = sys === 'all' ? '🌐' : systemIcons[sys] || '🔬';

          return (
            <button
              key={sys}
              onClick={() => setSelectedSystem(sys)}
              className={`btn ${selectedSystem === sys ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', borderRadius: '999px', whiteSpace: 'nowrap', border: selectedSystem === sys ? 'none' : '' }}
            >
              {icon} {label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filteredData.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🕵️‍♀️</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>No results found</h3>
            <p>Try searching for a different symptom or medical term.</p>
          </div>
        ) : (
          filteredData.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.abbreviation}</span>
                </div>
                <span style={{ fontSize: '1.5rem' }} title={item.system}>{systemIcons[item.system]}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{item.description}</p>
              
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👨‍⚕️ {item.specialist}
                </span>
                
                <div style={{ display: 'flex', gap: '0.25rem', opacity: 0.7 }}>
                   <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                    {item.keywords.length} keywords
                   </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
