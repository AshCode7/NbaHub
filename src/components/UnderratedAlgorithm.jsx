import React, { useState, useMemo } from 'react';

const underratedData = [
  { id: 1, name: 'Nikola Jokic', season: 2021, per: 31.3, ws: 15.6, vorp: 9.6, salary: 29542010 },
  { id: 2, name: 'Michael Jordan', season: 1988, per: 31.7, ws: 21.2, vorp: 12.5, salary: 845000 },
  { id: 3, name: 'Larry Bird', season: 1985, per: 26.5, ws: 15.7, vorp: 8.8, salary: 1800000 },
  { id: 4, name: 'Stephen Curry', season: 2016, per: 31.5, ws: 17.9, vorp: 9.8, salary: 11370786 },
  { id: 5, name: 'Dirk Nowitzki', season: 2006, per: 28.1, ws: 17.7, vorp: 8.7, salary: 16400000 },
  { id: 6, name: 'Hakeem Olajuwon', season: 1994, per: 25.3, ws: 14.3, vorp: 7.8, salary: 3170000 },
  { id: 7, name: 'Scottie Pippen', season: 1996, per: 20.4, ws: 12.3, vorp: 6.7, salary: 2250000 },
  { id: 8, name: 'LeBron James', season: 2009, per: 31.7, ws: 20.3, vorp: 11.6, salary: 15779912 },
  { id: 9, name: 'Kawhi Leonard', season: 2017, per: 27.6, ws: 13.6, vorp: 7.3, salary: 17638063 },
  { id: 10, name: 'James Harden', season: 2018, per: 29.8, ws: 15.4, vorp: 9.1, salary: 28299399 },
];

const UnderratedAlgorithm = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'descending' });

  const rankedPlayers = useMemo(() => {
    const playersWithScores = underratedData.map(player => {
      const advancedStatTotal = (player.per * 1) + (player.ws * 2) + (player.vorp * 4);
      const score = advancedStatTotal / (player.salary / 1000000);
      return { ...player, score: parseFloat(score.toFixed(2)) };
    });

    return playersWithScores.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [sortConfig]);

  const handleSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') direction = 'ascending';
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'descending' ? '🔽' : '🔼';
  };

  return (
    <div className="fade-in">
      <style>{`
        .styled-table { width: 100%; border-collapse: collapse; background-color: var(--color-surface); border-radius: var(--border-radius); overflow: hidden; font-family: var(--font-label); border: 1px solid var(--color-border); }
        .styled-table thead tr { background-color: var(--color-surface-solid); color: var(--color-accent-primary); text-align: left; }
        .styled-table th { padding: 16px; cursor: pointer; user-select: none; text-transform: uppercase; font-weight: 700; }
        .styled-table td { padding: 16px; border-bottom: 1px solid var(--color-border); }
        .styled-table tbody tr { color: var(--color-text-primary); transition: background-color 0.2s; }
        .styled-table tbody tr:last-child td { border-bottom: none; }
        .styled-table tbody tr:hover { background-color: rgba(79, 195, 247, 0.1); }
        .score-cell { font-weight: 700; font-size: 1.2rem; color: var(--color-accent-primary); text-shadow: 0 0 5px var(--color-accent-primary); }
      `}</style>
      <h2 className="feature-title">The Underrated Algorithm</h2>
      <p className="feature-description">This tool calculates a "Value Score" by comparing a player's peak advanced stats to their salary. A higher score indicates a more cost-efficient or "underrated" season.</p>

      <div style={{ overflowX: 'auto' }}>
        <table className="styled-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Player {getSortIndicator('name')}</th>
              <th onClick={() => handleSort('season')}>Season {getSortIndicator('season')}</th>
              <th onClick={() => handleSort('score')}>Value Score {getSortIndicator('score')}</th>
              <th onClick={() => handleSort('salary')}>Salary {getSortIndicator('salary')}</th>
              <th onClick={() => handleSort('per')}>PER {getSortIndicator('per')}</th>
              <th onClick={() => handleSort('ws')}>Win Shares {getSortIndicator('ws')}</th>
              <th onClick={() => handleSort('vorp')}>VORP {getSortIndicator('vorp')}</th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.map(player => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.season}-{player.season.toString().slice(-2)*1 + 1}</td>
                <td className="score-cell">{player.score}</td>
                <td>${player.salary.toLocaleString()}</td>
                <td>{player.per}</td>
                <td>{player.ws}</td>
                <td>{player.vorp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnderratedAlgorithm;