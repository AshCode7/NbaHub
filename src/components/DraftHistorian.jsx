import React, { useState } from 'react';

// Hardcoded draft data for specific, iconic years.
// Verdicts: Legend, Star, Solid, Bust. isSteal: true for late-round gems.
const draftData = {
  1984: [
    { pick: 1, player: 'Hakeem Olajuwon', team: 'HOU', pos: 'C', verdict: 'Legend' },
    { pick: 3, player: 'Michael Jordan', team: 'CHI', pos: 'SG', verdict: 'Legend' },
    { pick: 5, player: 'Charles Barkley', team: 'PHI', pos: 'PF', verdict: 'Legend' },
    { pick: 16, player: 'John Stockton', team: 'UTA', pos: 'PG', verdict: 'Legend', isSteal: true },
    { pick: 2, player: 'Sam Bowie', team: 'POR', pos: 'C', verdict: 'Bust' },
  ],
  1996: [
    { pick: 1, player: 'Allen Iverson', team: 'PHI', pos: 'PG', verdict: 'Legend' },
    { pick: 4, player: 'Stephon Marbury', team: 'MIL', pos: 'PG', verdict: 'Star' },
    { pick: 5, player: 'Ray Allen', team: 'MIN', pos: 'SG', verdict: 'Legend' },
    { pick: 13, player: 'Kobe Bryant', team: 'CHH', pos: 'SG', verdict: 'Legend', isSteal: true },
    { pick: 15, player: 'Steve Nash', team: 'PHX', pos: 'PG', verdict: 'Legend', isSteal: true },
    { pick: 20, player: 'Zydrunas Ilgauskas', team: 'CLE', pos: 'C', verdict: 'Solid' },
  ],
  2003: [
    { pick: 1, player: 'LeBron James', team: 'CLE', pos: 'SF', verdict: 'Legend' },
    { pick: 2, player: 'Darko Miličić', team: 'DET', pos: 'C', verdict: 'Bust' },
    { pick: 3, player: 'Carmelo Anthony', team: 'DEN', pos: 'SF', verdict: 'Star' },
    { pick: 4, player: 'Chris Bosh', team: 'TOR', pos: 'PF', verdict: 'Star' },
    { pick: 5, player: 'Dwyane Wade', team: 'MIA', pos: 'SG', verdict: 'Legend' },
    { pick: 18, player: 'David West', team: 'NOH', pos: 'PF', verdict: 'Solid', isSteal: true },
  ],
  2009: [
    { pick: 1, player: 'Blake Griffin', team: 'LAC', pos: 'PF', verdict: 'Star' },
    { pick: 3, player: 'James Harden', team: 'OKC', pos: 'SG', verdict: 'Legend' },
    { pick: 7, player: 'Stephen Curry', team: 'GSW', pos: 'PG', verdict: 'Legend', isSteal: true },
    { pick: 9, player: 'DeMar DeRozan', team: 'TOR', pos: 'SG', verdict: 'Star' },
    { pick: 2, player: 'Hasheem Thabeet', team: 'MEM', pos: 'C', verdict: 'Bust' },
  ],
  2012: [
    { pick: 1, player: 'Anthony Davis', team: 'NOH', pos: 'PF', verdict: 'Star' },
    { pick: 6, player: 'Damian Lillard', team: 'POR', pos: 'PG', verdict: 'Star' },
    { pick: 35, player: 'Draymond Green', team: 'GSW', pos: 'PF', verdict: 'Star', isSteal: true },
    { pick: 2, player: 'Michael Kidd-Gilchrist', team: 'CHA', pos: 'SF', verdict: 'Bust' },
    { pick: 10, player: 'Austin Rivers', team: 'NOH', pos: 'PG', verdict: 'Solid' },
  ],
};

const DraftHistorian = () => {
  const availableYears = Object.keys(draftData).map(Number);
  const [selectedYear, setSelectedYear] = useState(2003);

  const handleSliderChange = (e) => {
    // This logic snaps the slider to available years
    const value = parseInt(e.target.value);
    const closestYear = availableYears.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    setSelectedYear(closestYear);
  };
  
  const getVerdictClass = (verdict) => {
    switch (verdict) {
      case 'Legend': return 'tier-legend';
      case 'Star': return 'tier-star';
      case 'Solid': return 'tier-solid';
      case 'Bust': return 'tier-bust';
      default: return '';
    }
  };

  return (
    <div className="fade-in">
      <h2 className="feature-title">Draft Historian</h2>
      <p className="feature-description">Explore the landscape of iconic NBA drafts. Use the slider to select a year and see the top picks, their verdicts, and the biggest steals.</p>

      <div className="controls-container">
        <div className="slider-container">
          <label htmlFor="year-slider">Draft Year: {selectedYear}</label>
          <input
            type="range"
            id="year-slider"
            min="1984"
            max="2020"
            value={selectedYear}
            onChange={handleSliderChange}
            list="tickmarks"
          />
          <datalist id="tickmarks" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {availableYears.map(year => <option key={year} value={year} label={year.toString()}></option>)}
          </datalist>
        </div>
      </div>
      
      <div className="card-grid">
        {draftData[selectedYear]
          .sort((a, b) => a.pick - b.pick)
          .map((p, index) => (
            <div key={p.player} className={`card hover-lift draft-card ${getVerdictClass(p.verdict)} ${p.isSteal ? 'stolen-pick' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="draft-card-header">
                <span className="pick-number">#{p.pick}</span>
                <span className="drafting-team">{p.team}</span>
              </div>
              <div className="draft-card-body">
                <h3 className="player-name">{p.player}</h3>
                <p className="player-position">{p.pos}</p>
              </div>
              <div className="draft-card-footer">
                <span className={`verdict-badge verdict-${p.verdict.toLowerCase()}`}>{p.verdict}</span>
              </div>
              {p.isSteal && <div className="steal-banner">STEAL</div>}
            </div>
          ))
        }
      </div>

      <style>{`
        .slider-container { width: 100%; max-width: 600px; text-align: center; }
        .slider-container label { font-family: var(--font-heading); font-size: 2rem; color: var(--color-accent-orange); }
        .draft-card { position: relative; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
        .draft-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pick-number { font-family: var(--font-heading); font-size: 2rem; color: var(--color-accent-orange); }
        .drafting-team { font-family: var(--font-label); font-weight: 600; color: var(--color-text-secondary); }
        .player-name { font-size: 1.5rem; margin-bottom: 4px; }
        .player-position { color: var(--color-text-secondary); }
        .draft-card-footer { margin-top: 16px; }
        .verdict-badge { padding: 4px 12px; border-radius: 12px; font-weight: bold; font-family: var(--font-label); }
        .verdict-legend { background-color: var(--color-accent-gold); color: var(--color-background); }
        .verdict-star { background-color: var(--color-accent-silver); color: var(--color-background); }
        .verdict-solid { background-color: var(--color-accent-bronze); color: var(--color-background); }
        .verdict-bust { background-color: #444; color: var(--color-text-secondary); }
        .steal-banner {
          position: absolute;
          top: 10px; right: -15px;
          background-color: var(--color-accent-red);
          color: white;
          padding: 2px 10px;
          font-family: var(--font-heading);
          transform: rotate(20deg);
          font-size: 0.8rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default DraftHistorian;