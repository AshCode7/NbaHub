import React, { useState, useEffect } from 'react';

const DraftHistorian = ({ apiKey }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(2003);
  const [draftPicks, setDraftPicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDraftData = async () => {
      setLoading(true);
      setError(null);
      setDraftPicks([]);

      try {
        const response = await fetch(`https://api.balldontlie.io/v1/draft_picks?year=${selectedYear}`, {
          headers: {
            'Authorization': apiKey
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch draft data. The API might be down or your key is invalid.');
        }

        const data = await response.json();
        
        if (data.data.length === 0) {
            throw new Error(`No draft data found for the year ${selectedYear}.`);
        }
        
        setDraftPicks(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDraftData();
  }, [selectedYear, apiKey]);

  const yearRange = Array.from({ length: currentYear - 1979 + 1 }, (_, i) => 1979 + i);

  return (
    <div className="fade-in">
      <h2 className="feature-title">Draft Historian</h2>
      <p className="feature-description">Explore the landscape of NBA drafts. Use the selector to view the first-round picks from any year between 1979 and today.</p>

      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="year-select">Draft Year</label>
          <select
            id="year-select"
            className="styled-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearRange.reverse().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading && <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Loading {selectedYear} Draft...</p>}
      {error && <p style={{ textAlign: 'center', color: '#ff5555', fontSize: '1.2rem' }}>Error: {error}</p>}
      
      {!loading && !error && (
        <div className="card-grid">
          {draftPicks
            .filter(p => p.round_number === 1) // Show first round picks
            .sort((a, b) => a.pick_number - b.pick_number)
            .map((p, index) => (
              <div key={p.id} className="card draft-card" style={{ animationDelay: `${index * 0.02}s` }}>
                <div className="draft-card-header">
                  <span className="pick-number">#{p.pick_number}</span>
                  <span className="drafting-team">{p.team.abbreviation}</span>
                </div>
                <div className="draft-card-body">
                  <h3 className="player-name">{p.player.first_name} {p.player.last_name}</h3>
                  <p className="player-college">{p.college || 'N/A'}</p>
                </div>
              </div>
            ))
          }
        </div>
      )}

      <style>{`
        .draft-card { display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
        .draft-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pick-number { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-accent-primary); line-height: 1; }
        .drafting-team { font-family: var(--font-label); font-weight: 600; color: var(--color-text-secondary); background: var(--color-background); padding: 4px 8px; border-radius: 6px; }
        .player-name { font-size: 1.5rem; margin-bottom: 4px; font-weight: bold; }
        .player-college { color: var(--color-text-secondary); }
      `}</style>
    </div>
  );
};

export default DraftHistorian;