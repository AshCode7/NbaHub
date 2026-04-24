import React, { useState } from 'react';
import './App.css';

import FranchiseBuilder from './components/FranchiseBuilder';
import PrimePredictor from './components/PrimePredictor';
import UnderratedAlgorithm from './components/UnderratedAlgorithm';
import MatchSimulator from './components/MatchSimulator';
import QuizShotClock from './components/QuizShotClock';
import GoatMeter from './components/GoatMeter';
import DraftHistorian from './components/DraftHistorian';
import JerseyNumberHistory from './components/JerseyNumberHistory';
import PlayerProfile from './components/PlayerProfile';

const BALLDONTLIE_API_KEY = "ddd08d8f-e111-40a7-a5c1-78970f26148c";

function App() {
  const [activeFeature, setActiveFeature] = useState('PlayerProfile');
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { id: 'PlayerProfile',       name: 'Player Profile',       icon: '👤' },
    { id: 'PrimePredictor',      name: 'Prime Predictor',      icon: '📊' },
    { id: 'DraftHistorian',      name: 'Draft Historian',      icon: '📜' },
    { id: 'GoatMeter',           name: 'GOAT Meter',           icon: '🐐' },
    { id: 'FranchiseBuilder',    name: 'Franchise Builder',    icon: '🏗️' },
    { id: 'UnderratedAlgorithm', name: 'Underrated Algorithm', icon: '💎' },
    { id: 'JerseyNumberHistory', name: 'Jersey Number History',icon: '#️⃣' },
    { id: 'MatchSimulator',      name: 'Match Simulator',      icon: '🏀' },
    { id: 'QuizShotClock',       name: 'Quiz Shot-Clock',      icon: '⏱️' },
  ];

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'PlayerProfile':       return <PlayerProfile apiKey={BALLDONTLIE_API_KEY} />;
      case 'PrimePredictor':      return <PrimePredictor apiKey={BALLDONTLIE_API_KEY} />;
      case 'DraftHistorian':      return <DraftHistorian apiKey={BALLDONTLIE_API_KEY} />;
      case 'GoatMeter':           return <GoatMeter />;
      case 'FranchiseBuilder':    return <FranchiseBuilder />;
      case 'UnderratedAlgorithm': return <UnderratedAlgorithm />;
      case 'JerseyNumberHistory': return <JerseyNumberHistory />;
      case 'MatchSimulator':      return <MatchSimulator />;
      case 'QuizShotClock':       return <QuizShotClock />;
      default:                    return <PlayerProfile apiKey={BALLDONTLIE_API_KEY} />;
    }
  };

  const activeFeatureObj = features.find(f => f.id === activeFeature);

  return (
    <div className={`App feature-bg-${activeFeature.toLowerCase()}`}>
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-top-row">
          <div className="header-left">
            {/* Hamburger toggles the sidebar on mobile */}
            <button
              className="hamburger-menu"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            <img
              src="https://i.ibb.co/6gZSkGr/nba-logo-transparent.png"
              alt="NBA Logo"
              className="nba-logo"
            />
            <span className="header-feature-label">
              {activeFeatureObj?.icon} {activeFeatureObj?.name}
            </span>
          </div>

          {/* ── Desktop horizontal feature nav (hidden on mobile) ── */}
          <nav className="secondary-nav desktop-only">
            {features.map(feature => (
              <button
                key={feature.id}
                className={`nav-button-secondary ${activeFeature === feature.id ? 'active' : ''}`}
                onClick={() => setActiveFeature(feature.id)}
              >
                {feature.name}
              </button>
            ))}
          </nav>

          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR ── */}
      {menuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="mobile-sidebar" onClick={e => e.stopPropagation()}>
            <p className="sidebar-heading">Features</p>
            {features.map(feature => (
              <button
                key={feature.id}
                className={`sidebar-item ${activeFeature === feature.id ? 'active' : ''}`}
                onClick={() => { setActiveFeature(feature.id); setMenuOpen(false); }}
              >
                <span className="sidebar-icon">{feature.icon}</span>
                {feature.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="feature-container">
        {renderActiveFeature()}
      </main>
    </div>
  );
}

export default App;
