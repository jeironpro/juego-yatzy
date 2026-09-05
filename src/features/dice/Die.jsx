import DieFace from './DieFace.jsx';
import './Die.css';

// Dado interactivo: botón que alterna la retención durante el turno del jugador
function Die({ value, held = false, disabled = false, onToggle = null }) {
  return (
    <button
      type="button"
      className={`die${held ? ' die--held' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-label={`Dado ${value}${held ? ', retenido' : ''}`}
      aria-pressed={held}
    >
      <DieFace value={value} />
    </button>
  );
}

export default Die;
