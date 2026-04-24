import React, { useState, useEffect } from 'react';

// Mock data to perfectly replicate the UI from the reference image.
// This is used as a base and will be enriched by actual API data where possible.
const STEPHEN_CURRY_MOCK_DATA = {
    image: "https://i.ibb.co/b3S00T1/curry-bg.png", // Background image for the component
    logo: "https://i.ibb.co/3WqYz5b/gsw-logo.png", // Team logo
    born: "03/14/1988",
    from: "Davidson",
    nbaDebut: "2009",
    previously: "GSW 2009-18",
    postseason: { MPG: 37, FG: 45.1, "3P%": 39.5, "FT%": 95.7, PPG: 25.5, RPG: 6.1, APG: 5.4, BPG: 0.7 },
    career: { MPG: 34.4, FG: 47.7, "3P%": 43.6, "FT%": 90.3, PPG: 23.1, RPG: 4.4, APG: 6.8, BPG: 0.2 }
};

const PlayerProfile = ({ apiKey }) => {
    const [playerNameInput, setPlayerNameInput] = useState('Stephen Curry');
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'https://api.balldontlie.io/v1';

    const fetchPlayerInfo = async (name) => {
        setLoading(true);
        setError(null);
        setPlayerData(null); // Clear previous player data
        
        try {
            const playerRes = await fetch(`${API_BASE_URL}/players?search=${name}`, {
                headers: { 'Authorization': apiKey }
            });
            if (!playerRes.ok) throw new Error('Failed to fetch player data.');
            const playerDataResponse = await playerRes.json();
            
            if (!playerDataResponse.data || playerDataResponse.data.length === 0) {
                throw new Error(`Player "${name}" not found.`);
            }
            // Find the most relevant player (e.g., exact match or first result)
            const foundPlayer = playerDataResponse.data.find(p => 
                `${p.first_name} ${p.last_name}`.toLowerCase() === name.toLowerCase()
            ) || playerDataResponse.data[0];

            // For now, we're using mock stats to perfectly match the image.
            // In a real advanced app, you'd fetch real season/career averages here
            // using `foundPlayer.id` and the season_averages endpoint.
            setPlayerData({ ...foundPlayer, mock_data: STEPHEN_CURRY_MOCK_DATA });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Stephen Curry's data on initial component mount
    useEffect(() => {
        fetchPlayerInfo(playerNameInput);
    }, [apiKey]); // Removed playerNameInput from dependencies to only run once. Will fetch on button click.

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPlayerInfo(playerNameInput);
    };

    if (loading && !playerData) { // Only show full loading screen if no data exists yet
        return <div className="profile-message">Loading Player Profile...</div>;
    }
    
    if (error && !playerData) { // Only show full error screen if no data exists yet
        return <div className="profile-message error">Error: {error}</div>;
    }

    // Default view if no player is found or initial load
    if (!playerData) {
        return (
            <div className="player-profile-fullscreen no-bg fade-in">
                <div className="profile-overlay">
                    <form onSubmit={handleSearchSubmit} className="search-form-overlay">
                        <input 
                            type="text" 
                            className="styled-input large-input" 
                            value={playerNameInput} 
                            onChange={e => setPlayerNameInput(e.target.value)}
                            placeholder="Search Player Name (e.g., Stephen Curry)"
                        />
                        <button type="submit" className="styled-button" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                    </form>
                    {error && <p className="error-text-overlay">Error: {error}</p>}
                    {!loading && !error && <p className="hint-text-overlay">Start by searching for a player above.</p>}
                </div>
                <style>{`
                    .no-bg { background-color: var(--color-background); }
                    .search-form-overlay { display: flex; flex-direction: column; gap: 20px; align-items: center; max-width: 500px; margin: auto; padding-top: 20vh; }
                    .large-input { font-size: 1.5rem; padding: 15px; width: 100%; text-align: center;}
                    .error-text-overlay { color: #e57373; margin-top: 20px; font-size: 1.1rem;}
                    .hint-text-overlay { color: var(--color-text-secondary); margin-top: 20px; font-style: italic; font-size: 1.1rem;}
                `}</style>
            </div>
        );
    }

    // Player data is available, render the profile
    const currentMockStats = playerData.mock_data; // Use the mock data attached to the player for display

    return (
        <div className="player-profile-fullscreen fade-in" style={{ backgroundImage: `url(${currentMockStats.image})` }}>
            <div className="profile-overlay">
                <div className="search-bar-top">
                     <form onSubmit={handleSearchSubmit} className="search-form-inline">
                        <input 
                            type="text" 
                            className="styled-input" 
                            value={playerNameInput} 
                            onChange={e => setPlayerNameInput(e.target.value)}
                            placeholder="Search another player..."
                        />
                        <button type="submit" className="styled-button small-button" disabled={loading}>
                            {loading ? '...' : 'Search'}
                        </button>
                    </form>
                    {loading && <span className="inline-loading">Loading...</span>}
                    {error && <span className="inline-error">{error}</span>}
                </div>

                <div className="profile-content">
                    <div className="profile-info-left">
                        <div className="player-name-section">
                            <span className="player-name-first">{playerData.first_name}</span>
                            <h1 className="player-name-last">{playerData.last_name}</h1>
                        </div>

                        <div className="player-team-info">
                            {currentMockStats.logo && <img src={currentMockStats.logo} alt="Team Logo" className="team-logo" />}
                            <span className="team-number">#{playerData.jersey_number || 30}</span>
                            <span className="team-position">{playerData.position || 'G'}</span>
                            <button className="follow-button">Follow</button>
                        </div>

                        <div className="player-bio-grid">
                            <div className="bio-item">
