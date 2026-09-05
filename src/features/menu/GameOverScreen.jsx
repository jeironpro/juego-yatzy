import Button from '@/components/ui/Button.jsx';
import Icon from '@/components/ui/Icon.jsx';
import './GameOverScreen.css';

// Pantalla de fin de partida: título con el resultado y acciones para repetir o volver al menú
function GameOverScreen({ title, onRestart, onMenu }) {
  return (
    <div className="game-over" role="dialog" aria-label="Fin de la partida">
      <Icon name="emoji_events" />
      <h2 className="game-over__title">{title}</h2>
      <div className="game-over__actions">
        <Button icon="restart_alt" onClick={onRestart}>
          Jugar de nuevo
        </Button>
        <Button variant="secondary" icon="arrow_back" onClick={onMenu}>
          Menú
        </Button>
      </div>
    </div>
  );
}

export default GameOverScreen;
