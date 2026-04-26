import React, { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = 'https://api.balldontlie.io/v1';
const P1_COLOR = '#c8f135';
const P2_COLOR = '#4fc3f7';

const safePct = (v) => (v != null ? (v * 100).toFixed(1) : '—');
const safeNum = (v)  => v ?? 0;
const fmt     = (v)  => (v != null ? Number(v).toFixed(1) : '—');

/* ── Stat comparison row ──────────────────────────────────────────── */
const CompareRow = ({ label, v1, v2 }) => {
  const n1 = parseFloat(v1) || 0;
  const n2 = parseFloat(v2) || 0;
  const winner = n1 > n2 ? 1 : n2 > n1 ? 2 : 0;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center', gap: 12,
      padding: '11px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", fontSize: '1rem', fontWeight: winner === 1 ? 700 : 400, color: winner === 1 ? P1_COLOR : 'rgba(240,240,248,0.7)' }}>{v1}</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,240,248,0.28)', textAlign: 'center', minWidth: 80 }}>{label}</span>
      <span style={{ textAlign: 'left', fontFamily: "'DM Mono', monospace", fontSize: '1rem', fontWeight: winner === 2 ? 700 : 400, color: winner === 2 ? P2_COLOR : 'rgba(240,240,248,0.7)' }}>{v2}</span>
    </div>
  );
};

/* ── Player input card ────────────────────────────────────────────── */
const PlayerInput = ({ label, color, player, onNameChange, onSeasonChange }) => (
  <div style={{ flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color, marginBottom: 8 }}>{label}</div>
    <input
      type="text"
      className="styled-input"
      value={player.name}
      placeholder="Player name…"
      onChange={e => onNameChange(e.target.value)}
      style={{ width: '100%', marginBottom: 8 }}
    />
    <input
      type="number"
      className="styled-input"
      value={player.season}
      min="1979" max={new Date().getFullYear()}
      onChange={e => onSeasonChange(parseInt(e.target.value) || player.season)}
      style={{ width: '100%' }}
    />
    {player.loading && <div style={{ fontSize: '0.78rem', color: 'rgba(240,240,248,0.4)', marginTop: 6 }}>Searching…</div>}
    {player.error   && <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 6 }}>{player.error}</div>}
  </div>
);

/* ── Main ─────────────────────────────────────────────────────────── */
const PrimePredictor = ({ apiKey }) => {
  const [player1, setPlayer1] = useState({ name: 'LeBron James', season: 2012, stats: null, loading: false, error: null });
  const [player2, setPlayer2] = useState({ name: 'Kobe Bryant',  season: 2006, stats: null, loading: false, error: null });

  const fetchPlayerStats = async (playerName, season, setter) => {
    setter(prev => ({ ...prev, loading: true, error: null, stats: null }));
    try {
      const parts    = playerName.trim().split(' ');
      const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];

      const pRes  = await fetch(`${API_BASE_URL}/players?search=${encodeURIComponent(lastName)}&per_page=25`, { headers: { Authorization: `${apiKey}` } });
      const pText = await pRes.text();
      let pData;
      try { pData = JSON.parse(pText); } catch { throw new Error('API key invalid or not authorized.'); }
      if (!pRes.ok) throw new Error(pData?.error || `API error ${pRes.status}`);
      if (!pData.data?.length) throw new Error(`"${playerName}" not found. Try last name only.`);

      const q = playerName.toLowerCase();
      const found =
        pData.data.find(p => `${p.first_name} ${p.last_name}`.toLowerCase() === q) ||
        pData.data.find(p => parts.length > 1 && p.first_name.toLowerCase() === parts[0].toLowerCase() && p.last_name.toLowerCase() === lastName.toLowerCase()) ||
        pData.data.find(p => p.last_name.toLowerCase() === lastName.toLowerCase()) ||
        pData.data[0];

      const sRes  = await fetch(`${API_BASE_URL}/season_averages?season=${season}&player_ids[]=${found.id}`, { headers: { Authorization: `${apiKey}` } });
      const sText = await sRes.text();
      let sData;
      try { sData = JSON.parse(sText); } catch { throw new Error('Stats API returned invalid response.'); }

      if (!sData.data?.length) throw new Error(`No stats for ${found.first_name} ${found.last_name} in ${season}–${season + 1}. Try a different season.`);
      setter(prev => ({ ...prev, stats: sData.data[0], loading: false }));
    } catch (e) {
      setter(prev => ({ ...prev, loading: false, error: e.message }));
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    fetchPlayerStats(player1.name, player1.season, setPlayer1);
    fetchPlayerStats(player2.name, player2.season, setPlayer2);
  };

  const p1 = player1.stats;
  const p2 = player2.stats;
  const bothLoaded = p1 && p2;
  const isLoading  = player1.loading || player2.loading;

  const radarData = bothLoaded ? [
    { stat: 'PTS', P1: safeNum(p1.pts),  P2: safeNum(p2.pts)  },
    { stat: 'REB', P1: safeNum(p1.reb),  P2: safeNum(p2.reb)  },
    { stat: 'AST', P1: safeNum(p1.ast),  P2: safeNum(p2.ast)  },
    { stat: 'STL', P1: safeNum(p1.stl),  P2: safeNum(p2.stl)  },
    { stat: 'BLK', P1: safeNum(p1.blk),  P2: safeNum(p2.blk)  },
  ] : [];

  const tooltipStyle = {
    contentStyle: { background: 'rgba(14,14,24,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f8', fontSize: '0.85rem' },
  };

  return (
    <div className="fade-in" style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <h2 className="feature-title">Prime Predictor</h2>
      <p className="feature-description">Compare two players at their peak seasons head-to-head.<br/><small style={{ opacity: 0.5 }}>Best coverage: seasons 2000–2024</small></p>

      {/* Input card */}
      <div className="glass-card" style={{ marginBottom: 28 }}>
        <form onSubmit={handleCompare}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            <PlayerInput label="Player 1" color={P1_COLOR} player={player1}
              onNameChange={v => setPlayer1(p => ({ ...p, name: v }))}
              onSeasonChange={v => setPlayer1(p => ({ ...p, season: v }))} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', color: 'rgba(240,240,248,0.2)', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem' }}>VS</div>
            <PlayerInput label="Player 2" color={P2_COLOR} player={player2}
              onNameChange={v => setPlayer2(p => ({ ...p, name: v }))}
              onSeasonChange={v => setPlayer2(p => ({ ...p, season: v }))} />
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
              <div style={{ color: P1_COLOR, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.3rem' }}>{player1.name}</div>
              <div style={{ color: 'rgba(240,240,248,0.4)', fontSize: '0.78rem', marginTop: 2 }}>{player1.season}–{player1.season + 1} Season</div>
            </div>
            <div style={{ color: 'rgba(240,240,248,0.15)', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem' }}>VS</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: P2_COLOR, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.3rem' }}>{player2.name}</div>
              <div style={{ color: 'rgba(240,240,248,0.4)', fontSize: '0.78rem', marginTop: 2 }}>{player2.season}–{player2.season + 1} Season</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Stat comparison */}
            <div className="glass-card">
              <div className="section-label">Head to Head</div>
              <CompareRow label="Points"   v1={fmt(p1.pts)}          v2={fmt(p2.pts)} />
              <CompareRow label="Rebounds" v1={fmt(p1.reb)}          v2={fmt(p2.reb)} />
              <CompareRow label="Assists"  v1={fmt(p1.ast)}          v2={fmt(p2.ast)} />
              <CompareRow label="Steals"   v1={fmt(p1.stl)}          v2={fmt(p2.stl)} />
              <CompareRow label="Blocks"   v1={fmt(p1.blk)}          v2={fmt(p2.blk)} />
              <CompareRow label="FG%"      v1={`${safePct(p1.fg_pct)}%`}  v2={`${safePct(p2.fg_pct)}%`} />
              <CompareRow label="3P%"      v1={`${safePct(p1.fg3_pct)}%`} v2={`${safePct(p2.fg3_pct)}%`} />
              <CompareRow label="FT%"      v1={`${safePct(p1.ft_pct)}%`}  v2={`${safePct(p2.ft_pct)}%`} />
            </div>

            {/* Radar chart */}
            <div className="glass-card" style={{ height: 380 }}>
              <div className="section-label" style={{ marginBottom: 16 }}>Spider Chart</div>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="stat" stroke="rgba(240,240,248,0.45)" tick={{ fontSize: 11 }} />
                  <Radar name={player1.name} dataKey="P1" stroke={P1_COLOR} fill={P1_COLOR} fillOpacity={0.25} />
                  <Radar name={player2.name} dataKey="P2" stroke={P2_COLOR} fill={P2_COLOR} fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                  <Tooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart */}
          <div className="glass-card" style={{ marginTop: 20, height: 300 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>Statistical Breakdown</div>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart layout="vertical" data={[
                { name: 'Points',   [player1.name]: safeNum(p1.pts), [player2.name]: safeNum(p2.pts) },
                { name: 'Rebounds', [player1.name]: safeNum(p1.reb), [player2.name]: safeNum(p2.reb) },
                { name: 'Assists',  [player1.name]: safeNum(p1.ast), [player2.name]: safeNum(p2.ast) },
                { name: 'FG%',      [player1.name]: safePct(p1.fg_pct), [player2.name]: safePct(p2.fg_pct) },
                { name: '3P%',      [player1.name]: safePct(p1.fg3_pct), [player2.name]: safePct(p2.fg3_pct) },
              ]} margin={{ left: 10, right: 20 }}>
                <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(240,240,248,0.45)' }} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.2)" width={72} tick={{ fontSize: 11, fill: 'rgba(240,240,248,0.45)' }} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                <Bar dataKey={player1.name} fill={P1_COLOR} radius={[0, 4, 4, 0]} />
                <Bar dataKey={player2.name} fill={P2_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!bothLoaded && !isLoading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>📊</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Enter two players and click <strong style={{ color: 'var(--text-primary)' }}>Compare</strong></p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8 }}>Tip: seasons 2000–2024 work best with the API</p>
        </div>
      )}
    </div>
  );
};

export default PrimePredictor;
