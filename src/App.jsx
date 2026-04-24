import React, { useState } from 'react';
import './App.css';

// Import all feature components
import FranchiseBuilder from './components/FranchiseBuilder';
// import PrimePredictor from './components/PrimePredictor';
import UnderratedAlgorithm from './components/UnderratedAlgorithm';
import MatchSimulator from './components/MatchSimulator';
import QuizShotClock from './components/QuizShotClock';
import GoatMeter from './components/GoatMeter';
import DraftHistorian from './components/DraftHistorian';
import JerseyNumberHistory from './components/JerseyNumberHistory';

// --- IMPORTANT ---
// This is your API key for balldontlie.io.
// In a real-world application, this should be stored securely in environment variables,
// not hardcoded directly in the source code.
const BALLDONTLIE_API_KEY = "ddd08d8f-e111-40a7-a5c1-78970f26148c"; // Replace with your actual key if you have one. The public API works without one for many endpoints.

function App() {
  // State to manage which feature is currently displayed
  const [activeFeature, setActiveFeature] = useState('GoatMeter');

  // Helper function to render the currently selected feature component
  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'FranchiseBuilder':
        return <FranchiseBuilder />;
      case 'PrimePredictor':
        return <PrimePredictor apiKey={BALLDONTLIE_API_KEY} />;
      case 'UnderratedAlgorithm':
        return <UnderratedAlgorithm />;
      case 'MatchSimulator':
        return <MatchSimulator />;
      case 'QuizShotClock':
        return <QuizShotClock />;
      case 'GoatMeter':
        return <GoatMeter />;
      case 'DraftHistorian':
        return <DraftHistorian />;
      case 'JerseyNumberHistory':
        return <JerseyNumberHistory />;
      default:
        return <GoatMeter />;
    }
  };

  const features = [
    { id: 'GoatMeter', name: 'GOAT Meter' },
    { id: 'PrimePredictor', name: 'Prime Predictor' },
    { id: 'DraftHistorian', name: 'Draft Historian' },
    { id: 'FranchiseBuilder', name: 'Franchise Builder' },
    { id: 'UnderratedAlgorithm', name: 'Underrated Algorithm' },
    { id: 'JerseyNumberHistory', name: 'Jersey Number History' },
    { id: 'MatchSimulator', name: 'Match Simulator' },
    { id: 'QuizShotClock', name: 'Quiz Shot-Clock' },
  ];

  return (
    <div className="App">
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
        <p>NBA Hub &copy; {new Date().getFullYear()}. All data provided for entertainment purposes. Powered by React, Vite, and balldontlie.io.</p>
      </footer>
    </div>
  );
}

export default App;