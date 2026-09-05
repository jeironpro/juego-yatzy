import './RollBar.css';

// Barra inferior de lanzamiento: texto GIRA a la izquierda y tres círculos
// numerados a la derecha que indican el lanzamiento actual del turno
function RollBar({ rollNumber, maxRolls, onRoll, disabled }) {
    return (
        <button
            type="button"
            className="roll-bar"
            onClick={() => onRoll()}
            disabled={disabled}
            aria-label="GIRA"
        >
            <span className="roll-bar__label">GIRA</span>
            <span className="roll-bar__circles" aria-hidden="true">
                {Array.from({ length: maxRolls }, (_, index) => (
                    <span
                        key={index}
                        className={`roll-bar__circle${rollNumber === index + 1 ? ' roll-bar__circle--active' : ''}`}
                    >
                        {index + 1}
                    </span>
                ))}
            </span>
        </button>
    );
}

export default RollBar;
