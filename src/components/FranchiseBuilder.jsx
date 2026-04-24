import React, { useState } from 'react';

const historicalPlayers = [
  { id: 1, name: 'Michael Jordan', pos: 'SG', salaries: { 1996: 30140000, 1998: 33140000 } },
  { id: 2, name: 'Shaquille O\'Neal', pos: 'C', salaries: { 1996: 10714000, 2003: 23571429, 2009: 20000000 } },
  { id: 3, name: 'Kobe Bryant', pos: 'SG', salaries: { 1996: 1023000, 2003: 13500000, 2009: 21262500 } },
  { id: 4, name: 'LeBron James', pos: 'SF', salaries: { 2003: 4018920, 2009: 15779912, 2012: 17545000 } },
  { id: 5, name: 'Tim Duncan', pos: 'PF', salaries: { 1998: 2797200, 2003: 12195122, 2009: 22183219 } },
  { id: 6, name: 'Hakeem Olajuwon', pos: 'C', salaries: { 1996: 9660000 } },
  { id: 7, name: 'Scottie Pippen', pos: 'SF', salaries: { 1996: 2250000, 1998: 11000000 } },
  { id: 8, name: 'Kevin Garnett', pos: 'PF', salaries: { 2003: 25200000, 2009: 16400000 } },
  { id: 9, name: 'Dwyane Wade', pos: 'SG', salaries: { 2003: 2636400, 2009: 15779912, 2012: 15691000 } },
  { id: 10, name: 'Dirk Nowitzki', pos: 'PF', salaries: { 2003: 12375000, 2009: 19795714 } },
  { id: 11, name: 'Allen Iverson', pos: 'SG', salaries: { 1996: 2267000, 2003: 13500000 } },
  { id: 12, name: 'Carmelo Anthony', pos: 'SF', salaries: { 2003: 3229200, 2009: 15779912 } },
];

const salaryCaps = { 1996: 24363000, 1998: 30000000, 2003: 43840000, 2009: 57700000, 2012: 58044000 };

const FranchiseBuilder = () => {
  const [selectedYear, setSelectedYear] = useState(2003);
  const [team, setTeam] = useState([]);
  const [playerPool, setPlayerPool] = useState(historicalPlayers);
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  const currentSalary = team.reduce((total, player) => total + (player.salaries[selectedYear] || 0), 0);
  const hardCap = salaryCaps[selectedYear];
  const capSpace = hardCap - currentSalary;

  const availablePlayers = playerPool.filter(p => p.salaries[selectedYear] !== undefined);

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setTeam([]);
    setPlayerPool(historicalPlayers);
  };

  const handleDragStart = (e, player) => { setDraggedPlayer(player); };
  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDropOnTeam = (e) => {
    e.preventDefault();
    if (!draggedPlayer) return;
    if (team.find(p => p.id === draggedPlayer.id) || team.length >= 5 || currentSalary + (draggedPlayer.salaries[selectedYear] || 0) > hardCap) {
      setDraggedPlayer(null); return;
    }
    setTeam([...team, draggedPlayer]);
    setPlayerPool(playerPool.filter(p => p.id !== draggedPlayer.id));
    setDraggedPlayer(null);
  };

  const handleDropOnPool = (e) => {
    e.preventDefault();
    if (!draggedPlayer || !team.find(p => p.id === draggedPlayer.id)) {
      setDraggedPlayer(null); return;
    }
    setTeam(team.filter(p => p.id !== draggedPlayer.id));
    setPlayerPool([...playerPool, draggedPlayer]);
    setDraggedPlayer(null);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="fade-in">
      <style>{`
        .franchise-builder-container { display: flex; justify-content: space-around; gap: 24px; flex-wrap: wrap; }
        .player-pool-container, .my-team-container { background-color: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--border-radius); padding: 16px; width: 45%; min-height: 400px; display: flex; flex-direction: column; }
        .player-pool-container h3, .my-team-container h3 { font-family: var(--font-label); text-align: center; margin-bottom: 16px; color: var(--color-accent-primary); font-size: 1.5rem; }
        .player-list, .team-list { display: flex; flex-direction: column; gap: 8px; flex-grow: 1; }
        .player-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; background-color: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; cursor: grab; transition: all 0.2s ease; }
        .player-card:hover { background-color: #2a2a3a; border-color: var(--color-accent-primary); }
        .player-card.team-member { background-color: rgba(79, 195, 247, 0.2); border-color: var(--color-accent-primary); }
        .player-name { font-weight: bold; } .player-pos { color: var(--color-text-secondary); font-size: 0.9em; } .player-salary { font-family: var(--font-label); font-weight: 600; }
        .team-slot-placeholder, .placeholder-text { display: flex; align-items: center; justify-content: center; height: 50px; border: 2px dashed var(--color-border); border-radius: 8px; color: var(--color-text-secondary); font-style: italic; flex-grow: 1; min-height: 50px; }
        .salary-cap-info { text-align: center; font-family: var(--font-label); }
        .salary-cap-info h3 { font-size: 1.2rem; } .salary-cap-info p { font-size: 1.1rem; font-weight: 600; }
        .in-green { color: #81c784; } .in-red { color: #e57373; }
        @media (max-width: 900px) { .player-pool-container, .my-team-container { width: 100%; } }
      `}</style>
      <h2 className="feature-title">Franchise Builder</h2>
      <p className="feature-description">Select a year to set the hard cap, then drag and drop players to build your dream starting five while staying under the salary cap.</p>
      
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="year-select">Select Season</label>
          <select id="year-select" className="styled-select" value={selectedYear} onChange={handleYearChange}>
            {Object.keys(salaryCaps).map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div className="salary-cap-info">
          <h3>{selectedYear} Hard Cap: {formatCurrency(hardCap)}</h3>
          <p className={capSpace >= 0 ? 'in-green' : 'in-red'}>Remaining Cap Space: {formatCurrency(capSpace)}</p>
        </div>
      </div>

      <div className="franchise-builder-container">
        <div className="player-pool-container" onDragOver={handleDragOver} onDrop={handleDropOnPool}>
          <h3>Available Players</h3>
          <div className="player-list">
            {availablePlayers.map(player => ( <div key={player.id} className="player-card" draggable onDragStart={(e) => handleDragStart(e, player)}> <span className="player-name">{player.name} <span className="player-pos">({player.pos})</span></span> <span className="player-salary">{formatCurrency(player.salaries[selectedYear])}</span> </div> ))}
            {availablePlayers.length === 0 && <p className="placeholder-text">All available players are on your team.</p>}
          </div>
        </div>

        <div className="my-team-container" onDragOver={handleDragOver} onDrop={handleDropOnTeam}>
          <h3>My Starting Five</h3>
          <div className="team-list">
             {team.map(player => ( <div key={player.id} className="player-card team-member" draggable onDragStart={(e) => handleDragStart(e, player)}> <span className="player-name">{player.name} <span className="player-pos">({player.pos})</span></span> <span className="player-salary">{formatCurrency(player.salaries[selectedYear])}</span> </div> ))}
             {team.length < 5 && Array.from({ length: 5 - team.length }).map((_, i) => ( <div key={i} className="team-slot-placeholder">Drop Player Here</div> ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchiseBuilder;