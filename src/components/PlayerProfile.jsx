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
            if (!playerRes.ok) throw new Error('Network response was not ok');
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
        // Only fetch on initial mount, subsequent searches are handled by button click
        fetchPlayerInfo(playerNameInput); 
    }, [apiKey]); 

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
                                <span className="bio-label">Height</span>
                                <span className="bio-value">{playerData.height_feet ? `${playerData.height_feet}' ${playerData.height_inches}"` : '6ft 3in'}</span>
                            </div>
                            <div className="bio-item">
                                <span className="bio-label">Weight</span>
                                <span className="bio-value">{playerData.weight_pounds ? `${playerData.weight_pounds} lbs` : '190 lbs'}</span>
                            </div>
                             <div className="bio-item">
                                <span className="bio-label">Born</span>
                                <span className="bio-value">{currentMockStats.born}</span>
                            </div>
                            <div className="bio-item">
                                <span className="bio-label">From</span>
                                <span className="bio-value">{currentMockStats.from}</span>
                            </div>
                             <div className="bio-item">
                                <span className="bio-label">NBA Debut</span>
                                <span className="bio-value">{currentMockStats.nbaDebut}</span>
                            </div>
                            <div className="bio-item">
                                <span className="bio-label">Previously</span>
                                <span className="bio-value">{currentMockStats.previously}</span>
                            </div>
                        </div>
                    </div>
                    {/* The right side is intentionally empty to let the player image show */}
                    <div className="profile-info-right"></div>
                </div>

                <div className="stats-table-container">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th></th>
                                {Object.keys(currentMockStats.postseason).map(key => <th key={key}>{key}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="row-header">Postseason</td>
                                {Object.values(currentMockStats.postseason).map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td className="row-header">Career Stats</td>
                                {Object.values(currentMockStats.career).map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .player-profile-fullscreen {
                    width: 100%;
                    height: calc(100vh - var(--header-height));
                    background-size: contain; /* Adjusted from 'cover' to 'contain' to match image more closely */
                    background-position: right center;
                    background-repeat: no-repeat;
                    position: relative;
                }
                .profile-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    /* Updated gradient to match image reference, slightly darker left, more transparent right */
                    background: linear-gradient(90deg, #0A0A0F 35%, rgba(10, 10, 15, 0.8) 55%, rgba(10, 10, 15, 0) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 3vw 4vw; /* Adjusted padding for better fit */
                }
                .search-bar-top {
                    display: flex;
                    justify-content: flex-end; /* Align search bar to the right */
                    width: 100%;
                    align-items: center;
                    gap: 15px;
                }
                .search-form-inline {
                    display: flex;
                    gap: 10px;
                }
                .search-form-inline .styled-input {
                    padding: 8px 15px;
                    font-size: 0.95rem;
                    max-width: 250px;
                }
                .search-form-inline .small-button {
                    padding: 8px 18px;
                    font-size: 0.9rem;
                }
                .inline-loading, .inline-error {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                }
                .inline-error { color: #e57373; }

                .profile-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
                    align-items: center; /* Vertically center content */
                }
                .profile-info-left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .player-name-section {
                    line-height: 0.8;
                }
                .player-name-first {
                    font-family: var(--font-body);
                    font-weight: 300;
                    font-size: clamp(2rem, 5vw, 4rem);
                    color: var(--color-text-secondary);
                    text-transform: uppercase;
                }
                .player-name-last {
                    font-family: var(--font-heading);
                    font-size: clamp(6rem, 12vw, 11rem);
                    color: var(--color-text-primary);
                }
                .player-team-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-top: 24px;
                }
                .team-logo { height: 40px; }
                .team-number, .team-position {
                    font-family: var(--font-label);
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    border-left: 1px solid var(--color-border);
                    padding-left: 16px;
                }
                .follow-button {
                    background: transparent;
                    border: 1px solid var(--color-accent-primary);
                    color: var(--color-accent-primary);
                    padding: 8px 24px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                .follow-button:hover { background-color: var(--color-accent-primary); color: var(--color-background); }
                .player-bio-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px 32px;
                    margin-top: 32px;
                    max-width: 450px;
                }
                .bio-item { display: flex; flex-direction: column; }
                .bio-label { font-size: 0.9rem; color: var(--color-text-secondary); }
                .bio-value { font-size: 1.1rem; font-weight: 500; color: var(--color-text-primary); }
                
                .stats-table-container {
                    background-color: rgba(10, 10, 15, 0.5);
                    backdrop-filter: blur(8px);
                    border: 1px solid var(--color-border);
                    border-radius: var(--border-radius);
                    padding: 16px;
                    width: 100%; /* Ensure table takes full width of its container */
                }
                .stats-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: var(--font-body);
                }
                .stats-table th, .stats-table td {
                    text-align: center;
                    padding: 12px 8px;
                    font-size: 1rem;
                }
                .stats-table th {
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }
                .stats-table tbody tr:first-child td { border-bottom: 1px solid var(--color-border); }
                .stats-table .row-header { text-align: left; font-weight: 600; color: var(--color-text-primary); }
                
                /* Responsive Adjustments */
                @media (max-width: 900px) {
                    .player-profile-fullscreen { 
                        background-size: cover; /* Change to cover on smaller screens for better image fit */
                        background-position: center; 
                    }
                    .profile-overlay { 
                        background: linear-gradient(180deg, #0A0A0F 0%, rgba(10, 10, 15, 0.7) 40%, #0A0A0F 100%); /* Stacked gradient */
                        padding: 20px;
                    }
                    .profile-content { 
                        grid-template-columns: 1fr; /* Single column layout */
                        height: auto;
                    }
                    .profile-info-left { 
                        align-items: center; /* Center items for single column */
                        text-align: center;
                    }
                    .player-name-section { margin-top: 50px;} /* Push down a bit from top */
                    .player-team-info { justify-content: center; }
                    .team-number, .team-position { border-left: none; padding-left: 0; }
                    .profile-info-right { display: none; } /* Hide the right empty column */
                    .search-bar-top { justify-content: center; margin-bottom: 20px;}
                    .player-bio-grid { max-width: 100%; }
                    .stats-table-container { margin-top: 30px; }
                }
                 @media (max-width: 768px) {
                     .player-name-first { font-size: 1.8rem; }
                     .player-name-last { font-size: 5rem; }
                     .player-team-info { flex-wrap: wrap; justify-content: center; }
                     .stats-table th, .stats-table td { padding: 8px 4px; font-size: 0.9rem; }
                     .player-bio-grid { grid-template-columns: 1fr; }
                 }
            `}</style>
        </div>
    );
};

export default PlayerProfile;
