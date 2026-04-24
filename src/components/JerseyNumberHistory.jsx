import React, { useState } from 'react';

// NOTE: The balldontlie API does not support fetching players by jersey number.
// Therefore, we will keep this hardcoded data as a showcase for iconic numbers, per the prompt's fallback instructions.
const jerseyData = {
  0: [{ name: 'Gilbert Arenas', teams: 'Wizards', isGoat: false }, { name: 'Russell Westbrook', teams: 'Thunder, Lakers', isGoat: true }, { name: 'Jayson Tatum', teams: 'Celtics', isGoat: false }],
  1: [{ name: 'Derrick Rose', teams: 'Bulls', isGoat: false }, { name: 'Tracy McGrady', teams: 'Magic, Rockets', isGoat: false }, { name: 'Oscar Robertson', teams: 'Royals, Bucks', isGoat: true }],
  3: [{ name: 'Allen Iverson', teams: '76ers', isGoat: false }, { name: 'Dwyane Wade', teams: 'Heat', isGoat: true }, { name: 'Chris Paul', teams: 'Hornets, Suns', isGoat: false }],
  6: [{ name: 'Bill Russell', teams: 'Celtics', isGoat: true }, { name: 'LeBron James', teams: 'Heat, Lakers', isGoat: false }, { name: 'Julius Erving', teams: '76ers', isGoat: false }],
  23: [{ name: 'Michael Jordan', teams: 'Bulls', isGoat: true }, { name: 'LeBron James', teams: 'Cavaliers, Lakers', isGoat: false }, { name: 'Anthony Davis', teams: 'Lakers', isGoat: false }],
  24: [{ name: 'Kobe Bryant', teams: 'Lakers', isGoat: true }, { name: 'Moses Malone', teams: 'Rockets', isGoat: false }, { name: 'Rick Barry', teams: 'Warriors', isGoat: false }],
  30: [{ name: 'Stephen Curry', teams: 'Warriors', isGoat: true }, { name: 'Bernard King', teams: 'Knicks', isGoat: false }, { name: 'Terry Porter', teams: 'Blazers', isGoat: false }],
  32: [{ name: 'Magic Johnson', teams: 'Lakers', isGoat: true }, { name: 'Karl Malone', teams: 'Jazz', isGoat: false }, { name: 'Kevin McHale', teams: 'Celtics', isGoat: false }],
  33: [{ name: 'Kareem Abdul-Jabbar', teams: 'Bucks, Lakers', isGoat: true }, { name: 'Larry Bird', teams: 'Celtics', isGoat: false }, { name: 'Patrick Ewing', teams: 'Knicks', isGoat: false }],
  34: [{ name: 'Hakeem Olajuwon', teams: 'Rockets', isGoat: false }, { name: 'Shaquille O\'Neal', teams: 'Lakers', isGoat: false }, { name: 'Giannis Antetokounmpo', teams: 'Bucks', isGoat: true }],
  35: [{ name: 'Kevin Durant', teams: 'Thunder, Warriors, Nets', isGoat: true }],
  21: [{ name: 'Tim Duncan', teams: 'Spurs', isGoat: true }, { name: 'Kevin Garnett', teams: 'Timberwolves', isGoat: false }, { name: 'Joel Embiid', teams: '76ers', isGoat: false }],
};

const JerseyNumberHistory = () => {
  const [number, setNumber] = useState('23');

  const players = jerseyData[number];
  const goatOfNumber = players?.find(p => p.isGoat);
  const otherPlayers = players?.filter(p => !p.isGoat);

  return (
    <div className="fade-in">
      <style>{`
        .jersey-gallery { max-width: 900px; margin: 32px auto; }
        .goat-card-container { text-align: center; margin-bottom: 32px; }
        .goat-title { font-family: var(--font-label); text-transform: uppercase; color: var(--color-text-secondary); margin-bottom: 16px; }
        .jersey-card { display: flex; align-items: center; padding: 24px; box-shadow: 0 0 20px rgba(79, 195, 247, 0.2); }
        .jersey-card.small { padding: 16px; box-shadow: none; }
        .jersey-number-display { font-family: var(--font-heading); font-size: 5rem; color: var(--color-accent-primary); opacity: 0.8; margin-right: 24px; line-height: 1; text-shadow: 0 0 10px var(--color-accent-primary); }
        .jersey-number-display.small { font-size: 3rem; margin-right: 16px; }
        .jersey-player-info h4 { font-size: 1.8rem; margin-bottom: 4px; }
        .jersey-player-info p { color: var(--color-text-secondary); font-size: 0.9rem; }
        .other-players-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px; }
        .rare-number-message { text-align: center; padding: 40px; background-color: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--border-radius); }
        .rare-number-message h2 { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-accent-primary); }
      `}</style>
      <h2 className="feature-title">Jersey Number History</h2>
      <p className="feature-description">Enter an iconic jersey number to see a gallery of famous players who wore it. The greatest player to ever wear the number is highlighted.</p>

      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="jersey-input">Enter Jersey Number</label>
          <input id="jersey-input" type="number" min="0" max="99" className="styled-input" value={number} onChange={e => setNumber(e.target.value)} style={{ textAlign: 'center', fontSize: '2rem', width: '150px' }} />
        </div>
      </div>

      <div className="jersey-gallery">
        {players ? (
          <>
            {goatOfNumber && (
              <div className="goat-card-container fade-in">
                <h3 className="goat-title">The G.O.A.T. of #{number}</h3>
                <div className="card jersey-card">
                  <div className="jersey-number-display">{number}</div>
                  <div className="jersey-player-info"> <h4>{goatOfNumber.name}</h4> <p>{goatOfNumber.teams}</p> </div>
                </div>
              </div>
            )}
            {otherPlayers && otherPlayers.length > 0 && (
                <div className="other-players-grid">
                    {otherPlayers.map((player, index) => (
                        <div key={player.name} className="card jersey-card small fade-in" style={{animationDelay: `${0.2 + index * 0.1}s`}}>
                             <div className="jersey-number-display small">{number}</div>
                             <div className="jersey-player-info"> <h4>{player.name}</h4> <p>{player.teams}</p> </div>
                        </div>
                    ))}
                </div>
            )}
          </>
        ) : (
          <div className="rare-number-message fade-in">
            <h2>Rare Number!</h2>
            <p>While some players may have worn #{number}, it's not associated with any all-time greats in our database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JerseyNumberHistory;