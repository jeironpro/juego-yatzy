import { render, screen } from '@testing-library/react';
import App from '@/App.jsx';

// Humo básico: la cáscara inicial de la aplicación renderiza el título
describe('App', () => {
  it('renderiza el título de la aplicación', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Yatzy' })).toBeInTheDocument();
  });
});
