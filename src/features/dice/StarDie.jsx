import Icon from '@/components/ui/Icon.jsx';
import './StarDie.css';

// Botón estrella de un dado: la estrella marca qué dados se relanzarán con GIRA
// y el número muestra el valor actual del dado
function StarDie({ value, marked = false, disabled = false, onToggle = null }) {
  const className = ['star-die', marked ? 'star-die--marked' : ''].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      disabled={disabled}
      aria-label={`Dado ${value}${marked ? ', marcado para relanzar' : ''}`}
      aria-pressed={marked}
    >
      <Icon name="star" />
      <span className="star-die__value">{value}</span>
    </button>
  );
}

export default StarDie;
