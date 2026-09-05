import { useState } from 'react';
import { useGame } from '@/hooks/useGame.js';
import GameScreen from '@/features/game/GameScreen.jsx';
import HomeScreen from '@/features/menu/HomeScreen.jsx';
import { DIFFICULTY_LABELS, DEFAULT_DIFFICULTY } from '@/features/bot/difficulty.js';
import './App.css';

// Aplicación principal: alterna entre la pantalla de inicio y la partida
function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('local');
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const { game, roll, toggleRerollMark, score, restart } = useGame({
    botDifficulty: mode === 'bot' ? difficulty : null,
  });

  const startGame = (nextMode, nextDifficulty) => {
    setMode(nextMode);
    setDifficulty(nextDifficulty);
    restart();
    setScreen('game');
  };

  const goHome = () => {
    // se reinicia la partida para cancelar turnos pendientes del bot al salir
    restart();
    setScreen('home');
  };

  return (
    <div className="app">
      {screen === 'home' ? (
        <HomeScreen onStart={startGame} />
      ) : (
        <GameScreen
          game={game}
          onRoll={roll}
          onToggleReroll={toggleRerollMark}
          onScore={score}
          onRestart={restart}
          onMenu={goHome}
          player1Name={mode === 'bot' ? 'TÚ' : 'Jugador 1'}
          player2Name={mode === 'bot' ? 'BOT' : 'Jugador 2'}
          badge={mode === 'bot' ? DIFFICULTY_LABELS[difficulty] : '2 JUGADORES'}
          botMode={mode === 'bot'}
        />
      )}
    </div>
  );
}

export default App;
