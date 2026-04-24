import React, { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL = 'https://api.balldontlie.io/v1';

const PLAYER_COLORS = {
  p1: 'var(--color-accent-primary, #4fc3f7)',
  p2: 'var(--color-highlight, #f06292)',
};

// ─── Helper: safe percentage formatting ──────────────────────────────────────
const safePct = (val) => (val != null ? (val * 100).toFixed(1) : '0.0');
const safeNum  = (val) => val ?? 0;

// ─── Stat card component ─────────────────────────────────────────────────────
const StatCard = ({ label, p1Val, p2Val, p1Name, p2Name }) => {
  const v1 = parseFloat(p1Val) || 0;
  const v2 = parseFloat(p2Val) || 0;
  const winner = v1 > v2 ? 'p1' : v2 > v1 ? 'p2' : 'tie';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <span style={{
        color: winner === 'p1' ? PLAYER_COLORS.p1 : 'var(--color-text-primary, #fff)',
        fontWeight: winner === 'p1' ? 700 : 400,
        fontSize: '1rem',
        minWidth: '60px',
        textAlign: 'right',
      }}>{p1Val}</span>

      <span style={{
        color: 'var(--color-text-secondary, #aaa)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        flex: 1,
        textAlign: 'center',
      }}>{label}</span>

      <span style={{
        color: winner === 'p2' ? PLAYER_COLORS.p2 : 'var(--color-text-primary, #fff)',
        fontWeight: winner === 'p2' ? 700 : 400,
        fontSize: '1rem',
        minWidth: '60px',
        textAlign: 'left',
      }}>{p2Val}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PrimePredictor = ({ apiKey }) => {
  const [player1, setPlayer1] = useState({ name: 'LeBron James',   season: 2012, stats: null, loading: false, error: null });
  const [player2, setPlayer2] = useState({ name: 'Kobe Bryant',    season: 2006, stats: null, loading: false, error: null });

  // ── Fetch logic ─────────────────────────────────────────────────────────────
  const fetchPlayerStats = async (playerName, season, playerSetter) => {
    playerSetter(prev => ({ ...prev, loading: true, error: null, stats: null }));

    try {
      // Step 1: find the player
      const playerRes = await fetch(
        `${API_BASE_URL}/players?search=${encodeURIComponent(playerName)}`,
        { headers: { Authorization: apiKey } }
      );

      if (!playerRes.ok) {
        throw new Error(`API error ${playerRes.status}. Check your API key.`);
      }

      const playerData = await playerRes.json();

      if (!playerData.data || playerData.data.length === 0) {
        throw new Error(`Player "${playerName}" not found. Check the spelling.`);
      }

      const player = playerData.data[0];

      // Step 2: fetch season averages
      const statsRes = await fetch(
        `${API_BASE_URL}/season_averages?season=${season}&player_ids[]=${player.id}`,
        { headers: { Authorization: apiKey } }
      );

      if (!statsRes.ok) {
        throw new Error(`Stats API error ${statsRes.status}.`);
      }

      const statsData = await statsRes.json();

      if (!statsData.data || statsData.data.length === 0) {
        throw new Error(
          `No stats for ${player.first_name} ${player.last_name} in the ${season}–${season + 1} season. ` +
          `Note: the balldontlie API has limited historical data — seasons from 2000 onwards work best.`
        );
      }

      playerSetter(prev => ({ ...prev, stats: statsData.data[0], loading: false }));

    } catch (err) {
      playerSetter(prev => ({ ...prev, stats: null, loading: false, error: err.message }));
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    fetchPlayerStats(player1.name, player1.season, setPlayer1);
    fetchPlayerStats(player2.name, player2.season, setPlayer2);
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const p1Stats = player1.stats;
  const p2Stats = player2.stats;
  const bothLoaded = p1Stats && p2Stats;

  const radarData = bothLoaded ? [
    { stat: 'PTS', P1: safeNum(p1Stats.pts),  P2: safeNum(p2Stats.pts)  },
    { stat: 'REB', P1: safeNum(p1Stats.reb),  P2: safeNum(p2Stats.reb)  },
    { stat: 'AST', P1: safeNum(p1Stats.ast),  P2: safeNum(p2Stats.ast)  },
    { stat: 'STL', P1: safeNum(p1Stats.stl),  P2: safeNum(p2Stats.stl)  },
    { stat: 'BLK', P1: safeNum(p1Stats.blk),  P2: safeNum(p2Stats.blk)  },
  ] : [];

  const barData = bothLoaded ? [
    { name: 'Points',   [player1.name]: safeNum(p1Stats.pts), [player2.name]: safeNum(p2Stats.pts) },
    { name: 'Rebounds', [player1.name]: safeNum(p1Stats.reb), [player2.name]: safeNum(p2Stats.reb) },
    { name: 'Assists',  [player1.name]: safeNum(p1Stats.ast), [player2.name]: safeNum(p2Stats.ast) },
    { name: 'FG%',      [player1.name]: safePct(p1Stats.fg_pct),  [player2.name]: safePct(p2Stats.fg_pct)  },
    { name: '3P%',      [player1.name]: safePct(p1Stats.fg3_pct), [player2.name]: safePct(p2Stats.fg3_pct) },
  ] : [];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--color-surface-solid, #1a1a2e)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '10px',
      color: '#fff',
    },
  };

  const isLoading = player1.loading || player2.loading;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 className="feature-title">Prime Predictor</h2>
      <p className="feature-description">
        Compare two players at their prime seasons head-to-head with advanced visualizations.
        <br />
        <small style={{ opacity: 0.6 }}>
          ⚠️ The balldontlie API has best coverage for seasons from ~2000 onwards.
        </small>
      </p>

      {/* ── INPUT FORM ── */}
      <form onSubmit={handleCompare} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '16px',
        alignItems: 'end',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        {/* Player 1 */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: PLAYER_COLORS.p1, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Player 1
          </label>
          <input
            type="text"
            className="styled-input"
            value={player1.name}
            placeholder="e.g. LeBron James"
            onChange={(e) => setPlayer1(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <input
            type="number"
            className="styled-input"
            value={player1.season}
            min="1979"
            max={new Date().getFullYear()}
            onChange={(e) => setPlayer1(p => ({ ...p, season: parseInt(e.target.value) || p.season }))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Player 2 */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', color: PLAYER_COLORS.p2, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Player 2
          </label>
          <input
            type="text"
            className="styled-input"
            value={player2.name}
            placeholder="e.g. Kobe Bryant"
            onChange={(e) => setPlayer2(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <input
            type="number"
            className="styled-input"
            value={player2.season}
            min="1979"
            max={new Date().getFullYear()}
            onChange={(e) => setPlayer2(p => ({ ...p, season: parseInt(e.target.value) || p.season }))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="styled-button"
          disabled={isLoading}
          style={{ height: '48px', alignSelf: 'end' }}
        >
          {isLoading ? '⏳ Loading...' : '⚡ Compare'}
        </button>
      </form>

      {/* ── ERRORS ── */}
      {(player1.error || player2.error) && (
        <div style={{
          background: 'rgba(255,85,85,0.1)',
          border: '1px solid rgba(255,85,85,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          {player1.error && (
            <p style={{ color: '#ff7777', margin: '0 0 4px' }}>
              <strong>Player 1:</strong> {player1.error}
            </p>
          )}
          {player2.error && (
            <p style={{ color: '#ff7777', margin: 0 }}>
              <strong>Player 2:</strong> {player2.error}
            </p>
          )}
        </div>
      )}

      {/* ── RESULTS ── */}
      {bothLoaded ? (
        <>
          {/* Player name banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: PLAYER_COLORS.p1, fontWeight: 700, fontSize: '1.1rem' }}>{player1.name}</div>
              <div style={{ color: 'var(--color-text-secondary, #aaa)', fontSize: '0.8rem' }}>{player1.season}–{player1.season + 1} Season</div>
            </div>
            <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: PLAYER_COLORS.p2, fontWeight: 700, fontSize: '1.1rem' }}>{player2.name}</div>
              <div style={{ color: 'var(--color-text-secondary, #aaa)', fontSize: '0.8rem' }}>{player2.season}–{player2.season + 1} Season</div>
            </div>
          </div>

          {/* Quick stat cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            <StatCard label="Points"    p1Val={safeNum(p1Stats.pts).toFixed(1)}  p2Val={safeNum(p2Stats.pts).toFixed(1)}  p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="Rebounds"  p1Val={safeNum(p1Stats.reb).toFixed(1)}  p2Val={safeNum(p2Stats.reb).toFixed(1)}  p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="Assists"   p1Val={safeNum(p1Stats.ast).toFixed(1)}  p2Val={safeNum(p2Stats.ast).toFixed(1)}  p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="Steals"    p1Val={safeNum(p1Stats.stl).toFixed(1)}  p2Val={safeNum(p2Stats.stl).toFixed(1)}  p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="Blocks"    p1Val={safeNum(p1Stats.blk).toFixed(1)}  p2Val={safeNum(p2Stats.blk).toFixed(1)}  p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="FG%"       p1Val={`${safePct(p1Stats.fg_pct)}%`}    p2Val={`${safePct(p2Stats.fg_pct)}%`}    p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="3P%"       p1Val={`${safePct(p1Stats.fg3_pct)}%`}   p2Val={`${safePct(p2Stats.fg3_pct)}%`}   p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="FT%"       p1Val={`${safePct(p1Stats.ft_pct)}%`}    p2Val={`${safePct(p2Stats.ft_pct)}%`}    p1Name={player1.name} p2Name={player2.name} />
            <StatCard label="Min/Game"  p1Val={p1Stats.min ?? 'N/A'}             p2Val={p2Stats.min ?? 'N/A'}             p1Name={player1.name} p2Name={player2.name} />
          </div>

          {/* Charts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            {/* Radar */}
            <div style={{ flex: 1, minWidth: '320px', height: '380px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
                Overall Comparison
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stat" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                  <Radar
                    name={`${player1.name} (${player1.season})`}
                    dataKey="P1"
                    stroke={PLAYER_COLORS.p1}
                    fill={PLAYER_COLORS.p1}
                    fillOpacity={0.5}
                  />
                  <Radar
                    name={`${player2.name} (${player2.season})`}
                    dataKey="P2"
                    stroke={PLAYER_COLORS.p2}
                    fill={PLAYER_COLORS.p2}
                    fillOpacity={0.4}
                  />
                  <Legend />
                  <Tooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart */}
            <div style={{ flex: 2, minWidth: '380px', height: '380px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
                Statistical Breakdown
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" width={70} tick={{ fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Legend />
                  <Bar dataKey={player1.name} fill={PLAYER_COLORS.p1} radius={[0, 4, 4, 0]} />
                  <Bar dataKey={player2.name} fill={PLAYER_COLORS.p2} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        /* Empty state */
        !isLoading && (
          <div style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary, #888)',
            marginTop: '60px',
            padding: '40px',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '16px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <p style={{ fontSize: '1.1rem' }}>Enter two players and click <strong>Compare</strong> to see their stats.</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '8px' }}>
              Tip: Use seasons from 2000 onwards for best results (e.g. LeBron 2012, Kobe 2006).
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default PrimePredictor;
