import './DieFace.css';

// Posiciones de los puntos en una grilla de 3x3 según el valor del dado
const PIP_LAYOUTS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Cara de un dado dibujada con puntos CSS; reutilizable como etiqueta o como dado
function DieFace({ value, className = '' }) {
  const pips = PIP_LAYOUTS[value] ?? [];
  return (
    <span className={`die-face ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className={`die-face__cell${pips.includes(index) ? ' die-face__cell--pip' : ''}`}
        />
      ))}
    </span>
  );
}

export default DieFace;
