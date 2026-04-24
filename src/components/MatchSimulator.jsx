import React, { useState } from 'react';

const historicalTeams = {
  '1996 Bulls': { name: '1995-96 Chicago Bulls', players: [ { name: 'Michael Jordan', rating: 99 }, { name: 'Scottie Pippen', rating: 92 }, { name: 'Dennis Rodman', rating: 88 }, { name: 'Toni Kukoč', rating: 85 }, { name: 'Ron Harper', rating: 84 }, ] },
  '2001 Lakers': { name: '2000-01 Los Angeles Lakers', players: [ { name: 'Shaquille O\'Neal', rating: 98 }, { name: 'Kobe Bryant', rating: 94 }, { name: 'Derek Fisher', rating: 83 }, { name: 'Horace Grant', rating: 82 }, { name: 'Rick Fox', rating: 81 }, ] },
  '2017 Warriors': { name: '2016-17 Golden State Warriors', players: [ { name: 'Kevin Durant', rating: 97 }, { name: 'Stephen Curry', rating: 96 }, { name: 'Klay Thompson', rating: 90 }, { name: 'Draymond Green', rating: 89 }, { name: 'Andre Iguodala', rating: 85 }, ] },
};

const userTeam = { name: 'My Custom Franchise', players: [ { name: 'LeBron James (2012)', rating: 98 }, { name: 'Dwyane Wade (2009)', rating: 95 }, { name: 'Tim Duncan (2003)', rating: 96 }, { name: 'Dirk Nowitzki (2009)', rating: 93 }, { name: 'Allen Iverson (2003)', rating: 91 }, ] };

const MatchSimulator = () => {
  const [selectedOpponent, setSelectedOpponent] = useState('1996 Bulls');
  const [simulationResult, setSimulationResult] = useState(null);

  const runSimulation = (teamA, teamB) => {
    const ratingA = teamA.players.reduce((sum, p) => sum + p.rating, 0);
    const ratingB = teamB.players.reduce((sum, p) => sum + p.rating, 0);
    const winProbabilityA = ratingA / (ratingA + ratingB);

    let winsA = 0, winsB = 0;
    const seriesResults = [];
    
    while (winsA < 4 && winsB < 4) {
      const scoreA = Math.round(90 + (ratingA / 20) + (Math.random() * 20 - 10));
      const scoreB = Math.round(90 + (ratingB / 20) + (Math.random() * 20 - 10));
      if (Math.random() < winProbabilityA) {
        winsA++; seriesResults.push({ winner: teamA.name, score: `${Math.max(scoreA, scoreB)}-${Math.min(scoreA, scoreB)}` });
      } else {
        winsB++; seriesResults.push({ winner: teamB.name, score: `${Math.max(scoreA, scoreB)}-${Math.min(scoreA, scoreB)}` });
      }
    }
    setSimulationResult({ winner: winsA > winsB ? teamA.name : teamB.name, seriesScore: `${winsA}-${winsB}`, games: seriesResults, teamA: teamA.name, teamB: teamB.name });
  };

  const handleSimulate = () => {
    setSimulationResult(null);
    setTimeout(() => runSimulation(userTeam, historicalTeams[selectedOpponent]), 500);
  };
  
  return (
    <div className="fade-in">
      <style>{`
        .simulation-arena { display: flex; justify-content: space-around; align-items: flex-start; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
        .team-display { background-color: var(--color-surface); padding: 16px; border-radius: var(--border-radius); border: 1px solid var(--color-border); width: 45%; }
        .team-display h3 { font-family: var(--font-label); color: var(--color-accent-primary); margin-bottom: 12px; }
        .team-display ul { list-style: none; } .team-display li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border); }
        .team-display li:last-child { border-bottom: none; } .rating { font-weight: bold; color: var(--color-highlight); }
        .vs-separator { font-family: var(--font-heading); font-size: 3rem; color: var(--color-accent-primary); align-self: center; }
        .result-container { margin-top: 32px; padding: 24px; background-color: var(--color-surface); border-radius: var(--border-radius); text-align: center; border: 1px solid var(--color-accent-primary); box-shadow: 0 0 20px rgba(79, 195, 247, 0.2); }
        .series-winner { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-accent-primary); margin-bottom: 8px; }
        .series-score { font-size: 2rem; font-family: var(--font-label); margin-bottom: 24px; }
        .game-log { display: flex; flex-direction: column; gap: 8px; align-items: center; }
        .game-result { padding: 8px 12px; border-radius: 6px; width: 80%; max-width: 400px; }
        .user-win { background-color: rgba(79, 195, 247, 0.2); border: 1px solid var(--color-accent-primary); }
        .opponent-win { background-color: rgba(224, 247, 250, 0.1); border: 1px solid var(--color-text-secondary); }
        @media (max-width: 768px) { .team-display { width: 100%; } }
      `}</style>
      <h2 className="feature-title">Match Simulator</h2>
      <p className="feature-description">Pit your custom franchise against legendary historical teams in a 7-game series simulation.</p>
      
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="opponent-select">Choose Opponent</label>
          <select id="opponent-select" className="styled-select" value={selectedOpponent} onChange={e => setSelectedOpponent(e.target.value)}>
            {Object.entries(historicalTeams).map(([key, team]) => ( <option key={key} value={key}>{team.name}</option> ))}
          </select>
        </div>
        <button className="styled-button" onClick={handleSimulate}>Simulate Series</button>
      </div>
      
      <div className="simulation-arena">
        <div className="team-display user-team"> <h3>{userTeam.name}</h3> <ul>{userTeam.players.map(p => <li key={p.name}>{p.name} <span className="rating">{p.rating}</span></li>)}</ul> </div>
        <div className="vs-separator">VS</div>
        <div className="team-display opponent-team"> <h3>{historicalTeams[selectedOpponent].name}</h3> <ul>{historicalTeams[selectedOpponent].players.map(p => <li key={p.name}>{p.name} <span className="rating">{p.rating}</span></li>)}</ul> </div>
      </div>
      
      {simulationResult && (
        <div className="result-container fade-in">
          <h3>Series Result</h3>
          <p className="series-winner">{simulationResult.winner} wins!</p>
          <p className="series-score">{simulationResult.seriesScore}</p>
          <div className="game-log">
            {simulationResult.games.map((game, index) => (
              <div key={index} className={`game-result ${game.winner === userTeam.name ? 'user-win' : 'opponent-win'}`}> Game {index + 1}: {game.winner} wins {game.score} </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchSimulator;