import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PrimePredictor = ({ apiKey }) => {
  const [player1, setPlayer1] = useState({ name: 'LeBron James', season: 2012, stats: null, loading: false, error: null });
  const [player2, setPlayer2] = useState({ name: 'Michael Jordan', season: 1990, stats: null, loading: false, error: null });

  const API_BASE_URL = 'https://api.balldontlie.io/v1';

  const fetchPlayerStats = async (playerName, season, playerSetter) => {
    console.log(`--- [DEBUG] Starting fetch for ${playerName} in ${season} ---`);
    playerSetter(prev => ({ ...prev, loading: true, error: null, stats: null }));
    
    try {
      // 1. Fetch Player ID
      const playerSearchUrl = `${API_BASE_URL}/players?search=${playerName}`;
      console.log(`[DEBUG] Fetching player URL: ${playerSearchUrl}`);
      const playerRes = await fetch(playerSearchUrl, { headers: { 'Authorization': apiKey } });

      if (!playerRes.ok) {
        throw new Error(`API request failed with status: ${playerRes.status}`);
      }
      
      const playerData = await playerRes.json();
      console.log(`[DEBUG] API Response for "${playerName}" search:`, playerData);

      if (!playerData.data || playerData.data.length === 0) {
        throw new Error(`Player "${playerName}" not found in the API response.`);
      }
      
      const player = playerData.data[0];
      console.log(`[DEBUG] Found Player ID: ${player.id} for ${player.first_name} ${player.last_name}`);

      // 2. Fetch Season Stats with Player ID
      const statsUrl = `${API_BASE_URL}/season_averages?season=${season}&player_ids[]=${player.id}`;
      console.log(`[DEBUG] Fetching stats URL: ${statsUrl}`);
      const statsRes = await fetch(statsUrl, { headers: { 'Authorization': apiKey } });

      if (!statsRes.ok) {
        throw new Error(`API request for stats failed with status: ${statsRes.status}`);
      }

      const statsData = await statsRes.json();
      console.log(`[DEBUG] API Response for ${season} stats:`, statsData);

      if (!statsData.data || statsData.data.length === 0) {
        throw new Error(`No stats found for ${player.first_name} ${player.last_name} in the ${season}-${season+1} season.`);
      }

      console.log(`[DEBUG] Successfully fetched stats. Updating state.`);
      playerSetter(prev => ({ ...prev, stats: statsData.data[0], loading: false }));

    } catch (error) {
      console.error(`--- [ERROR] Fetching data for ${playerName} failed ---`, error);
      playerSetter(prev => ({ ...prev, stats: null, loading: false, error: error.message }));
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    fetchPlayerStats(player1.name, player1.season, setPlayer1);
    fetchPlayerStats(player2.name, player2.season, setPlayer2);
  };
  
  const p1Stats = player1.stats;
  const p2Stats = player2.stats;

  const radarData = p1Stats && p2Stats ? [
    { stat: 'PTS', P1: p1Stats.pts || 0, P2: p2Stats.pts || 0 },
    { stat: 'REB', P1: p1Stats.reb || 0, P2: p2Stats.reb || 0 },
    { stat: 'AST', P1: p1Stats.ast || 0, P2: p2Stats.ast || 0 },
    { stat: 'STL', P1: p1Stats.stl || 0, P2: p2Stats.stl || 0 },
    { stat: 'BLK', P1: p1Stats.blk || 0, P2: p2Stats.blk || 0 },
  ] : [];

  const barData = p1Stats && p2Stats ? [
    { name: 'Points', [player1.name]: p1Stats.pts, [player2.name]: p2Stats.pts },
    { name: 'Rebounds', [player1.name]: p1Stats.reb, [player2.name]: p2Stats.reb },
    { name: 'Assists', [player1.name]: p1Stats.ast, [player2.name]: p2Stats.ast },
    { name: 'FG%', [player1.name]: (p1Stats.fg_pct * 100).toFixed(1), [player2.name]: (p2Stats.fg_pct * 100).toFixed(1) },
    { name: '3P%', [player1.name]: (p1Stats.fg3_pct * 100).toFixed(1), [player2.name]: (p2Stats.fg3_pct * 100).toFixed(1) },
  ] : [];

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <h2 className="feature-title">Prime Predictor</h2>
      <p className="feature-description">Enter two players and their prime seasons to compare their stats head-to-head using advanced visualizations.</p>

      <form onSubmit={handleCompare} className="controls-container">
        <div className="control-group">
          <label>Player 1</label>
          <input type="text" className="styled-input" value={player1.name} onChange={(e) => setPlayer1(p => ({ ...p, name: e.target.value }))} />
          <input type="number" className="styled-input" value={player1.season} min="1979" max={new Date().getFullYear()} onChange={(e) => setPlayer1(p => ({ ...p, season: parseInt(e.target.value) }))} />
        </div>
        <div className="control-group">
          <label>Player 2</label>
          <input type="text" className="styled-input" value={player2.name} onChange={(e) => setPlayer2(p => ({ ...p, name: e.target.value }))} />
          <input type="number" className="styled-input" value={player2.season} min="1979" max={new Date().getFullYear()} onChange={(e) => setPlayer2(p => ({ ...p, season: parseInt(e.target.value) }))} />
        </div>
        <button type="submit" className="styled-button" disabled={player1.loading || player2.loading}>
          {player1.loading || player2.loading ? 'Loading...' : 'Compare'}
        </button>
      </form>

      <div style={{ color: '#ff5555', textAlign: 'center', marginBottom: '16px', minHeight: '40px' }}>
          {player1.error && <p>Player 1 Error: {player1.error}</p>}
          {player2.error && <p>Player 2 Error: {player2.error}</p>}
      </div>

      {player1.stats && player2.stats ? (
        <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginTop: '32px' }}>
          <div style={{ flex: 1, minWidth: '400px', height: '400px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-label)', marginBottom: '16px' }}>Overall Comparison</h3>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="stat" stroke="var(--color-text-primary)" />
                <Radar name={`${player1.name} (${player1.season})`} dataKey="P1" stroke="var(--color-accent-primary)" fill="var(--color-accent-primary)" fillOpacity={0.6} />
                <Radar name={`${player2.name} (${player2.season})`} dataKey="P2" stroke="#e0f7fa" fill="#e0f7fa" fillOpacity={0.5} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', borderRadius: '8px' }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 2, minWidth: '500px', height: '400px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-label)', marginBottom: '16px' }}>Statistical Breakdown</h3>
            <ResponsiveContainer>
              <BarChart data={barData} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" stroke="var(--color-text-secondary)" />
                <YAxis type="category" dataKey="name" stroke="var(--color-text-secondary)" width={80} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', borderRadius: '8px' }} cursor={{fill: 'rgba(79, 195, 247, 0.1)'}}/>
                <Legend />
                <Bar dataKey={player1.name} fill="var(--color-accent-primary)" />
                <Bar dataKey={player2.name} fill="var(--color-highlight)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div style={{textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '50px'}}>
            <p>Enter two players and click compare to see their stats.</p>
        </div>
      )}
    </div>
  );
};

export default PrimePredictor;
