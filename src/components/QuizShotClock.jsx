import React, { useState, useEffect, useCallback } from 'react';

// Hardcoded quiz questions
const quizQuestions = [
  { question: "Who was the NBA Finals MVP in 2011?", options: ["LeBron James", "Dirk Nowitzki", "Dwyane Wade", "Jason Terry"], answer: "Dirk Nowitzki" },
  { question: "Which team won the first-ever NBA championship?", options: ["Minneapolis Lakers", "Boston Celtics", "Philadelphia Warriors", "New York Knicks"], answer: "Philadelphia Warriors" },
  { question: "Who won the regular season MVP award in the 2000-2001 season?", options: ["Shaquille O'Neal", "Kobe Bryant", "Tim Duncan", "Allen Iverson"], answer: "Allen Iverson" },
  { question: "Which player was the #1 overall pick in the 2003 NBA Draft?", options: ["Carmelo Anthony", "Dwyane Wade", "LeBron James", "Chris Bosh"], answer: "LeBron James" },
  { question: "Who is the only player to be named MVP, Defensive Player of the Year, and Finals MVP in the same season?", options: ["Michael Jordan", "Hakeem Olajuwon", "LeBron James", "Giannis Antetokounmpo"], answer: "Hakeem Olajuwon" },
  { question: "Who won the 1994 NBA Championship?", options: ["Chicago Bulls", "New York Knicks", "Houston Rockets", "Orlando Magic"], answer: "Houston Rockets" }
];

const QuizShotClock = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(24);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // useEffect to handle the 24-second timer
  useEffect(() => {
    if (showResult || isAnswered) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // Cleanup function to clear the interval
    return () => clearInterval(timerId);
  }, [timeLeft, showResult, isAnswered]);

  const handleNextQuestion = useCallback(() => {
    setIsAnswered(false);
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setTimeLeft(24);
    } else {
      setShowResult(true);
    }
  }, [currentQuestionIndex]);

  const handleAnswerClick = (option) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    if (option === quizQuestions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    // Give user a moment to see the result before moving on
    setTimeout(handleNextQuestion, 1500);
  };
  
  const handleRestart = () => {
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimeLeft(24);
      setShowResult(false);
      setIsAnswered(false);
  };

  const getButtonClass = (option) => {
    if (!isAnswered) return '';
    if (option === quizQuestions[currentQuestionIndex].answer) return 'correct';
    return 'incorrect';
  };

  return (
    <div className="fade-in">
      <h2 className="feature-title">Quiz Shot-Clock</h2>
      <p className="feature-description">Test your NBA knowledge against the clock. You have 24 seconds to answer each question about champions and MVPs.</p>
      
      <div className="quiz-container">
        {showResult ? (
          <div className="quiz-result">
            <h3>Quiz Finished!</h3>
            <p>Your final score is {score} out of {quizQuestions.length}.</p>
            <button className="styled-button" onClick={handleRestart}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="shot-clock">
              <span style={{ color: timeLeft <= 5 ? 'var(--color-accent-red)' : 'white' }}>
                {timeLeft}
              </span>
            </div>
            <div className="question-section">
              <h3>Question {currentQuestionIndex + 1}/{quizQuestions.length}</h3>
              <p>{quizQuestions[currentQuestionIndex].question}</p>
            </div>
            <div className="answer-section">
              {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                <button 
                  key={index} 
                  className={`answer-button ${getButtonClass(option)}`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="quiz-score">Score: {score}</div>
          </>
        )}
      </div>

      <style>{`
        .quiz-container {
          max-width: 800px;
          margin: auto;
          background-color: var(--color-surface);
          padding: 32px;
          border-radius: var(--border-radius);
          border: 1px solid var(--color-border);
          text-align: center;
        }
        .shot-clock {
          font-family: var(--font-heading);
          font-size: 5rem;
          color: var(--color-text-primary);
          margin-bottom: 24px;
          text-shadow: 0 0 10px var(--color-accent-red);
        }
        .question-section h3 {
          font-family: var(--font-label);
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }
        .question-section p {
          font-size: 1.5rem;
          margin-bottom: 32px;
        }
        .answer-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .answer-button {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          padding: 16px;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .answer-button:not(:disabled):hover {
          background-color: var(--color-border);
          transform: translateY(-2px);
        }
        .answer-button.correct { background-color: #4caf50; border-color: #4caf50; color: white; }
        .answer-button.incorrect { background-color: #f44336; border-color: #f44336; color: white; }
        .quiz-score { margin-top: 24px; font-size: 1.2rem; font-family: var(--font-label); }
        .quiz-result { padding: 40px 0; }
        .quiz-result h3 { font-family: var(--font-heading); font-size: 3rem; color: var(--color-accent-gold); }
        .quiz-result p { font-size: 1.5rem; margin-bottom: 24px; }
      `}</style>
    </div>
  );
};

export default QuizShotClock;