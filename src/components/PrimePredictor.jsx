import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Component for player stats comparison
const PrimePredictor = ({ apiKey }) => {
  const [player1, setPlayer1] = useState({ name: 'LeBron James', season: 2012, stats: null, loading: false, error: null });
  const [player2, setPlayer2] = useState({ name: 'Michael Jordan', season: 1996, stats: null, loading: false, error: null });

  // Function to fetch player data and then their season stats
  const fetchPlayerStats = async (playerName, season, playerSetter) => {
    playerSetter(prev => ({ ...prev, loading: true, error: null }));
    try {
      // 1. Get Player ID
      const playerRes = await fetch(`https://www.balldontlie.io/api/v1/players?search=${playerName}`);
      const playerData = await playerRes.json();
      const player = playerData.data.find(p => p.first_name.toLowerCase() === playerName.split(' ')[0].toLowerCase() && p.last_name.toLowerCase() === playerName.split(' ')[1].toLowerCase());

      if (!player) {
        throw new Error(`Player "${playerName}" not found.`);
      }

      // 2. Get Season Averages for that player ID and season
      const statsRes = await fetch(`https://www.balldontlie.io/api/v1/season_averages?season=${season}&player_ids[]=${player.id}`);
      const statsData = await statsRes.json();

      if (!statsData.data || statsData.data.length === 0) {
        throw new Error(`No stats found for ${playerName} in the ${season}-${season+1} season.`);
      }

      playerSetter(prev => ({ ...prev, stats: statsData.data[0], loading: false }));
    } catch (error) {
      console.error("API Error:", error);
      playerSetter(prev => ({ ...prev, stats: null, loading: false, error: error.message }));
    }
  };

  const handleCompare = () => {
    fetchPlayerStats(player1.name, player1.season, setPlayer1);
    fetchPlayerStats(player2.name, player2.season, setPlayer2);
  };
  
  // Prepare data for Recharts
  const radarData = [
    { stat: 'PTS', P1: player1.stats?.pts || 0, P2: player2.stats?.pts || 0, fullMark: 40 },
    { stat: 'REB', P1: player1.stats?.reb || 0, P2: player2.stats?.reb || 0, fullMark: 15 },
    { stat: 'AST', P1: player1.stats?.ast || 0, P2: player2.stats?.ast || 0, fullMark: 12 },
    { stat: 'STL', P1: player1.stats?.stl || 0, P2: player2.stats?.stl || 0, fullMark: 3 },
    { stat: 'BLK', P1: player1.stats?.blk || 0, P2: player2.stats?.blk || 0, fullMark: 4 },
  ];

  const barData = [
    { name: 'Points', [player1.name]: player1.stats?.pts, [player2.name]: player2.stats?.pts },
    { name: 'Rebounds', [player1.name]: player1.stats?.reb, [player2.name]: player2.stats?.reb },
    { name: 'Assists', [player1.name]: player1.stats?.ast, [player2.name]: player2.stats?.ast },
    { name: 'Steals', [player1.name]: player1.stats?.stl, [player2.name]: player2.stats?.stl },
    { name: 'Blocks', [player1.name]: player1.stats?.blk, [player2.name]: player2.stats?.blk },
    { name: 'FG%', [player1.name]: (player1.stats?.fg_pct * 100).toFixed(1), [player2.name]: (player2.stats?.fg_pct * 100).toFixed(1) },
    { name: '3P%', [player1.name]: (player1.stats?.fg3_pct * 100).toFixed(1), [player2.name]: (player2.stats?.fg3_pct * 100).toFixed(1) },
  ];


  return (
    <div className="fade-in">
      <h2 className="feature-title">Prime Predictor</h2>
      <p className="feature-description">Enter two players and their prime seasons to compare their stats head-to-head using advanced visualizations.</p>

      <div className="controls-container">
        {/* Player 1 Controls */}
        <div className="control-group">
          <label>Player 1</label>
          <input 
            type="text" 
            className="styled-input"
            value={player1.name} 
            onChange={(e) => setPlayer1(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Michael Jordan"
          />
          <input 
            type="number" 
            className="styled-input"
            value={player1.season} 
            onChange={(e) => setPlayer1(p => ({ ...p, season: parseInt(e.target.value) }))}
            placeholder="e.g. 1996"
          />
        </div>

        {/* Player 2 Controls */}
        <div className="control-group">
          <label>Player 2</label>
          <input 
            type="text" 
            className="styled-input"
            value={player2.name} 
            onChange={(e) => setPlayer2(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Kobe Bryant"
          />
          <input 
            type="number" 
            className="styled-input"
            value={player2.season} 
            onChange={(e) => setPlayer2(p => ({ ...p, season: parseInt(e.target.value) }))}
            placeholder="e.g. 2005"
          />
        </div>

        <button className="styled-button" onClick={handleCompare} disabled={player1.loading || player2.loading}>
          {player1.loading || player2.loading ? 'Loading...' : 'Compare'}
        </button>
      </div>

      {(player1.error || player2.error) && (
        <div style={{ color: 'var(--color-accent-red)', textAlign: 'center', marginBottom: '16px' }}>
          {player1.error && <p>Player 1 Error: {player1.error}</p>}
          {player2.error && <p>Player 2 Error: {player2.error}</p>}
        </div>
      )}

      {player1.stats && player2.stats && (
        <div className="charts-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginTop: '32px' }}>
          <div style={{ flex: 1, minWidth: '400px', height: '400px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-label)', marginBottom: '16px' }}>Overall Comparison</h3>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" stroke="var(--color-text-primary)" />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                <Radar name={`${player1.name} (${player1.season})`} dataKey="P1" stroke="#f7a000" fill="#f7a000" fillOpacity={0.6} />
                <Radar name={`${player2.name} (${player2.season})`} dataKey="P2" stroke="#c8102e" fill="#c8102e" fillOpacity={0.6} />
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)'}}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 2, minWidth: '500px', height: '400px' }}>
            <h3 style={{ textAlign: 'center', fontFamily: 'var(--font-label)', marginBottom: '16px' }}>Statistical Breakdown</h3>
            <ResponsiveContainer>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="var(--color-text-secondary)" />
                <YAxis type="category" dataKey="name" stroke="var(--color-text-secondary)" width={80}/>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)'}}/>
                <Legend />
                <Bar dataKey={player1.name} fill="#f7a000" />
                <Bar dataKey={player2.name} fill="#c8102e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimePredictor;