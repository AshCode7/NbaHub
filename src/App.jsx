import React, { useState } from 'react';
import './App.css';

import FranchiseBuilder     from './components/FranchiseBuilder';
import PrimePredictor        from './components/PrimePredictor';
import UnderratedAlgorithm   from './components/UnderratedAlgorithm';
import MatchSimulator        from './components/MatchSimulator';
import QuizShotClock         from './components/QuizShotClock';
import GoatMeter             from './components/GoatMeter';
import DraftHistorian        from './components/DraftHistorian';
import JerseyNumberHistory   from './components/JerseyNumberHistory';
import PlayerProfile         from './components/PlayerProfile';

const BALLDONTLIE_API_KEY = "ddd08d8f-e111-40a7-a5c1-78970f26148c";

const FEATURES = [
  { id: 'PlayerProfile',        name: 'Player Profile',        icon: '👤' },
  { id: 'PrimePredictor',       name: 'Prime Predictor',       icon: '📊' },
  { id: 'DraftHistorian',       name: 'Draft Historian',       icon: '📜' },
  { id: 'GoatMeter',            name: 'GOAT Meter',            icon: '🐐' },
  { id: 'FranchiseBuilder',     name: 'Franchise Builder',     icon: '🏗️' },
  { id: 'UnderratedAlgorithm',  name: 'Underrated Algorithm',  icon: '💎' },
  { id: 'JerseyNumberHistory',  name: 'Jersey Number History', icon: '#️⃣' },
  { id: 'MatchSimulator',       name: 'Match Simulator',       icon: '🏀' },
  { id: 'QuizShotClock',        name: 'Quiz Shot-Clock',       icon: '⏱️' },
];

function App() {
  const [activeFeature, setActiveFeature] = useState('PlayerProfile');
  const [menuOpen, setMenuOpen]           = useState(false);

  const navigate = (id) => { setActiveFeature(id); setMenuOpen(false); };

  const renderFeature = () => {
    switch (activeFeature) {
      case 'PlayerProfile':        return <PlayerProfile        apiKey={BALLDONTLIE_API_KEY} />;
      case 'PrimePredictor':       return <PrimePredictor       apiKey={BALLDONTLIE_API_KEY} />;
      case 'DraftHistorian':       return <DraftHistorian       apiKey={BALLDONTLIE_API_KEY} />;
      case 'GoatMeter':            return <GoatMeter />;
      case 'FranchiseBuilder':     return <FranchiseBuilder />;
      case 'UnderratedAlgorithm':  return <UnderratedAlgorithm />;
      case 'JerseyNumberHistory':  return <JerseyNumberHistory />;
      case 'MatchSimulator':       return <MatchSimulator />;
      case 'QuizShotClock':        return <QuizShotClock />;
      default:                     return <PlayerProfile        apiKey={BALLDONTLIE_API_KEY} />;
    }
  };

  const active = FEATURES.find(f => f.id === activeFeature);

  return (
    <div className={`App`}>

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-top-row">

          <div className="header-left">
            <button
              className="hamburger-menu"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? '✕' : '☰'}
            </button>

            <img
              src="https://i.ibb.co/6gZSkGr/nba-logo-transparent.png"
              alt="NBA Hub"
              className="nba-logo"
            />

            <span className="header-feature-label">
              {active?.icon}&nbsp;{active?.name}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="secondary-nav desktop-only">
            {FEATURES.map(f => (
              <button
                key={f.id}
                className={`nav-button-secondary ${activeFeature === f.id ? 'active' : ''}`}
                onClick={() => navigate(f.id)}
              >
                {f.name}
              </button>
            ))}
          </nav>

          <div className="search-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

        </div>
      </header>

      {/* ── MOBILE SIDEBAR ── */}
      {menuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-sidebar" onClick={e => e.stopPropagation()}>
            <p className="sidebar-heading">Navigate</p>
            {FEATURES.map(f => (
              <button
                key={f.id}
                className={`sidebar-item ${activeFeature === f.id ? 'active' : ''}`}
                onClick={() => navigate(f.id)}
              >
                <span className="sidebar-icon">{f.icon}</span>
                {f.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main className="feature-container">
        {renderFeature()}
      </main>

    </div>
  );
}

export default App;
