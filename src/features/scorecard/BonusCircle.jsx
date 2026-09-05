import './BonusCircle.css';

// Círculo redondo que muestra el progreso de la sección superior (suma / 63);
// se resalta cuando se alcanza el umbral del bonus
function BonusCircle({ upperSum, threshold }) {
  const achieved = upperSum >= threshold;
  const className = ['bonus-circle', achieved ? 'bonus-circle--achieved' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="bonus-circle__wrapper">
      <span className={className}>
        {upperSum}/{threshold}
      </span>
    </div>
  );
}

export default BonusCircle;
