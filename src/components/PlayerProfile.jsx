import React, { useState, useCallback } from 'react';

const API_BASE = 'https://api.balldontlie.io/v1';
const fmt = (v, d = 1) => v != null ? Number(v).toFixed(d) : '—';
const pct = (v)        => v != null ? (v * 100).toFixed(1) : '—';

/* ── Inline silhouette SVG ─────────────────────────────────────────── */
const PlayerSilhouette = ({ size = 120 }) => (
  <svg width={size} height={size * 2} viewBox="0 0 200 400"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 0.18, filter: 'drop-shadow(0 0 12px #c8f135)', display: 'block' }}>
    <defs>
      <radialGradient id="sg" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#c8f135" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#c8f135" stopOpacity="0.5" />
      </radialGradient>
    </defs>
    <path fill="url(#sg)"
      d="M110.5,5.5 C108.5,3.5 105.8,2 102.5,2 C99.2,2 96.5,3.5 94.5,5.5 C92.5,7.5 91.5,10.2 91.5,13.5 C91.5,16.8 92.5,19.5 94.5,21.5 C96.5,23.5 99.2,25 102.5,25 C105.8,25 108.5,23.5 110.5,21.5 C112.5,19.5 113.5,16.8 113.5,13.5 C113.5,10.2 112.5,7.5 110.5,5.5 M121,50 L146,45 C146,45 152,69 154,77 L139,112 C139,112 119,103 116,98 C113,93 113,88 113,88 L121,50 M82,50 L57,45 C57,45 51,69 49,77 L64,112 C64,112 84,103 87,98 C90,93 90,88 90,88 L82,50 M116,98 C119,103 120,111 120,111 L112,185 C112,185 112,254 118,299 C124,344 121,373 121,373 L102,398 L82,373 C82,373 79,344 85,299 C91,254 91,185 91,185 L83,111 C83,111 84,103 87,98 M140,296 L151,326 C151,326 157,358 152,376 C147,394 135,396 135,396 L121,373 M63,296 L52,326 C52,326 46,358 51,376 C56,394 68,396 68,396 L82,373"
    />
  </svg>
);

/* ── Stat pill ─────────────────────────────────────────────────────── */
const StatPill = ({ label, value, accent }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    padding: '16px 20px',
    background: accent ? 'rgba(200,241,53,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${accent ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14, minWidth: 76,
  }}>
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 500, color: accent ? '#c8f135' : '#f4f4fb', letterSpacing: '-0.5px' }}>{value}</span>
    <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(244,244,251,0.32)' }}>{label}</span>
  </div>
);

/* ── Player search card ────────────────────────────────────────────── */
const PlayerCard = ({ player, onClick }) => (
  <div onClick={() => onClick(player)} style={{
    background: 'rgba(12,12,22,0.82)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '20px 20px 16px',
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    position: 'relative', overflow: 'hidden',
    backdropFilter: 'blur(16px)',
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(200,241,53,0.4)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.5)'; }}
  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
    {/* silhouette */}
    <div style={{ width: 80, height: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
      <PlayerSilhouette size={80} />
    </div>
    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#f4f4fb', lineHeight: 1.1, marginBottom: 4 }}>
        {player.first_name} {player.last_name}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'rgba(244,244,251,0.45)', marginBottom: 6 }}>{player.team?.full_name || 'Free Agent'}</div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {player.position && (
          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.25)', borderRadius: 100, color: '#c8f135', letterSpacing: '0.06em' }}>
            {player.position}
          </span>
        )}
        {player.jersey_number && (
          <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, color: 'rgba(244,244,251,0.55)', letterSpacing: '0.04em' }}>
            #{player.jersey_number}
          </span>
        )}
      </div>
    </div>
  </div>
);

/* ── Profile view ──────────────────────────────────────────────────── */
const ProfileView = ({ player, stats, onBack }) => (
  <div className="fade-in">
    <button onClick={onBack} style={{
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '8px 18px', color: 'rgba(244,244,251,0.6)',
      fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', cursor: 'pointer',
      marginBottom: 24, transition: 'all 0.18s',
    }}
    onMouseEnter={e => e.currentTarget.style.color='#f4f4fb'}
    onMouseLeave={e => e.currentTarget.style.color='rgba(244,244,251,0.6)'}>
      ← Back to results
    </button>

    <div style={{
      background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 24, overflow: 'hidden',
      backdropFilter: 'blur(28px)', boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
    }}>
      {/* Top hero section */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 200px',
        gap: 0, padding: '40px 48px 0', alignItems: 'end',
        background: 'linear-gradient(180deg, rgba(200,241,53,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c8f135, transparent)' }} />

        <div style={{ paddingBottom: 36 }}>
          {/* team badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 14px', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(244,244,251,0.55)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 20 }}>
            {player.team?.full_name || 'NBA'}
            {player.team?.abbreviation && ` · ${player.team.abbreviation}`}
          </div>

          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(1rem,2vw,1.4rem)', color: 'rgba(244,244,251,0.42)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: 4 }}>
            {player.first_name}
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(3.5rem,8vw,6.5rem)', lineHeight: 0.88, color: '#f4f4fb', letterSpacing: '-3px', marginBottom: 28 }}>
            {player.last_name}
          </div>

          {/* meta row */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { l: 'Position', v: player.position },
              { l: 'Height',   v: player.height },
              { l: 'Weight',   v: player.weight ? `${player.weight} lbs` : null },
              { l: 'Country',  v: player.country },
              { l: 'College',  v: player.college },
              { l: 'Draft',    v: player.draft_year ? `${player.draft_year} R${player.draft_round} P${player.draft_number}` : null },
            ].filter(x => x.v).map(x => (
              <div key={x.l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(244,244,251,0.3)' }}>{x.l}</span>
                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#f4f4fb' }}>{x.v}</span>
              </div>
            ))}
          </div>

          {/* main stats */}
          {stats ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatPill label="PPG" value={fmt(stats.pts)}          accent />
              <StatPill label="RPG" value={fmt(stats.reb)} />
              <StatPill label="APG" value={fmt(stats.ast)} />
              <StatPill label="FG%" value={`${pct(stats.fg_pct)}%`} />
              <StatPill label="3P%" value={`${pct(stats.fg3_pct)}%`} />
              <StatPill label="STL" value={fmt(stats.stl)} />
              <StatPill label="BLK" value={fmt(stats.blk)} />
            </div>
          ) : (
            <p style={{ color: 'rgba(244,244,251,0.35)', fontSize: '0.9rem' }}>No recent season stats available.</p>
          )}
        </div>

        {/* silhouette column */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <PlayerSilhouette size={160} />
        </div>
      </div>

      {/* Bottom bar */}
      {stats && (
        <div style={{ padding: '22px 48px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(244,244,251,0.25)', marginRight: 8 }}>
            {stats.season}–{stats.season + 1} Season
          </span>
          {[
            { l: 'MIN',  v: stats.min ?? '—' },
            { l: 'FT%',  v: `${pct(stats.ft_pct)}%` },
            { l: 'OREB', v: fmt(stats.oreb) },
            { l: 'DREB', v: fmt(stats.dreb) },
            { l: 'TO',   v: fmt(stats.turnover) },
            { l: 'PF',   v: fmt(stats.pf) },
            { l: 'GP',   v: stats.games_played ?? '—' },
          ].map(s => <StatPill key={s.l} label={s.l} value={s.v} />)}
        </div>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════════ */
const PlayerProfile = ({ apiKey }) => {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [player,  setPlayer]  = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* search */
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(null); setResults([]); setPlayer(null); setStats(null);
    try {
      const res  = await fetch(`${API_BASE}/players?search=${encodeURIComponent(query.trim())}&per_page=12`, {
        headers: { Authorization: `${apiKey}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('API returned invalid response. Check your API key.'); }
      if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
      if (!data.data?.length) throw new Error(`No players found for "${query}".`);
      setResults(data.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [query, apiKey]);

  /* select */
  const handleSelect = useCallback(async (p) => {
    setLoading(true); setError(null); setPlayer(p); setResults([]); setStats(null);
    try {
      const yr = new Date().getFullYear();
      for (const season of [yr - 1, yr - 2, yr - 3]) {
        const res  = await fetch(`${API_BASE}/season_averages?season=${season}&player_ids[]=${p.id}`, {
          headers: { Authorization: `${apiKey}` },
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { break; }
        if (data.data?.length) { setStats(data.data[0]); break; }
      }
    } catch (e) { setError('Could not load stats.'); }
    finally { setLoading(false); }
  }, [apiKey]);

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <input
          type="text"
          className="styled-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search NBA player (e.g. Stephen Curry, LeBron...)"
          style={{ flex: 1, fontSize: '1rem', padding: '13px 18px' }}
        />
        <button type="submit" className="styled-button" disabled={loading} style={{ padding: '13px 28px', fontSize: '1rem' }}>
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '14px 20px', color: '#f87171', fontSize: '0.92rem', marginBottom: 28 }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(244,244,251,0.35)', fontSize: '1.1rem' }}>
          ⏳ Loading…
        </div>
      )}

      {/* Search results grid */}
      {!loading && results.length > 0 && (
        <div className="fade-in">
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(244,244,251,0.28)', marginBottom: 16 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} — click to view profile
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {results.map(p => <PlayerCard key={p.id} player={p} onClick={handleSelect} />)}
          </div>
        </div>
      )}

      {/* Player profile */}
      {!loading && player && !results.length && (
        <ProfileView player={player} stats={stats} onBack={() => { setPlayer(null); setStats(null); }} />
      )}

      {/* Initial empty state */}
      {!loading && !error && !results.length && !player && (
        <div style={{ textAlign: 'center', padding: '100px 40px', color: 'rgba(244,244,251,0.25)' }}>
          <div style={{ marginBottom: 16 }}><PlayerSilhouette size={60} /></div>
          <p style={{ fontSize: '1.1rem', marginTop: -40 }}>Search for an NBA player to see their profile</p>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;
