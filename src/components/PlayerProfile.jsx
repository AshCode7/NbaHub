import React, { useState } from 'react';
import PlayerSilhouette from './PlayerSilhouette';

const PlayerProfile = ({ apiKey }) => {
  const [playerName, setPlayerName] = useState('Stephen Curry');
  const [playerData, setPlayerData] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear() - 1);
  const [seasonStats, setSeasonStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://api.balldontlie.io/v1';

  const fetchPlayerData = async (e) => {
    e.preventDefault();
    if (!playerName) return;

    setLoading(true);
    setError(null);
    setPlayerData(null);
    setSeasonStats(null);

    try {
      // 1. Get Player ID
      const playerRes = await fetch(`${API_BASE_URL}/players?search=${playerName}`, {
        headers: { 'Authorization': apiKey }
      });
      const playerResData = await playerRes.json();
      
      if (playerResData.data.length === 0) {
        throw new Error(`Player "${playerName}" not found.`);
      }
      const foundPlayer = playerResData.data[0];
      setPlayerData(foundPlayer);
      fetchStatsForPlayer(foundPlayer.id, season);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  const fetchStatsForPlayer = async (playerId, selectedSeason) => {
    setLoading(true);
    setError(null);
    setSeasonStats(null);
    try {
        // 2. Get Season Averages
        const statsRes = await fetch(`${API_BASE_URL}/season_averages?season=${selectedSeason}&player_ids[]=${playerId}`, {
            headers: { 'Authorization': apiKey }
        });
        const statsData = await statsRes.json();
        
        if (!statsData.data || statsData.data.length === 0) {
            throw new Error(`No stats found for the ${selectedSeason}-${selectedSeason+1} season.`);
        }
        setSeasonStats(statsData.data[0]);

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }

  // Handle season change for an already loaded player
  const handleSeasonChange = (newSeason) => {
    setSeason(newSeason);
    if(playerData) {
        fetchStatsForPlayer(playerData.id, newSeason);
    }
  }
  
  const StatCard = ({ label, value }) => (
    <div className="stat-card">
      <div className="stat-value">{value ?? '-'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <div className="player-profile-container fade-in">
        <style>{`
            .player-profile-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 48px;
                align-items: start;
                position: relative;
            }
            .profile-left, .profile-right { padding: 24px; }
            .profile-left { display: flex; flex-direction: column; gap: 24px; }
            .player-name-display { line-height: 1; }
            .player-name-first { font-family: var(--font-label); font-size: 3rem; color: var(--color-text-secondary); text-transform: uppercase; }
            .player-name-last { font-family: var(--font-heading); font-size: 8rem; color: var(--color-text-primary); margin-top: -20px; text-shadow: 0 0 20px var(--color-accent-primary); }
            .player-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
            .info-item { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border-left: 3px solid var(--color-accent-primary); }
            .info-item .label { font-family: var(--font-label); color: var(--color-text-secondary); font-size: 0.9rem; }
            .info-item .value { font-size: 1.5rem; font-weight: bold; }
            .profile-right { position: relative; }
            .silhouette-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
            .stat-card { background: var(--color-surface); backdrop-filter: blur(10px); padding: 20px; text-align: center; border-radius: var(--border-radius); border: 1px solid var(--color-border); transition: all 0.3s ease; }
            .stat-card:hover { transform: scale(1.05); border-color: var(--color-accent-primary); box-shadow: 0 0 15px rgba(79, 195, 247, 0.3); }
            .stat-value { font-family: var(--font-label); font-size: 2.5rem; font-weight: 700; color: var(--color-accent-primary); }
            .stat-label { color: var(--color-text-secondary); text-transform: uppercase; font-size: 0.9rem; }
            .loading-overlay, .error-message, .welcome-message { text-align: center; padding: 40px; }
             @media (max-width: 1024px) { .player-profile-container { grid-template-columns: 1fr; } .player-name-last {font-size: 6rem;} .profile-right { min-height: 400px; } }
             @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .player-name-last {font-size: 4rem;} }
        `}</style>

      <div className="profile-left">
        <form onSubmit={fetchPlayerData} className="controls-container">
            <input 
                type="text" 
                className="styled-input" 
                value={playerName} 
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Search Player Name"
                style={{flexGrow: 1}}
            />
            <button type="submit" className="styled-button" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </form>

        {playerData && (
            <div className="player-details fade-in">
                <div className="player-name-display">
                    <div className="player-name-first">{playerData.first_name}</div>
                    <div className="player-name-last">{playerData.last_name}</div>
                </div>
                <div className="player-info-grid">
                    <div className="info-item">
                        <div className="label">Position</div>
                        <div className="value">{playerData.position || 'N/A'}</div>
                    </div>
                    <div className="info-item">
                        <div className="label">Team</div>
                        <div className="value">{playerData.team.full_name}</div>
                    </div>
                    <div className="info-item">
                        <div className="label">Height</div>
                        <div className="value">{playerData.height_feet ? `${playerData.height_feet}' ${playerData.height_inches}"` : 'N/A'}</div>
                    </div>
                    <div className="info-item">
                        <div className="label">Weight</div>
                        <div className="value">{playerData.weight_pounds ? `${playerData.weight_pounds} lbs` : 'N/A'}</div>
                    </div>
                </div>
                 <div className="controls-container" style={{marginTop: '24px', justifyContent: 'flex-start'}}>
                    <label htmlFor="season-select" style={{fontFamily: 'var(--font-label)', textTransform: 'uppercase'}}>Season:</label>
                    <input 
                        id="season-select"
                        type="number" 
                        className="styled-input"
                        value={season}
                        onChange={e => handleSeasonChange(parseInt(e.target.value))}
                        min="1979"
                        max={new Date().getFullYear()}
                    />
                </div>
            </div>
        )}

      </div>
      <div className="profile-right">
        <div className="silhouette-bg"><PlayerSilhouette /></div>
        {loading && <div className="loading-overlay"><h3>Loading Stats...</h3></div>}
        {error && <div className="error-message"><h3>{error}</h3></div>}
        {!playerData && !loading && !error && <div className="welcome-message"><h2>Search for a player to view their profile.</h2></div>}

        {seasonStats && (
            <div className="stats-container fade-in">
                <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '2.5rem', textAlign: 'center'}}>{season}-{season+1} Season Averages</h3>
                <div className="stats-grid">
                    <StatCard label="Points" value={seasonStats.pts?.toFixed(1)} />
                    <StatCard label="Rebounds" value={seasonStats.reb?.toFixed(1)} />
                    <StatCard label="Assists" value={seasonStats.ast?.toFixed(1)} />
                    <StatCard label="Steals" value={seasonStats.stl?.toFixed(1)} />
                    <StatCard label="Blocks" value={seasonStats.blk?.toFixed(1)} />
                    <StatCard label="Turnovers" value={seasonStats.turnover?.toFixed(1)} />
                    <StatCard label="FG%" value={(seasonStats.fg_pct * 100)?.toFixed(1)} />
                    <StatCard label="3P%" value={(seasonStats.fg3_pct * 100)?.toFixed(1)} />
                    <StatCard label="FT%" value={(seasonStats.ft_pct * 100)?.toFixed(1)} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;