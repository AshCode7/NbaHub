import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PrimePredictor = ({ apiKey }) => {
  const [player1, setPlayer1] = useState({ name: 'LeBron James', season: 2012, stats: null, loading: false, error: null });
  const [player2, setPlayer2] = useState({ name: 'Michael Jordan', season: 1990, stats: null, loading: false, error: null });

  const API_BASE_URL = 'https://api.balldontlie.io/v1';

  const fetchPlayerStats = async (playerName, season, playerSetter) => {
    playerSetter(prev => ({ ...prev, loading: true, error: null, stats: null }));
    try {
      const playerRes = await fetch(`${API_BASE_URL}/players?search=${playerName}`, {
        headers: { 'Authorization': apiKey }
      });
      if (!playerRes.ok) throw new Error('Failed to fetch player data.');
      const playerData = await playerRes.json();
      
      if (!playerData.data || playerData.data.length === 0) {
        throw new Error(`Player "${playerName}" not found.`);
      }
      const player = playerData.data[0];

      const statsRes = await fetch(`${API_BASE_URL}/season_averages?season=${season}&player_ids[]=${player.id}`, {
        headers: { 'Authorization': apiKey }
      });
      if (!statsRes.ok) throw new Error(`Failed to fetch stats for ${season}.`);
      const statsData = await statsRes.json();

      if (!statsData.data || statsData.data.length === 0) {
        throw new Error(`No stats found for ${player.first_name} ${player.last_name} in the ${season}-${season+1} season.`);
      }

      playerSetter(prev => ({ ...prev, stats: statsData.data[0], loading: false }));
    } catch (error) {
      console.error("API Error:", error);
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

  const radarData = [
    { stat: 'PTS', P1: p1Stats?.pts || 0, P2: p2Stats?.pts || 0 },
    { stat: 'REB', P1: p1Stats?.reb || 0, P2: p2Stats?.reb || 0 },
    { stat: 'AST', P1: p1Stats?.ast || 0, P2: p2Stats?.ast || 0 },
    { stat: 'STL', P1: p1Stats?.stl || 0, P2: p2Stats?.stl || 0 },
    { stat: 'BLK', P1: p1Stats?.blk || 0, P2: p2Stats?.blk || 0 },
  ];

  const barData = [
    { name: 'Points', [player1.name]: p1Stats?.pts, [player2.name]: p2Stats?.pts },
    { name: 'Rebounds', [player1.name]: p1Stats?.reb, [player2.name]: p2Stats?.reb },
    { name: 'Assists', [player1.name]: p1Stats?.ast, [player2.name]: p2Stats?.ast },
    { name: 'FG%', [player1.name]: ((p1Stats?.fg_pct || 0) * 100).toFixed(1), [player2.name]: ((p2Stats?.fg_pct || 0) * 100).toFixed(1) },
    { name: '3P%', [player1.name]: ((p1Stats?.fg3_pct || 0) * 100).toFixed(1), [player2.name]: ((p2Stats?.fg3_pct || 0) * 100).toFixed(1) },
  ];

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <h2 className="feature-title">Prime Predictor</h2>
      <p className="feature-description">Enter two players and their prime seasons to compare their stats head-to-head using advanced visualizations.</p>

      <form onSubmit={handleCompare} className="controls-container">
        <div className="control-group">
