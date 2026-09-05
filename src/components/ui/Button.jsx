import Icon from './Icon.jsx';
import './Button.css';

// Botón genérico del sistema de diseño; variantes: primary, secondary y ghost
function Button({ variant = 'primary', icon = null, children, className = '', ...rest }) {
  return (
    <button type="button" className={`button button--${variant} ${className}`.trim()} {...rest}>
      {icon !== null && <Icon name={icon} />}
      {children}
    </button>
  );
}

export default Button;
