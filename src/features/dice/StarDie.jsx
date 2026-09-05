import Icon from '@/components/ui/Icon.jsx';
import './StarDie.css';

// Botón estrella de un dado: la estrella marca qué dados se conservarán en la
// siguiente tirada y el número muestra el valor actual del dado
function StarDie({ value, held = false, disabled = false, onToggle = null }) {
    const className = ['star-die', held ? 'star-die--held' : ''].filter(Boolean).join(' ');
    return (
        <button
            type="button"
            className={className}
            onClick={onToggle}
            disabled={disabled}
            aria-label={`Dado ${value}${held ? ', marcado para conservar' : ''}`}
            aria-pressed={held}
        >
            <Icon name="star" />
            <span className="star-die__value">{value}</span>
        </button>
    );
}

export default StarDie;
