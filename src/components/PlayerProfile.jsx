import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api.balldontlie.io/v1';

/* ─── Tiny helpers ─────────────────────────────────────────────────── */
const fmt = (v, digits = 1) => (v != null ? Number(v).toFixed(digits) : '—');
const pct = (v) => (v != null ? (v * 100).toFixed(1) : '—');

/* ─── Static fallback avatars by position ──────────────────────────── */
const SILHOUETTE = 'https://cdn.nba.com/headshots/nba/latest/1040x760/fallback.png';

/* ─── Stat pill ────────────────────────────────────────────────────── */
const Pill = ({ label, value, accent }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 4, padding: '14px 20px',
    background: accent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${accent ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 14, minWidth: 72,
  }}>
    <span style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: "'DM Mono', monospace", color: '#fff', letterSpacing: '-0.5px' }}>
      {value}
    </span>
    <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)' }}>
      {label}
    </span>
  </div>
);

/* ─── Team badge colour map (approximate) ──────────────────────────── */
const TEAM_COLORS = {
  'Golden State Warriors': ['#1D428A', '#FFC72C'],
  'Los Angeles Lakers':    ['#552583', '#FDB927'],
  'Boston Celtics':        ['#007A33', '#BA9653'],
  'Chicago Bulls':         ['#CE1141', '#000000'],
  'Miami Heat':            ['#98002E', '#F9A01B'],
  'Brooklyn Nets':         ['#000000', '#FFFFFF'],
  'Dallas Mavericks':      ['#00538C', '#002B5E'],
  'Phoenix Suns':          ['#1D1160', '#E56020'],
  'Milwaukee Bucks':       ['#00471B', '#EEE1C6'],
  'Denver Nuggets':        ['#0E2240', '#FEC524'],
  default:                 ['#1a1a2e', '#4fc3f7'],
};

const teamColors = (name = '') => TEAM_COLORS[name] || TEAM_COLORS.default;

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
const PlayerProfile = ({ apiKey }) => {
  const [query, setQuery]       = useState('LeBron James');
  const [inputVal, setInputVal] = useState('LeBron James');
  const [player, setPlayer]     = useState(null);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  /* ── Fetch ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!query) return;
    const run = async () => {
      setLoading(true); setError(null); setPlayer(null); setStats(null);
      try {
        // 1. find player
        // The balldontlie API searches by last name only, so extract it
        const parts    = query.trim().split(' ');
        const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];

        const pRes = await fetch(
          `${API_BASE_URL}/players?search=${encodeURIComponent(lastName)}&per_page=25`,
          { headers: { Authorization: apiKey } }
        );
        if (!pRes.ok) throw new Error(`API error ${pRes.status}. Check your API key.`);
        const pData = await pRes.json();
        if (!pData.data?.length) throw new Error(`No player found for "${query}". Try searching by last name only.`);

        // Match: exact full name > first+last > last name only > first result
        const q = query.toLowerCase();
        const found =
          pData.data.find(p => `${p.first_name} ${p.last_name}`.toLowerCase() === q) ||
          pData.data.find(p =>
            parts.length > 1 &&
            p.first_name.toLowerCase() === parts[0].toLowerCase() &&
            p.last_name.toLowerCase() === lastName.toLowerCase()
          ) ||
          pData.data.find(p => p.last_name.toLowerCase() === lastName.toLowerCase()) ||
          pData.data[0];
        setPlayer(found);

        // 2. fetch latest season averages (try current year, fallback one year)
        const currentYear = new Date().getFullYear() - 1;
        let sRes = await fetch(`${API_BASE_URL}/season_averages?season=${currentYear}&player_ids[]=${found.id}`, { headers: { Authorization: apiKey } });
        let sData = await sRes.json();

        if (!sData.data?.length) {
          sRes  = await fetch(`${API_BASE_URL}/season_averages?season=${currentYear - 1}&player_ids[]=${found.id}`, { headers: { Authorization: apiKey } });
          sData = await sRes.json();
        }

        setStats(sData.data?.[0] || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [query, apiKey]);

  const handleSearch = (e) => { e.preventDefault(); setQuery(inputVal.trim()); };

  const [c1, c2] = teamColors(player?.team?.full_name);

  /* ── Search bar JSX (not a sub-component to avoid re-mount issues) ── */
  const searchBarJSX = (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 480 }}>
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        placeholder="Search player…"
        style={{
          flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, padding: '10px 16px', color: '#fff',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', outline: 'none',
        }}
      />
      <button type="submit" disabled={loading} style={{
        background: 'linear-gradient(135deg, #c8f135 0%, #a8d020 100%)',
        color: '#07070d', border: 'none', borderRadius: 10, padding: '10px 20px',
        fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        fontSize: '0.9rem', opacity: loading ? 0.5 : 1,
      }}>
        {loading ? '…' : 'Search'}
      </button>
    </form>
  );

  /* ── RENDER ─────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');

        .pp-root {
          min-height: calc(100vh - 60px);
          width: 100%;
          background: #080810;
          display: flex;
          flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        /* animated gradient orbs */
        .pp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.35;
          pointer-events: none;
          animation: ppFloat 8s ease-in-out infinite alternate;
        }
        @keyframes ppFloat {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-30px) scale(1.06); }
        }

        .pp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px 0;
          position: relative;
          z-index: 10;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pp-card {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 0;
          flex: 1;
          padding: 32px 40px 0;
          align-items: end;
        }

        .pp-info { display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 40px; }

        .pp-team-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 6px 14px 6px 8px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 18px;
          width: fit-content;
        }
        .pp-team-dot {
          width: 10px; height: 10px; border-radius: 50%;
        }

        .pp-name-first {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: block;
          margin-bottom: 4px;
        }
        .pp-name-last {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(4rem, 9vw, 8rem);
          line-height: 0.88;
          color: #fff;
          margin: 0 0 28px;
          letter-spacing: -2px;
        }

        .pp-meta {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .pp-meta-item { display: flex; flex-direction: column; gap: 2px; }
        .pp-meta-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.35); font-weight: 600; }
        .pp-meta-val   { font-size: 0.98rem; font-weight: 500; color: rgba(255,255,255,0.85); }

        .pp-divider { width: 1px; background: rgba(255,255,255,0.1); align-self: stretch; }

        .pp-stats-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pp-image-col {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          position: relative;
        }
        .pp-player-img {
          width: 100%;
          max-width: 360px;
          object-fit: contain;
          object-position: bottom;
          filter: drop-shadow(0 0 60px rgba(255,255,255,0.08));
          display: block;
          animation: ppSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes ppSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pp-number-bg {
          position: absolute;
          bottom: -20px;
          right: -10px;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(120px, 20vw, 220px);
          color: rgba(255,255,255,0.04);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          letter-spacing: -8px;
        }

        .pp-bottom-bar {
          position: relative;
          z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin: 32px 40px 0;
          padding: 24px 0 36px;
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .pp-season-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          margin-right: 4px;
          white-space: nowrap;
        }

        .pp-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 40px;
          color: rgba(255,255,255,0.3);
          font-size: 1rem;
        }
        .pp-empty-icon { font-size: 3rem; opacity: 0.4; }

        .pp-error {
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.25);
          border-radius: 12px;
          padding: 12px 20px;
          color: #ff8080;
          font-size: 0.88rem;
          max-width: 480px;
        }

        @keyframes ppFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pp-animate { animation: ppFadeIn 0.5s ease both; }

        @media (max-width: 780px) {
          .pp-card { grid-template-columns: 1fr; }
          .pp-image-col { display: none; }
          .pp-topbar, .pp-card, .pp-bottom-bar { padding-left: 20px; padding-right: 20px; }
          .pp-bottom-bar { margin-left: 20px; margin-right: 20px; }
        }
      `}</style>

      <div className="pp-root">
        {/* Orbs */}
        <div className="pp-orb" style={{ width: 500, height: 500, background: c1, top: -100, left: -100, animationDelay: '0s' }} />
        <div className="pp-orb" style={{ width: 400, height: 400, background: c2, top: 50, right: -80, animationDelay: '2s' }} />

        {/* Top bar */}
        <div className="pp-topbar">
          {searchBarJSX}
          {error && <div className="pp-error">⚠ {error}</div>}
        </div>

        {/* No player yet */}
        {!player && !loading && !error && (
          <div className="pp-empty">
            <div className="pp-empty-icon">🏀</div>
            <p>Search for an NBA player to see their profile.</p>
          </div>
        )}

        {loading && (
          <div className="pp-empty">
            <div className="pp-empty-icon" style={{ animation: 'ppFloat 1s ease-in-out infinite alternate' }}>⏳</div>
            <p>Loading…</p>
          </div>
        )}

        {/* Player card */}
        {player && !loading && (
          <div className="pp-animate" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="pp-card">
              {/* LEFT: info */}
              <div className="pp-info">
                {/* Team badge */}
                <div className="pp-team-badge">
                  <span className="pp-team-dot" style={{ background: c2 }} />
                  {player.team?.full_name || 'NBA'}
                  {player.team?.abbreviation ? ` · ${player.team.abbreviation}` : ''}
                </div>

                {/* Name */}
                <span className="pp-name-first">{player.first_name}</span>
                <h1 className="pp-name-last">{player.last_name}</h1>

                {/* Meta row */}
                <div className="pp-meta">
                  {player.position && (
                    <div className="pp-meta-item">
                      <span className="pp-meta-label">Position</span>
                      <span className="pp-meta-val">{player.position}</span>
                    </div>
                  )}
                  {player.height && (
                    <div className="pp-meta-item">
                      <span className="pp-meta-label">Height</span>
                      <span className="pp-meta-val">{player.height}</span>
                    </div>
                  )}
                  {player.weight && (
                    <div className="pp-meta-item">
                      <span className="pp-meta-label">Weight</span>
                      <span className="pp-meta-val">{player.weight} lbs</span>
                    </div>
                  )}
                  {player.college && (
                    <div className="pp-meta-item">
                      <span className="pp-meta-label">College</span>
                      <span className="pp-meta-val">{player.college}</span>
                    </div>
                  )}
                  {player.country && (
                    <div className="pp-meta-item">
                      <span className="pp-meta-label">Country</span>
                      <span className="pp-meta-val">{player.country}</span>
                    </div>
                  )}
                  {player.draft_year && (
                    <div className="pp-meta-item">
                      <span className="pp-meta-label">Draft</span>
                      <span className="pp-meta-val">{player.draft_year} · R{player.draft_round} P{player.draft_number}</span>
                    </div>
                  )}
                </div>

                {/* Key stats */}
                {stats ? (
                  <div className="pp-stats-row">
                    <Pill label="PPG"  value={fmt(stats.pts)}       accent />
                    <Pill label="RPG"  value={fmt(stats.reb)}       />
                    <Pill label="APG"  value={fmt(stats.ast)}       />
                    <Pill label="FG%"  value={`${pct(stats.fg_pct)}%`}  />
                    <Pill label="3P%"  value={`${pct(stats.fg3_pct)}%`} />
                    <Pill label="STL"  value={fmt(stats.stl)}       />
                    <Pill label="BLK"  value={fmt(stats.blk)}       />
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    No recent season stats available for this player.
                  </p>
                )}
              </div>

              {/* RIGHT: player image */}
              <div className="pp-image-col">
                <div className="pp-number-bg">
                  {player.jersey_number || ''}
                </div>
                <img
                  className="pp-player-img"
                  src={SILHOUETTE}
                  alt={`${player.first_name} ${player.last_name}`}
                  onError={e => { e.target.style.opacity = 0.15; }}
                />
              </div>
            </div>

            {/* Bottom stats bar */}
            {stats && (
              <div className="pp-bottom-bar">
                <span className="pp-season-label">Season Averages</span>
                {[
                  { label: 'MIN', value: stats.min ?? '—' },
                  { label: 'FT%', value: `${pct(stats.ft_pct)}%` },
                  { label: 'OREB', value: fmt(stats.oreb) },
                  { label: 'DREB', value: fmt(stats.dreb) },
                  { label: 'TO',   value: fmt(stats.turnover) },
                  { label: 'PF',   value: fmt(stats.pf) },
                  { label: 'GP',   value: stats.games_played ?? '—' },
                ].map(s => (
                  <Pill key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PlayerProfile;
