import { PLAYER_1 } from '@/features/game/constants.js';
import './BonusCircle.css';

// Círculo redondo de progreso de la sección superior (suma / 63); el borde
// naranja corresponde al jugador 1 y el turquesa al jugador 2
function BonusCircle({ player, upperSum, threshold }) {
  const variant = player === PLAYER_1 ? 'p1' : 'p2';
  const achieved = upperSum >= threshold;
  const className = [
    'bonus-circle',
    `bonus-circle--${variant}`,
    achieved ? 'bonus-circle--achieved' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={className}>
      {upperSum}/{threshold}
    </span>
  );
}

export default BonusCircle;
