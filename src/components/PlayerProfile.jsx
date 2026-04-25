import React, { useState, useCallback } from 'react';
import PlayerSilhouette from './PlayerSilhouette';

const API_BASE = 'https://api.balldontlie.io/v1';

// Helper functions for formatting stats
const fmt    = (v, d = 1) => v != null ? Number(v).toFixed(d) : '—';
const pct    = (v)        => v != null ? (v * 100).toFixed(1) : '—';

// StatPill component to display individual stats nicely
const StatPill = ({ label, value }) => (
  <div className="stat-pill">
    <span className="stat-pill-value">{value}</span>
    <span className="stat-pill-label">{label}</span>
  </div>
);

const PlayerProfile = ({ apiKey }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to search for players
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    setSelectedPlayer(null); // Clear previous selection
    setPlayerStats(null);
    setSearchResults([]);

    try {
      const response = await fetch(`${API_BASE}/players?search=${encodeURIComponent(searchQuery)}&per_page=12`, { 
        headers: { Authorization: apiKey } 
      });
      if (!response.ok) throw new Error(`API error ${response.status}`);
      const data = await response.json();
      if (!data.data?.length) throw new Error(`No players found for "${searchQuery}".`);
      
      setSearchResults(data.data);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, apiKey]);

  // Function to select a player from search results and fetch their stats
  const handleSelectPlayer = useCallback(async (player) => {
    setLoading(true);
    setError(null);
    setSelectedPlayer(player);
    setPlayerStats(null);
    setSearchResults([]); // Hide search results

    try {
      // Try to get stats for the most recent completed season first
      const currentYear = new Date().getFullYear();
      for (const season of [currentYear - 1, currentYear - 2, currentYear - 3]) {
        const response = await fetch(`${API_BASE}/season_averages?season=${season}&player_ids[]=${player.id}`, { 
          headers: { Authorization: apiKey } 
        });
        const data = await response.json();
        if (data.data?.length > 0) {
          setPlayerStats(data.data[0]);
          setLoading(false); // Set loading to false here
          return; // Exit after finding stats
        }
      }
      // If no recent stats found, set stats to null but don't show an error
      setPlayerStats(null); 
    } catch (e) {
      setError('Could not fetch player stats.');
    } finally {
      setLoading(false); // Ensure loading is always set to false
    }
  }, [apiKey]);
  
  // Renders the main content based on the current state
  const renderContent = () => {
    if (loading) {
      return <div className="loading-state"><span>⏳</span> Loading...</div>;
    }
    
    if (searchResults.length > 0) {
      return (
        <div className="search-results-grid fade-in">
          {searchResults.map(player => (
            <div key={player.id} className="player-card glass-card-sm" onClick={() => handleSelectPlayer(player)}>
              <div className="silhouette-container">
                <PlayerSilhouette />
              </div>
              <div className="player-card-info">
                <h3 className="player-card-name">{player.first_name} {player.last_name}</h3>
                <p className="player-card-team">{player.team.full_name}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (selectedPlayer) {
      return (
        <div className="glass-card fade-in">
          <div className="profile-header">
            <div className="profile-name">
              <h1 className="feature-title" style={{textAlign: 'left', margin: 0}}>{selectedPlayer.first_name} {selectedPlayer.last_name}</h1>
              <p className="feature-description" style={{textAlign: 'left', margin: '4px 0 0 0', maxWidth: 'none'}}>{selectedPlayer.team.full_name} | #{selectedPlayer.jersey_number || 'N/A'} | {selectedPlayer.position}</p>
            </div>
          </div>
          <div className="divider" />
          <div className="section-label">Player Bio</div>
          <div className="bio-grid">
            <p><strong>Height:</strong> {selectedPlayer.height || 'N/A'}</p>
            <p><strong>Weight:</strong> {selectedPlayer.weight ? `${selectedPlayer.weight} lbs` : 'N/A'}</p>
            <p><strong>Country:</strong> {selectedPlayer.country || 'N/A'}</p>
            <p><strong>Draft:</strong> {selectedPlayer.draft_year || 'N/A'} {selectedPlayer.draft_round && `R${selectedPlayer.draft_round}`} {selectedPlayer.draft_number && `P${selectedPlayer.draft_number}`}</p>
          </div>
          <div className="divider" />
          <div className="section-label">
            {playerStats ? `Most Recent Season Averages (${playerStats.season}-${playerStats.season + 1})` : 'Recent Season Averages'}
          </div>
          {playerStats ? (
            <div className="stat-row">
              <StatPill label="PPG" value={fmt(playerStats.pts)} />
              <StatPill label="RPG" value={fmt(playerStats.reb)} />
              <StatPill label="APG" value={fmt(playerStats.ast)} />
              <StatPill label="FG%" value={pct(playerStats.fg_pct)} />
              <StatPill label="3P%" value={pct(playerStats.fg3_pct)} />
              <StatPill label="FT%" value={pct(playerStats.ft_pct)} />
              <StatPill label="MIN" value={playerStats.min} />
            </div>
          ) : (
            <p style={{color: 'var(--text-secondary)'}}>No recent season stats available for this player.</p>
          )}
        </div>
      );
    }

    // Default initial state
    return (
      <div className="initial-prompt">
        <span style={{fontSize: '3rem', opacity: 0.3}}>👤</span>
        <h2 style={{color: 'var(--text-primary)'}}>Search for an NBA Player</h2>
        <p style={{color: 'var(--text-secondary)'}}>Enter a player's name above to see their profile and stats.</p>
      </div>
    );
  };


  return (
    <div className="profile-container fade-in">
      <style>{`
        .profile-container { padding: 24px; max-width: 900px; margin: 0 auto; }
        .search-form { display: flex; gap: 10px; margin-bottom: 24px; }
        .search-form .styled-input { flex-grow: 1; }
        .loading-state, .initial-prompt { text-align: center; padding: 80px 20px; color: var(--text-secondary); }
        .loading-state span { font-size: 2rem; display: block; margin-bottom: 10px; }
        .error-message { text-align: center; color: #f87171; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 24px; }
        .search-results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .player-card { cursor: pointer; transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s var(--ease); display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden; }
        .player-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-color: var(--border-active); }
        .silhouette-container { width: 60px; height: 60px; flex-shrink: 0; position: relative; }
        .player-card-info { position: relative; z-index: 1; }
        .player-card-name { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary); margin-bottom: 2px; }
        .player-card-team { font-size: 0.8rem; color: var(--text-secondary); }
        .profile-header { display: flex; align-items: center; justify-content: space-between; }
        .bio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.9rem; color: var(--text-secondary); }
        .bio-grid p strong { color: var(--text-primary); font-weight: 500; }
      `}</style>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          className="styled-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search player (e.g., Stephen Curry, LeBron...)"
        />
        <button type="submit" className="styled-button" disabled={loading}>Search</button>
      </form>
      
      {error && <div className="error-message">{error}</div>}

      {renderContent()}

    </div>
  );
};

export default PlayerProfile;