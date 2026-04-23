import React, { useState, useMemo } from 'react';

// Hardcoded player data with base scores for each category (scaled 1-100)
const goatCandidates = [
  { id: 1, name: 'Michael Jordan', titles: 100, stats: 98, impact: 100, longevity: 85, finalScore: 0 },
  { id: 2, name: 'LeBron James', titles: 67, stats: 100, impact: 97, longevity: 100, finalScore: 0 },
  { id: 3, name: 'Kareem Abdul-Jabbar', titles: 100, stats: 95, impact: 90, longevity: 98, finalScore: 0 },
  { id: 4, name: 'Bill Russell', titles: 100, stats: 60, impact: 95, longevity: 75, finalScore: 0 },
  { id: 5, name: 'Magic Johnson', titles: 83, stats: 88, impact: 96, longevity: 70, finalScore: 0 },
  { id: 6, name: 'Wilt Chamberlain', titles: 33, stats: 100, impact: 88, longevity: 80, finalScore: 0 },
  { id: 7, name: 'Larry Bird', titles: 50, stats: 87, impact: 94, longevity: 72, finalScore: 0 },
  { id: 8, name: 'Shaquille O\'Neal', titles: 67, stats: 92, impact: 98, longevity: 90, finalScore: 0 },
  { id: 9, name: 'Kobe Bryant', titles: 83, stats: 90, impact: 92, longevity: 95, finalScore: 0 },
  { id: 10, name: 'Tim Duncan', titles: 83, stats: 89, impact: 93, longevity: 96, finalScore: 0 },
];

const GoatMeter = () => {
  const [weights, setWeights] = useState({
    titles: 25,
    stats: 25,
    impact: 25,
    longevity: 25,
  });

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setWeights(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  // useMemo to recalculate rankings only when weights change
  const rankedPlayers = useMemo(() => {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) return goatCandidates.map(p => ({ ...p, finalScore: 0 }));

    const scoredPlayers = goatCandidates.map(player => {
      const score = 
        (player.titles * weights.titles +
         player.stats * weights.stats +
         player.impact * weights.impact +
         player.longevity * weights.longevity) / totalWeight;
      return { ...player, finalScore: score.toFixed(2) };
    });

    return scoredPlayers.sort((a, b) => b.finalScore - a.finalScore);
  }, [weights]);
  
  return (
    <div className="fade-in">
      <h2 className="feature-title">The G.O.A.T. Meter</h2>
      <p className="feature-description">The "Greatest of All Time" debate is subjective. Use the sliders below to weigh different criteria and see how the all-time ranking changes in real time based on your priorities.</p>

      <div className="goat-controls controls-container">
        {Object.keys(weights).map(key => (
          <div key={key} className="slider-group">
            <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)} ({weights[key]}%)</label>
            <input
              type="range"
              id={key}
              name={key}
              min="0"
              max="100"
              value={weights[key]}
              onChange={handleSliderChange}
            />
          </div>
        ))}
      </div>

      <div className="goat-rankings">
        {rankedPlayers.map((player, index) => (
          <div key={player.id} className="player-rank-card fade-in" style={{ animationDelay: `${index * 0.05}s`}}>
            <span className={`rank ${index < 3 ? 'rank-top' : ''}`}>{index + 1}</span>
            <span className="player-name">{player.name}</span>
            <div className="score-bar-container">
                <div className="score-bar" style={{ width: `${player.finalScore}%` }}></div>
            </div>
            <span className="final-score">{player.finalScore}</span>
          </div>
        ))}
      </div>

      <style>{`
        .goat-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .slider-group {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .slider-group label {
          font-family: var(--font-label);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .goat-rankings {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .player-rank-card {
          display: flex;
          align-items: center;
          background-color: var(--color-surface);
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }
        .rank {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          width: 50px;
          color: var(--color-text-secondary);
        }
        .rank.rank-top { color: var(--color-accent-gold); }
        .player-name {
          width: 200px;
          font-size: 1.2rem;
          font-weight: bold;
        }
        .score-bar-container {
            flex-grow: 1;
            height: 20px;
            background-color: var(--color-background);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid var(--color-border);
        }
        .score-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--color-accent-red) 0%, var(--color-accent-orange) 100%);
            border-radius: 10px;
            transition: width 0.3s ease-out;
        }
        .final-score {
          font-family: var(--font-label);
          font-weight: 700;
          font-size: 1.5rem;
          width: 80px;
          text-align: right;
          color: var(--color-accent-orange);
        }
        @media (max-width: 768px) {
          .goat-controls { grid-template-columns: 1fr; }
          .player-name { width: 120px; font-size: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default GoatMeter;