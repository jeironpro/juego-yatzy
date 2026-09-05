import Die from './Die.jsx';
import './DiceRow.css';

// Texto del botón de lanzamiento que indica los tres lanzamientos permitidos por turno
const ROLL_BUTTON_LABEL = 'GIRA y 3 dados (1, 2 , 3)';

// Fila de dados del turno actual con el botón de lanzar a su lado;
// el botón ocupa la misma altura vertical que los dados
function DiceRow({ dice, held, onToggleDie, onRoll, rollDisabled, holdDisabled }) {
  return (
    <div className="dice-row">
      <div className="dice-row__dice">
        {dice.map((value, index) => (
          <Die
            key={index}
            value={value}
            held={held[index]}
            disabled={holdDisabled}
            onToggle={onToggleDie === null ? null : () => onToggleDie(index)}
          />
        ))}
      </div>
      <button
        type="button"
        className="dice-row__roll"
        onClick={() => onRoll()}
        disabled={rollDisabled}
        aria-label={ROLL_BUTTON_LABEL}
      >
        {ROLL_BUTTON_LABEL}
      </button>
    </div>
  );
}

export default DiceRow;
