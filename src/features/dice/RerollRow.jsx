import StarDie from './StarDie.jsx';
import './RerollRow.css';

// Fila de los cinco dados como estrellas: cada una se marca para relanzarla
function RerollRow({ dice, marks, onToggleMark, disabled }) {
  return (
    <div className="reroll-row">
      {dice.map((value, index) => (
        <StarDie
          key={index}
          value={value}
          marked={marks[index]}
          disabled={disabled}
          onToggle={onToggleMark === null ? null : () => onToggleMark(index)}
        />
      ))}
    </div>
  );
}

export default RerollRow;
