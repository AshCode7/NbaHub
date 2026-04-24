import React, { useState } from 'react';
import './App.css';

// Import all feature components
import FranchiseBuilder from './components/FranchiseBuilder';
import PrimePredictor from './components/PrimePredictor';
import UnderratedAlgorithm from './components/UnderratedAlgorithm';
import MatchSimulator from './components/MatchSimulator';
import QuizShotClock from './components/QuizShotClock';
import GoatMeter from './components/GoatMeter';
import DraftHistorian from './components/DraftHistorian';
import JerseyNumberHistory from './components/JerseyNumberHistory';
import PlayerProfile from './components/PlayerProfile'; // New feature

// --- IMPORTANT ---
// This is your API key for balldontlie.io.
// In a real-world application, this should be stored securely in environment variables.
const BALLDONTLIE_API_KEY = "ddd08d8f-e111-40a7-a5c1-78970f26148c"; 

function App() {
  // State to manage which feature is currently displayed
  const [activeFeature, setActiveFeature] = useState('PlayerProfile');

  // Helper function to render the currently selected feature component
  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'PlayerProfile':
        return <PlayerProfile apiKey={BALLDONTLIE_API_KEY} />;
      case 'GoatMeter':
        return <GoatMeter />;
      case 'PrimePredictor':
        return <PrimePredictor apiKey={BALLDONTLIE_API_KEY} />;
      case 'DraftHistorian':
        return <DraftHistorian apiKey={BALLDONTLIE_API_KEY} />;
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

  return (
    <div className={`App feature-bg-${activeFeature.toLowerCase()}`}>
      <header className="app-header">
        <h1 className="logo">NBA Hub</h1>
        <nav className="main-nav">
          {features.map(feature => (
            <button
              key={feature.id}
              className={`nav-button ${activeFeature === feature.id ? 'active' : ''}`}
              onClick={() => setActiveFeature(feature.id)}
            >
              {feature.name}
            </button>
          ))}
        </nav>
      </header>
      <main className="feature-container">
        {renderActiveFeature()}
      </main>
      <footer className="app-footer">
        <p>NBA Hub &copy; {new Date().getFullYear()}. Data powered by balldontlie.io.</p>
      </footer>
    </div>
  );
}

export default App;
