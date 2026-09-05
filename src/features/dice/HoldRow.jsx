import StarDie from './StarDie.jsx';
import './HoldRow.css';

// Fila de los cinco dados como estrellas: cada una se marca para conservarla
// en la siguiente tirada
function HoldRow({ dice, held, onToggleHold, disabled }) {
    return (
        <div className="hold-row">
            {dice.map((value, index) => (
                <StarDie
                    key={index}
                    value={value}
                    held={held[index]}
                    disabled={disabled}
                    onToggle={onToggleHold === null ? null : () => onToggleHold(index)}
                />
            ))}
        </div>
    );
}

export default HoldRow;
