import React, { useState, useMemo } from 'react';

// Hardcoded data: Player, Peak Season, Key Advanced Stats, and Salary for that season
// VORP = Value Over Replacement Player, WS = Win Shares, PER = Player Efficiency Rating
const underratedData = [
  { id: 1, name: 'Nikola Jokic', season: 2021, per: 31.3, ws: 15.6, vorp: 9.6, salary: 29542010, score: 0 },
  { id: 2, name: 'Michael Jordan', season: 1988, per: 31.7, ws: 21.2, vorp: 12.5, salary: 845000, score: 0 },
  { id: 3, name: 'Larry Bird', season: 1985, per: 26.5, ws: 15.7, vorp: 8.8, salary: 1800000, score: 0 },
  { id: 4, name: 'Stephen Curry', season: 2016, per: 31.5, ws: 17.9, vorp: 9.8, salary: 11370786, score: 0 },
  { id: 5, name: 'Dirk Nowitzki', season: 2006, per: 28.1, ws: 17.7, vorp: 8.7, salary: 16400000, score: 0 },
  { id: 6, name: 'Hakeem Olajuwon', season: 1994, per: 25.3, ws: 14.3, vorp: 7.8, salary: 3170000, score: 0 },
  { id: 7, name: 'Scottie Pippen', season: 1996, per: 20.4, ws: 12.3, vorp: 6.7, salary: 2250000, score: 0 },
  { id: 8, name: 'LeBron James', season: 2009, per: 31.7, ws: 20.3, vorp: 11.6, salary: 15779912, score: 0 },
  { id: 9, name: 'Kawhi Leonard', season: 2017, per: 27.6, ws: 13.6, vorp: 7.3, salary: 17638063, score: 0 },
  { id: 10, name: 'James Harden', season: 2018, per: 29.8, ws: 15.4, vorp: 9.1, salary: 28299399, score: 0 },
];

const UnderratedAlgorithm = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'descending' });

  // Memoized calculation of player scores and sorting
  const rankedPlayers = useMemo(() => {
    // 1. Calculate the 'Underrated Score' for each player
    const playersWithScores = underratedData.map(player => {
      const salaryInMillions = player.salary / 1000000;
      // Formula: (PER * weight) + (WS * weight) + (VORP * weight) / salary
      const advancedStatTotal = (player.per * 1) + (player.ws * 2) + (player.vorp * 4);
      const score = advancedStatTotal / salaryInMillions;
      return { ...player, score: parseFloat(score.toFixed(2)) };
    });

    // 2. Sort the players based on the current sort configuration
    playersWithScores.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return playersWithScores;
  }, [sortConfig]); // Recalculate only when sortConfig changes

  const handleSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕️';
    if (sortConfig.direction === 'descending') return '🔽';
    return '🔼';
  };

  return (
    <div className="fade-in">
      <h2 className="feature-title">The Underrated Algorithm</h2>
      <p className="feature-description">
        This tool calculates a "Value Score" by comparing a player's peak advanced stats (PER, Win Shares, VORP) to their salary in that year. A higher score indicates a more cost-efficient or "underrated" season.
      </p>

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
            {rankedPlayers.map((player, index) => (
              <tr key={player.id} style={{ animationDelay: `${index * 0.05}s` }}>
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

      {/* Injecting CSS for this component */}
      <style>{`
        .styled-table {
          width: 100%;
          border-collapse: collapse;
          background-color: var(--color-surface);
          border-radius: var(--border-radius);
          overflow: hidden;
          font-family: var(--font-label);
        }
        .styled-table thead tr {
          background-color: var(--color-background);
          color: var(--color-accent-orange);
          text-align: left;
        }
        .styled-table th {
          padding: 16px;
          cursor: pointer;
          user-select: none;
          text-transform: uppercase;
          font-weight: 700;
        }
        .styled-table td {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .styled-table tbody tr {
          color: var(--color-text-primary);
          opacity: 0;
          transform: translateY(10px);
          animation: fadeIn 0.5s ease forwards;
        }
        .styled-table tbody tr:last-child td {
          border-bottom: none;
        }
        .styled-table tbody tr:hover {
          background-color: rgba(247, 160, 0, 0.1);
        }
        .score-cell {
          font-weight: 700;
          font-size: 1.2rem;
          color: var(--color-accent-gold);
        }
      `}</style>
    </div>
  );
};

export default UnderratedAlgorithm;