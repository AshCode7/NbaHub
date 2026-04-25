import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://api.balldontlie.io/v1';

const fmt    = (v, d = 1) => v != null ? Number(v).toFixed(d) : '—';
const pct    = (v)        => v != null ? (v * 100).toFixed(1) : '—';

const TEAM_COLORS = {
  'Golden State Warriors': '#1D428A',
  'Los Angeles Lakers':    '#552583',
  'Boston Celtics':        '#007A33',
  'Chicago Bulls':         '#CE1141',
  'Miami Heat':            '#98002E',
  'Brooklyn Nets':         '#000000',
  'Dallas Mavericks':      '#00538C',
  'Phoenix Suns':          '#1D1160',
  'Milwaukee Bucks':       '#00471B',
  'Denver Nuggets':        '#0E2240',
  'Los Angeles Clippers':  '#C8102E',
  'New York Knicks':       '#006BB6',
  'Philadelphia 76ers':    '#006BB6',
  'Oklahoma City Thunder': '#007AC1',
  'San Antonio Spurs':     '#C4CED4',
};
const teamColor = (name = '') => TEAM_COLORS[name] || '#4fc3f7';

const StatPill = ({ label, value, highlight }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '14px 18px',
    background: highlight ? 'rgba(200,241,53,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${highlight ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14,
    minWidth: 70,
  }}>
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.35rem', fontWeight: 500, color: highlight ? '#c8f135' : '#f0f0f8', letterSpacing: '-0.5px' }}>{value}</span>
    <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(240,240,248,0.35)' }}>{label}</span>
  </div>
);

const BioItem = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: '0.68rem', color: 'rgba(240,240,248,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#f0f0f8' }}>{value || '—'}</span>
  </div>
);

const PlayerProfile = ({ apiKey }) => {
  const [inputVal, setInputVal] = useState('LeBron James');
  const [query,    setQuery]    = useState('LeBron James');
  const [player,   setPlayer]   = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchPlayer = useCallback(async (q) => {
    if (!q) return;
    setLoading(true); setError(null); setPlayer(null); setStats(null);
    try {
      const parts    = q.trim().split(' ');
      const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];

      const pRes  = await fetch(`${API_BASE}/players?search=${encodeURIComponent(lastName)}&per_page=25`, { headers: { Authorization: apiKey } });
      if (!pRes.ok) throw new Error(`API error ${pRes.status}`);
      const pData = await pRes.json();
      if (!pData.data?.length) throw new Error(`No player found for "${q}". Try last name only.`);

      const ql = q.toLowerCase();
      const found =
        pData.data.find(p => `${p.first_name} ${p.last_name}`.toLowerCase() === ql) ||
        pData.data.find(p => parts.length > 1 && p.first_name.toLowerCase() === parts[0].toLowerCase() && p.last_name.toLowerCase() === lastName.toLowerCase()) ||
        pData.data.find(p => p.last_name.toLowerCase() === lastName.toLowerCase()) ||
        pData.data[0];

      setPlayer(found);

      // try current and previous season
      const yr = new Date().getFullYear() - 1;
      for (const season of [yr, yr - 1, yr - 2]) {
        const sRes  = await fetch(`${API_BASE}/season_averages?season=${season}&player_ids[]=${found.id}`, { headers: { Authorization: apiKey } });
        const sData = await sRes.json();
        if (sData.data?.length) { setStats(sData.data[0]); break; }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => { fetchPlayer(query); }, [query, fetchPlayer]);

  const handleSearch = (e) => { e.preventDefault(); setQuery(inputVal.trim()); };

  const color = teamColor(player?.team?.full_name);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .pp-wrap {
          min-height: calc(100vh - var(--header-h, 72px));
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 40px 40px 48px;
          position: relative;
          z-index: 1;
        }

        /* search bar */
        .pp-search-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
          gap: 10px;
        }
        .pp-search-input {
          background: rgba(14,14,24,0.75);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 16px;
          color: #f0f0f8;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          outline: none;
          width: 260px;
          transition: border-color 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(16px);
        }
        .pp-search-input::placeholder { color: rgba(240,240,248,0.28); }
        .pp-search-input:focus {
          border-color: rgba(200,241,53,0.4);
          box-shadow: 0 0 0 3px rgba(200,241,53,0.08);
        }
        .pp-search-btn {
          background: #c8f135;
          color: #07070d;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: opacity 0.18s;
        }
        .pp-search-btn:hover { opacity: 0.85; }
        .pp-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* main player card */
        .pp-card {
          background: rgba(10,10,20,0.78);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          backdrop-filter: blur(28px) saturate(140%);
          -webkit-backdrop-filter: blur(28px) saturate(140%);
          box-shadow: 0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* coloured accent stripe on left */
        .pp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 4px;
          background: var(--team-color, #4fc3f7);
          opacity: 0.8;
        }

        .pp-card-inner {
          display: grid;
          grid-template-columns: 1fr 380px;
          flex: 1;
          padding: 40px 40px 0 48px;
          gap: 0;
          position: relative;
        }

        .pp-info { display: flex; flex-direction: column; justify-content: center; padding-bottom: 40px; }

        .pp-team-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 5px 14px 5px 8px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(240,240,248,0.6);
          margin-bottom: 20px;
          width: fit-content;
        }
        .pp-dot { width: 10px; height: 10px; border-radius: 50%; }

        .pp-name-first {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: clamp(1rem, 2vw, 1.5rem);
          color: rgba(240,240,248,0.45);
          text-transform: uppercase;
          letter-spacing: 0.22em;
          display: block;
          margin-bottom: 4px;
        }
        .pp-name-last {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(4rem, 8vw, 7.5rem);
          line-height: 0.88;
          color: #fff;
          letter-spacing: -3px;
          margin-bottom: 28px;
        }

        .pp-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .pp-bio {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px 24px;
          margin-bottom: 32px;
        }

        .pp-stats-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* player image column */
        .pp-img-col {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .pp-jersey-number {
          position: absolute;
          bottom: -10px;
          right: 0;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(100px, 18vw, 200px);
          color: rgba(255,255,255,0.03);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          letter-spacing: -8px;
        }
        .pp-player-img {
          width: 100%;
          max-width: 340px;
          object-fit: contain;
          object-position: bottom;
          display: block;
          filter: drop-shadow(0 0 40px rgba(0,0,0,0.4));
          animation: ppSlide 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes ppSlide {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* bottom stats bar */
        .pp-bottom-bar {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 24px 48px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .pp-bar-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(240,240,248,0.25);
          margin-right: 8px;
          white-space: nowrap;
        }

        /* states */
        .pp-empty, .pp-loading {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: rgba(240,240,248,0.3);
          font-size: 1rem;
          padding: 80px 40px;
        }
        .pp-error-bar {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          border-radius: 10px;
          padding: 12px 20px;
          color: #f87171;
          font-size: 0.88rem;
          margin-bottom: 20px;
        }

        @media (max-width: 800px) {
          .pp-wrap { padding: 24px 16px; }
          .pp-card-inner { grid-template-columns: 1fr; }
          .pp-img-col { display: none; }
          .pp-bio { grid-template-columns: 1fr 1fr; }
          .pp-bottom-bar { padding: 20px 24px; }
        }
      `}</style>

      <div className="pp-wrap">
        {/* Search */}
        <div className="pp-search-row">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
            <input
              className="pp-search-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Search player…"
            />
            <button type="submit" className="pp-search-btn" disabled={loading}>
              {loading ? '…' : 'Search'}
            </button>
          </form>
        </div>

        {error && <div className="pp-error-bar">⚠ {error}</div>}

        {!player && !loading && !error && (
          <div className="pp-empty">
            <span style={{ fontSize: '3rem', opacity: 0.25 }}>🏀</span>
            <p>Search for a player to see their profile</p>
          </div>
        )}

        {loading && (
          <div className="pp-loading">
            <span style={{ fontSize: '2rem', opacity: 0.3 }}>⏳</span>
            <p>Loading…</p>
          </div>
        )}

        {player && !loading && (
          <div className="pp-card fade-in" style={{ '--team-color': color }}>
            <div className="pp-card-inner">
              {/* LEFT */}
              <div className="pp-info">
                <div className="pp-team-badge">
                  <span className="pp-dot" style={{ background: color }} />
                  {player.team?.full_name || 'NBA'}
                  {player.team?.abbreviation ? ` · ${player.team.abbreviation}` : ''}
                </div>

                <span className="pp-name-first">{player.first_name}</span>
                <h1 className="pp-name-last">{player.last_name}</h1>

                <div className="pp-meta">
                  {player.position && <BioItem label="Position" value={player.position} />}
                  {player.height    && <BioItem label="Height"   value={player.height} />}
                  {player.weight    && <BioItem label="Weight"   value={`${player.weight} lbs`} />}
                </div>

                <div className="pp-bio">
                  {player.college    && <BioItem label="College"    value={player.college} />}
                  {player.country    && <BioItem label="Country"    value={player.country} />}
                  {player.draft_year && <BioItem label="Draft Year" value={player.draft_year} />}
                  {player.draft_round && <BioItem label="Round"     value={player.draft_round} />}
                  {player.draft_number && <BioItem label="Pick"     value={player.draft_number} />}
                </div>

                {stats ? (
                  <div className="pp-stats-row">
                    <StatPill label="PPG"  value={fmt(stats.pts)}           highlight />
                    <StatPill label="RPG"  value={fmt(stats.reb)} />
                    <StatPill label="APG"  value={fmt(stats.ast)} />
                    <StatPill label="FG%"  value={`${pct(stats.fg_pct)}%`} />
                    <StatPill label="3P%"  value={`${pct(stats.fg3_pct)}%`} />
                    <StatPill label="STL"  value={fmt(stats.stl)} />
                    <StatPill label="BLK"  value={fmt(stats.blk)} />
                  </div>
                ) : (
                  <p style={{ color: 'rgba(240,240,248,0.3)', fontSize: '0.85rem' }}>No recent season stats available.</p>
                )}
              </div>

              {/* RIGHT — image */}
              <div className="pp-img-col">
                <div className="pp-jersey-number">{player.jersey_number || ''}</div>
                <img
                  className="pp-player-img"
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/fallback.png`}
                  alt={`${player.first_name} ${player.last_name}`}
                  onError={e => { e.target.style.opacity = '0.1'; }}
                />
              </div>
            </div>

            {/* Bottom bar */}
            {stats && (
              <div className="pp-bottom-bar">
                <span className="pp-bar-label">Season Avg</span>
                {[
                  { label: 'MIN',  value: stats.min ?? '—' },
                  { label: 'FT%',  value: `${pct(stats.ft_pct)}%` },
                  { label: 'OREB', value: fmt(stats.oreb) },
                  { label: 'DREB', value: fmt(stats.dreb) },
                  { label: 'TO',   value: fmt(stats.turnover) },
                  { label: 'PF',   value: fmt(stats.pf) },
                  { label: 'GP',   value: stats.games_played ?? '—' },
                ].map(s => <StatPill key={s.label} label={s.label} value={s.value} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PlayerProfile;
