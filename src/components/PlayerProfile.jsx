import React, { useState, useEffect } from 'react';

// Mock data to perfectly replicate the UI from the reference image.
const STEPHEN_CURRY_MOCK_STATS = {
    image: "https://i.ibb.co/b3S00T1/curry-bg.png", // Background image for the component
    logo: "https://i.ibb.co/3WqYz5b/gsw-logo.png", // Team logo
    postseason: { MPG: 37, FG: 45.1, "3P%": 39.5, "FT%": 95.7, PPG: 25.5, RPG: 6.1, APG: 5.4, BPG: 0.7 },
    career: { MPG: 34.4, FG: 47.7, "3P%": 43.6, "FT%": 90.3, PPG: 23.1, RPG: 4.4, APG: 6.8, BPG: 0.2 }
};

const PlayerProfile = ({ apiKey }) => {
    const [playerData, setPlayerData] = useState(null);
    const [displayStats, setDisplayStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialPlayer = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.balldontlie.io/v1/players?search=Stephen Curry`, {
                    headers: { 'Authorization': apiKey }
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (data.data.length === 0) throw new Error('Player not found');
                
                const curryData = data.data.find(p => p.last_name === 'Curry' && p.first_name === 'Stephen');
                setPlayerData(curryData);
                setDisplayStats(STEPHEN_CURRY_MOCK_STATS);

            } catch (err) {
                setError(err.message);
                setPlayerData(null);
                setDisplayStats(null);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialPlayer();
    }, [apiKey]);

    if (loading) {
        return <div className="profile-message">Loading Player Profile...</div>;
    }
    
    if (error) {
        return <div className="profile-message error">Error: {error}</div>;
    }

    if (!playerData || !displayStats) {
        return <div className="profile-message">No player data available.</div>;
    }

    return (
        <div className="player-profile-fullscreen fade-in" style={{ backgroundImage: `url(${displayStats.image})` }}>
            <div className="profile-overlay">
                <div className="profile-content">
                    <div className="profile-info-left">
                        <div className="player-name-section">
                            <span className="player-name-first">{playerData.first_name}</span>
                            <h1 className="player-name-last">{playerData.last_name}</h1>
                        </div>

                        <div className="player-team-info">
                            <img src={displayStats.logo} alt="Team Logo" className="team-logo" />
                            <span className="team-number">#{playerData.jersey_number || 30}</span>
                            <span className="team-position">{playerData.position}</span>
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
                                <span className="bio-value">03/14/1988</span>
                            </div>
                            <div className="bio-item">
                                <span className="bio-label">From</span>
                                <span className="bio-value">Davidson</span>
                            </div>
                             <div className="bio-item">
                                <span className="bio-label">NBA Debut</span>
                                <span className="bio-value">2009</span>
                            </div>
                            <div className="bio-item">
                                <span className="bio-label">Previously</span>
                                <span className="bio-value">GSW 2009-18</span>
                            </div>
                        </div>
                    </div>
                    <div className="profile-info-right"></div>
                </div>

                <div className="stats-table-container">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th></th>
                                {Object.keys(displayStats.postseason).map(key => <th key={key}>{key}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="row-header">Postseason</td>
                                {Object.values(displayStats.postseason).map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                            <tr>
                                <td className="row-header">Career Stats</td>
                                {Object.values(displayStats.career).map((val, i) => <td key={i}>{val}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .profile-message {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: calc(100vh - var(--header-height));
                    font-size: 1.5rem;
                    color: var(--color-text-secondary);
                }
                .profile-message.error { color: #e57373; }

                .player-profile-fullscreen {
                    width: 100%;
                    height: calc(100vh - var(--header-height));
                    background-size: contain;
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
                    background: linear-gradient(90deg, #0A0A0F 40%, rgba(10, 10, 15, 0.7) 60%, rgba(10, 10, 15, 0) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 4vw;
                }
                .profile-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
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
                
                @media (max-width: 900px) {
                    .player-profile-fullscreen { background-position: 120% center; }
                    .profile-overlay { background: linear-gradient(90deg, #0A0A0F 60%, rgba(10, 10, 15, 0.7) 85%, rgba(10, 10, 15, 0) 100%); }
                    .profile-content { grid-template-columns: 1fr; }
                    .profile-info-right { display: none; }
                }
                 @media (max-width: 768px) {
                     .stats-table th, .stats-table td { padding: 8px 4px; font-size: 0.9rem; }
                 }
            `}</style>
        </div>
    );
};

export default PlayerProfile;
