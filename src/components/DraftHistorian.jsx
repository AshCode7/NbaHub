import React, { useState, useEffect } from 'react';

const API_BASE = 'https://api.balldontlie.io/v1';

const DraftHistorian = ({ apiKey }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(2003);
  const [draftPicks, setDraftPicks]     = useState([]);
  const [statsMap, setStatsMap]         = useState({});   // playerId → season avg
  const [loading, setLoading]           = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError]               = useState(null);

  const apiFetch = async (url) => {
    const res = await fetch(url, { headers: { Authorization: apiKey } });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  };

  /* ── 1. fetch draft picks ─────────────────────────────────────── */
  useEffect(() => {
    const fetchDraftData = async () => {
      setLoading(true);
      setError(null);
      setDraftPicks([]);
      setStatsMap({});

      try {
        const data = await apiFetch(`${API_BASE}/draft_picks?year=${selectedYear}`);
        if (!data.data?.length) throw new Error(`No draft data found for ${selectedYear}.`);
        const round1 = data.data
          .filter(p => p.round_number === 1)
          .sort((a, b) => a.pick_number - b.pick_number);
        setDraftPicks(round1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDraftData();
  }, [selectedYear]);

  /* ── 2. fetch rookie-year stats once picks are loaded ─────────── */
  useEffect(() => {
    if (!draftPicks.length) return;

    const fetchAllStats = async () => {
      setLoadingStats(true);
      const map = {};

      // BallDontLie allows multiple player_ids[] in one call — batch all picks
      const ids = draftPicks
        .map(p => p.player?.id)
        .filter(Boolean);

      if (!ids.length) { setLoadingStats(false); return; }

      try {
        // rookie season = the season that starts in selectedYear
        const params = ids.map(id => `player_ids[]=${id}`).join('&');
        const data   = await apiFetch(
          `${API_BASE}/season_averages?season=${selectedYear}&${params}`
        );
        (data.data || []).forEach(s => { map[s.player_id] = s; });
      } catch (_) {
        // stats fetch failing is non-fatal — cards just show '—'
      }

      setStatsMap(map);
      setLoadingStats(false);
    };

    fetchAllStats();
  }, [draftPicks]);

  const yearRange = Array.from(
    { length: currentYear - 1979 + 1 },
    (_, i) => currentYear - i          // descending — no need to reverse later
  );

  const fmt    = (v) => (v != null ? Number(v).toFixed(1) : '—');
  const fmtPct = (v) => (v != null ? `${(v * 100).toFixed(0)}%` : '—');

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <h2 className="feature-title">Draft Historian</h2>
      <p className="feature-description">
        First-round picks from any year (1979–present) with their rookie-season averages.
      </p>

      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="year-select">Draft Year</label>
          <select
            id="year-select"
            className="styled-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearRange.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {loading      && <p style={{ textAlign: 'center', fontSize: '1.3rem', color: 'var(--color-accent-primary)' }}>Loading {selectedYear} Draft…</p>}
      {loadingStats && !loading && <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Fetching rookie stats…</p>}
      {error        && <p style={{ textAlign: 'center', color: '#ff5555', fontSize: '1.2rem' }}>Error: {error}</p>}

      {!loading && !error && draftPicks.length > 0 && (
        <div className="card-grid">
          {draftPicks.map((p, index) => {
            const s = statsMap[p.player?.id];
            return (
              <div
                key={p.id}
                className="card draft-card"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Header row: pick # + team */}
                <div className="draft-card-header">
                  <span className="pick-number">#{p.pick_number}</span>
                  <span className="drafting-team">{p.team?.abbreviation ?? '—'}</span>
                </div>

                {/* Player name + college */}
                <div className="draft-card-body">
                  <h3 className="player-name">
                    {p.player?.first_name} {p.player?.last_name}
                  </h3>
                  <p className="player-college">{p.college || 'N/A'}</p>
                </div>

                {/* Rookie stats */}
                <div className="rookie-stats">
                  <div className="stat-row">
                    <span className="stat-label">PTS</span>
                    <span className="stat-value">{fmt(s?.pts)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">REB</span>
                    <span className="stat-value">{fmt(s?.reb)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">AST</span>
                    <span className="stat-value">{fmt(s?.ast)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">FG%</span>
                    <span className="stat-value">{fmtPct(s?.fg_pct)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && draftPicks.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '1.2rem' }}>
          No first-round picks found for {selectedYear}.
        </p>
      )}

      <style>{`
        .draft-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .draft-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pick-number {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          color: var(--color-accent-primary);
          line-height: 1;
        }
        .drafting-team {
          font-family: var(--font-label);
          font-weight: 600;
          color: var(--color-text-secondary);
          background: var(--color-background);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .draft-card-body {
          flex: 1;
        }
        .player-name {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .player-college {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
        }
        .rookie-stats {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 12px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stat-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(244,244,251,0.35);
        }
        .stat-value {
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          color: var(--color-accent-primary);
        }
      `}</style>
    </div>
  );
};

export default DraftHistorian;
