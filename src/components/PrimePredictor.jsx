import React, { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE = 'https://api.balldontlie.io/v1';
const API_KEY  = 'ddd08d8f-e111-40a7-a5c1-78970f26148c';
const P1_COLOR = '#c8f135';
const P2_COLOR = '#4fc3f7';

const safePct = (v) => (v != null ? (v * 100).toFixed(1) : '—');
const safeNum = (v)  => (v != null ? Number(v) : 0);
const fmt     = (v)  => (v != null ? Number(v).toFixed(1) : '—');

/* ── safe fetch that handles non-JSON gracefully ───────────────────── */
const apiFetch = async (url) => {
  const res  = await fetch(url, { headers: { 'Authorization': API_KEY } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`API returned invalid response (status ${res.status}). Check your API key.`); }
  if (!res.ok) throw new Error(data?.error || data?.message || `API error ${res.status}`);
  return data;
};

/* ── find player by name ───────────────────────────────────────────── */
const findPlayer = async (name) => {
  const parts    = name.trim().split(' ');
  const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const data     = await apiFetch(`${API_BASE}/players?search=${encodeURIComponent(lastName)}&per_page=25`);
  if (!data.data?.length) throw new Error(`Player "${name}" not found. Try last name only.`);
  const q = name.toLowerCase();
  return (
    data.data.find(p => `${p.first_name} ${p.last_name}`.toLowerCase() === q) ||
    data.data.find(p => p.last_name.toLowerCase() === lastName.toLowerCase()) ||
    data.data[0]
  );
};

/* ── fetch season averages — try both endpoint styles ──────────────── */
const fetchSeasonAvg = async (playerId, season) => {
  // v1 endpoint (current)
  try {
    const data = await apiFetch(
      `${API_BASE}/season_averages?season=${season}&player_ids[]=${playerId}`,
      apiKey
    );
    if (data.data?.length) return data.data[0];
  } catch (_) {}

  // some accounts use player_id (no brackets)
  try {
    const data = await apiFetch(
      `${API_BASE}/season_averages?season=${season}&player_id=${playerId}`,
      apiKey
    );
    if (data.data?.length) return data.data[0];
  } catch (_) {}

  return null;
};

/* ── Stat compare row ──────────────────────────────────────────────── */
const CompareRow = ({ label, v1, v2 }) => {
  const n1 = parseFloat(v1) || 0;
  const n2 = parseFloat(v2) || 0;
  const w  = n1 > n2 ? 1 : n2 > n1 ? 2 : 0;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 100px 1fr',
      alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ textAlign: 'right', fontFamily: 'DM Mono,monospace', fontSize: '1.05rem', fontWeight: w===1?700:400, color: w===1?P1_COLOR:'rgba(244,244,251,0.72)' }}>{v1}</span>
      <span style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(244,244,251,0.28)' }}>{label}</span>
      <span style={{ textAlign: 'left',  fontFamily: 'DM Mono,monospace', fontSize: '1.05rem', fontWeight: w===2?700:400, color: w===2?P2_COLOR:'rgba(244,244,251,0.72)' }}>{v2}</span>
    </div>
  );
};

/* ── Player input ──────────────────────────────────────────────────── */
const PlayerInput = ({ label, color, name, season, onName, onSeason, loading, error }) => (
  <div style={{ flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color, marginBottom: 8 }}>{label}</div>
    <input type="text"    className="styled-input" value={name}   placeholder="Player name…" onChange={e => onName(e.target.value)}   style={{ width: '100%', marginBottom: 8 }} />
    <input type="number"  className="styled-input" value={season} min="1979" max={new Date().getFullYear()} onChange={e => onSeason(parseInt(e.target.value) || season)} style={{ width: '100%' }} />
    {loading && <div style={{ fontSize: '0.8rem', color: 'rgba(244,244,251,0.38)', marginTop: 6 }}>Searching…</div>}
    {error   && <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: 6 }}>{error}</div>}
  </div>
);

const tooltipStyle = {
  contentStyle: { background: 'rgba(10,10,20,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f4f4fb', fontSize: '0.85rem' },
};

/* ══════════════════════════════════════════════════════════════════ */
const PrimePredictor = ({ apiKey }) => {
  const [p1, setP1] = useState({ name: 'LeBron James', season: 2012, stats: null, loading: false, error: null });
  const [p2, setP2] = useState({ name: 'Kobe Bryant',  season: 2006, stats: null, loading: false, error: null });

  const fetchStats = async (playerName, season, setter) => {
    setter(prev => ({ ...prev, loading: true, error: null, stats: null }));
    try {
      const player = await findPlayer(playerName);
      const stats  = await fetchSeasonAvg(player.id, season);
      if (!stats) throw new Error(`No stats for ${player.first_name} ${player.last_name} in ${season}–${season+1}. Try a different season (2000–2023 work best).`);
      setter(prev => ({ ...prev, stats, loading: false }));
    } catch (e) {
      setter(prev => ({ ...prev, loading: false, error: e.message }));
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    fetchStats(p1.name, p1.season, setP1);
    fetchStats(p2.name, p2.season, setP2);
  };

  const s1 = p1.stats;
  const s2 = p2.stats;
  const bothLoaded = s1 && s2;
  const isLoading  = p1.loading || p2.loading;

  const radarData = bothLoaded ? [
    { stat: 'PTS', P1: safeNum(s1.pts),  P2: safeNum(s2.pts)  },
    { stat: 'REB', P1: safeNum(s1.reb),  P2: safeNum(s2.reb)  },
    { stat: 'AST', P1: safeNum(s1.ast),  P2: safeNum(s2.ast)  },
    { stat: 'STL', P1: safeNum(s1.stl),  P2: safeNum(s2.stl)  },
    { stat: 'BLK', P1: safeNum(s1.blk),  P2: safeNum(s2.blk)  },
  ] : [];

  return (
    <div className="fade-in" style={{ padding: '44px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <h2 className="feature-title">Prime Predictor</h2>
      <p className="feature-description">Compare two players at their peak seasons.<br/><small style={{ opacity: 0.45 }}>Seasons 2000–2023 have best API coverage</small></p>

      {/* Input */}
      <div className="glass-card" style={{ marginBottom: 28 }}>
        <form onSubmit={handleCompare}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-start' }}>
            <PlayerInput label="Player 1" color={P1_COLOR}
              name={p1.name} season={p1.season} loading={p1.loading} error={p1.error}
              onName={v => setP1(x => ({ ...x, name: v }))}
              onSeason={v => setP1(x => ({ ...x, season: v }))} />
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 32, color: 'rgba(244,244,251,0.18)', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>VS</div>
            <PlayerInput label="Player 2" color={P2_COLOR}
              name={p2.name} season={p2.season} loading={p2.loading} error={p2.error}
              onName={v => setP2(x => ({ ...x, name: v }))}
              onSeason={v => setP2(x => ({ ...x, season: v }))} />
          </div>
          <button type="submit" className="styled-button" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Loading…' : '⚡ Compare'}
          </button>
        </form>
      </div>

      {/* Results */}
      {bothLoaded && (
        <div className="fade-in">
          {/* VS banner */}
          <div className="glass-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: P1_COLOR, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>{p1.name}</div>
              <div style={{ color: 'rgba(244,244,251,0.38)', fontSize: '0.82rem', marginTop: 3 }}>{p1.season}–{p1.season+1}</div>
            </div>
            <div style={{ color: 'rgba(244,244,251,0.12)', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '2.5rem' }}>VS</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: P2_COLOR, fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>{p2.name}</div>
              <div style={{ color: 'rgba(244,244,251,0.38)', fontSize: '0.82rem', marginTop: 3 }}>{p2.season}–{p2.season+1}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Head to head */}
            <div className="glass-card">
              <div className="section-label">Head to Head</div>
              {[
                { l: 'Points',   v1: fmt(s1.pts),            v2: fmt(s2.pts) },
                { l: 'Rebounds', v1: fmt(s1.reb),            v2: fmt(s2.reb) },
                { l: 'Assists',  v1: fmt(s1.ast),            v2: fmt(s2.ast) },
                { l: 'Steals',   v1: fmt(s1.stl),            v2: fmt(s2.stl) },
                { l: 'Blocks',   v1: fmt(s1.blk),            v2: fmt(s2.blk) },
                { l: 'FG%',      v1: `${safePct(s1.fg_pct)}%`,  v2: `${safePct(s2.fg_pct)}%` },
                { l: '3P%',      v1: `${safePct(s1.fg3_pct)}%`, v2: `${safePct(s2.fg3_pct)}%` },
                { l: 'FT%',      v1: `${safePct(s1.ft_pct)}%`,  v2: `${safePct(s2.ft_pct)}%` },
              ].map(r => <CompareRow key={r.l} label={r.l} v1={r.v1} v2={r.v2} />)}
            </div>

            {/* Radar */}
            <div className="glass-card" style={{ height: 380 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Spider Chart</div>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="stat" stroke="rgba(244,244,251,0.4)" tick={{ fontSize: 12 }} />
                  <Radar name={p1.name} dataKey="P1" stroke={P1_COLOR} fill={P1_COLOR} fillOpacity={0.22} />
                  <Radar name={p2.name} dataKey="P2" stroke={P2_COLOR} fill={P2_COLOR} fillOpacity={0.18} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                  <Tooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart */}
          <div className="glass-card" style={{ marginTop: 20, height: 300 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>Statistical Breakdown</div>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart layout="vertical" margin={{ left: 10, right: 24 }} data={[
                { name: 'Points',   [p1.name]: safeNum(s1.pts), [p2.name]: safeNum(s2.pts) },
                { name: 'Rebounds', [p1.name]: safeNum(s1.reb), [p2.name]: safeNum(s2.reb) },
                { name: 'Assists',  [p1.name]: safeNum(s1.ast), [p2.name]: safeNum(s2.ast) },
                { name: 'FG%',      [p1.name]: safePct(s1.fg_pct), [p2.name]: safePct(s2.fg_pct) },
                { name: '3P%',      [p1.name]: safePct(s1.fg3_pct), [p2.name]: safePct(s2.fg3_pct) },
              ]}>
                <XAxis type="number" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11, fill: 'rgba(244,244,251,0.4)' }} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.15)" width={76} tick={{ fontSize: 11, fill: 'rgba(244,244,251,0.4)' }} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar dataKey={p1.name} fill={P1_COLOR} radius={[0,4,4,0]} />
                <Bar dataKey={p2.name} fill={P2_COLOR} radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!bothLoaded && !isLoading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '64px 40px' }}>
          <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: 16 }}>📊</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Enter two players and click <strong style={{ color: 'var(--text-primary)' }}>Compare</strong></p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>Tip: LeBron 2012, Kobe 2006, MJ 1996 work great</p>
        </div>
      )}
    </div>
  );
};

export default PrimePredictor;
