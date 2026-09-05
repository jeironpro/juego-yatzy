import { PLAYER_1 } from '@/features/game/constants.js';
import './ScorecardCell.css';

// Celda cuadrada de puntuación del tablero: naranja para el jugador 1 y
// turquesa para el jugador 2. Se muestra vacía (sin número) hasta que se
// anota, enseña el valor prospectivo durante el turno y actúa como botón
// cuando es seleccionable
function ScorecardCell({ player, value = null, selectable = false, onClick = null }) {
  const variant = player === PLAYER_1 ? 'p1' : 'p2';
  const className = [
    'scorecard-cell',
    `scorecard-cell--${variant}`,
    selectable ? 'scorecard-cell--selectable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (selectable) {
    return (
      <button type="button" className={className} onClick={onClick} aria-label={`Anotar ${value}`}>
        {value}
      </button>
    );
  }

  return <div className={className}>{value}</div>;
}

export default ScorecardCell;
