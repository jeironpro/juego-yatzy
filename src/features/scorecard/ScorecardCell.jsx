import './ScorecardCell.css';

// Celda de puntuación del tablero: muestra el valor rellenado, el valor que
// se obtendría con la tirada actual o un 0 atenuado si aún no hay tirada.
// Cuando es seleccionable actúa como botón para anotar la categoría
function ScorecardCell({ value, selectable = false, onClick = null, muted = false }) {
  const className = [
    'scorecard-cell',
    selectable ? 'scorecard-cell--selectable' : '',
    muted ? 'scorecard-cell--muted' : '',
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
