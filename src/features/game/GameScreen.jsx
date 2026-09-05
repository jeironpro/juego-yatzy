import Button from '@/components/ui/Button.jsx';
import Scoreboard from '@/features/scoreboard/Scoreboard.jsx';
import Scorecard from '@/features/scorecard/Scorecard.jsx';
import HoldRow from '@/features/dice/HoldRow.jsx';
import RollBar from '@/features/dice/RollBar.jsx';
import GameOverScreen from '@/features/menu/GameOverScreen.jsx';
import { MAX_ROLLS, PLAYER_1, PLAYER_2 } from '@/features/game/constants.js';
import { canRoll, getPlayerTotal, getWinner, isGameOver } from '@/features/game/game.js';
import './GameScreen.css';

// Pantalla de partida: marcador arriba, tablero al centro y, debajo, las
// estrellas de conservación con la barra GIRA. Con botMode activo, el tablero se
// bloquea mientras juega el bot
function GameScreen({
  game,
  onRoll,
  onToggleHold,
  onScore,
  onRestart,
  onMenu,
  player1Name = 'Jugador 1',
  player2Name = 'Jugador 2',
  badge = null,
  botMode = false,
}) {
  const gameOver = isGameOver(game);
  const winner = getWinner(game);
  const humanPlaying = botMode ? game.turn === PLAYER_1 : true;
  const botThinking = botMode && game.turn === PLAYER_2 && !gameOver;

  const hasHeld = game.held.some(Boolean);
  const rollDisabled = gameOver || !humanPlaying || !canRoll(game);
  const holdDisabled =
    gameOver || !humanPlaying || game.dice.length === 0 || game.rollNumber >= MAX_ROLLS;
  const interactable = humanPlaying && game.dice.length > 0 && !gameOver;

  // Mensaje de estado según el momento del turno
  const status = botThinking
    ? 'El bot está pensando…'
    : game.dice.length === 0
      ? 'Pulsa GIRA para lanzar los dados'
      : game.rollNumber >= MAX_ROLLS
        ? 'Elige una categoría para anotar'
        : hasHeld
          ? 'Pulsa GIRA para relanzar los dados sin estrella'
          : 'Pulsa GIRA para relanzar todos los dados';

  // Título del fin de partida según el modo y el ganador
  const overTitle =
    winner === null
      ? '¡Empate!'
      : botMode
        ? winner === PLAYER_1
          ? '¡Ganaste!'
          : '¡El bot ganó!'
        : `¡${winner === PLAYER_1 ? player1Name : player2Name} gana!`;

  return (
    <div className="game-screen">
      <Scoreboard
        player1Name={player1Name}
        player2Name={player2Name}
        player1Score={getPlayerTotal(game, PLAYER_1)}
        player2Score={getPlayerTotal(game, PLAYER_2)}
        badge={badge}
        turn={game.turn}
      />

      <Scorecard game={game} interactable={interactable} onSelectCategory={onScore} />

      <div className="game-screen__play-area">
        <p className="game-screen__status" role="status">
          {status}
        </p>
        <HoldRow
          dice={game.dice}
          held={game.held}
          onToggleHold={humanPlaying ? onToggleHold : null}
          disabled={holdDisabled}
        />
        <RollBar
          rollNumber={game.rollNumber}
          maxRolls={MAX_ROLLS}
          onRoll={onRoll}
          disabled={rollDisabled}
        />
        <div className="game-screen__actions">
          <Button variant="secondary" icon="restart_alt" onClick={onRestart}>
            Reiniciar
          </Button>
          <Button variant="secondary" icon="arrow_back" onClick={onMenu}>
            Menú
          </Button>
        </div>
      </div>

      {gameOver && <GameOverScreen title={overTitle} onRestart={onRestart} onMenu={onMenu} />}
    </div>
  );
}

export default GameScreen;
