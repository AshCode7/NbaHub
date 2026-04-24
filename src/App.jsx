import React, { useState } from 'react';
import './App.css';

// Import all feature components - Ensure these are correct paths
import FranchiseBuilder from './components/FranchiseBuilder';
import PrimePredictor from './components/PrimePredictor'; // Correct, single import
import UnderratedAlgorithm from './components/UnderratedAlgorithm';
import MatchSimulator from './components/MatchSimulator';
import QuizShotClock from './components/QuizShotClock';
import GoatMeter from './components/GoatMeter';
import DraftHistorian from './components/DraftHistorian';
import JerseyNumberHistory from './components/JerseyNumberHistory';
import PlayerProfile from './components/PlayerProfile'; // New feature

// --- IMPORTANT ---
// This is your API key for balldontlie.io.
const BALLDONTLIE_API_KEY = "ddd08d8f-e111-40a7-a5c1-78970f26148c"; 

function App() {
  const [activeFeature, setActiveFeature] = useState('PlayerProfile'); // Set PlayerProfile as default

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'PlayerProfile':
        return <PlayerProfile apiKey={BALLDONTLIE_API_KEY} />;
      case 'PrimePredictor':
        return <PrimePredictor apiKey={BALLDONTLIE_API_KEY} />;
      case 'DraftHistorian':
        return <DraftHistorian apiKey={BALLDONTLIE_API_KEY} />;
      case 'GoatMeter':
        return <GoatMeter />;
      case 'FranchiseBuilder':
        return <FranchiseBuilder />;
      case 'UnderratedAlgorithm':
        return <UnderratedAlgorithm />;
      case 'JerseyNumberHistory':
        return <JerseyNumberHistory />;
      case 'MatchSimulator':
        return <MatchSimulator />;
      case 'QuizShotClock':
        return <QuizShotClock />;
      default:
        return <PlayerProfile apiKey={BALLDONTLIE_API_KEY} />;
    }
  };

  // The main navigation items are not currently visible in the UI based on your reference image,
  // but they are kept here for logical consistency if you ever re-introduce a main nav.
  const features = [
    { id: 'PlayerProfile', name: 'Player Profile' },
    { id: 'PrimePredictor', name: 'Prime Predictor' },
    { id: 'DraftHistorian', name: 'Draft Historian' },
    { id: 'GoatMeter', name: 'GOAT Meter' },
    { id: 'FranchiseBuilder', name: 'Franchise Builder' },
    { id: 'UnderratedAlgorithm', name: 'Underrated Algorithm' },
    { id: 'JerseyNumberHistory', name: 'Jersey Number History' },
    { id: 'MatchSimulator', name: 'Match Simulator' },
    { id: 'QuizShotClock', name: 'Quiz Shot-Clock' },
  ];
  
  // This secondary navigation is rendered in the header to match the reference image.
  const secondaryNav = ['Scores', 'News', 'Video', 'Players', 'Teams', 'Playoffs', 'Draft'];


  return (
    <div className={`App feature-bg-${activeFeature.toLowerCase()}`}>
      <header className="app-header">
        <div className="header-top-row">
            <div className='header-left'>
                <div className="hamburger-menu">☰</div>
                <img src="https://i.ibb.co/6gZSkGr/nba-logo-transparent.png" alt="NBA Logo" className="nba-logo" />
            </div>
            <nav className="secondary-nav">
                {secondaryNav.map(item => (
                    // This 'Players' active state is fixed for the visual reference.
                    // If you add a feature nav, you'd make this dynamic with activeFeature state.
                    <button key={item} className={`nav-button-secondary ${item === 'Players' ? 'active' : ''}`}>{item}</button>
                ))}
            </nav>
            <div className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
        </div>
      </header>
       {/* Main content area where features are rendered */}
      <main className="feature-container">
        {renderActiveFeature()}
      </main>
      {/* The footer is removed to achieve the full-screen app feel based on reference image */}
    </div>
  );
}

export default App;