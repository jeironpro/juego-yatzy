# Libro de estilo — Yatzy

Este documento es la **única fuente de verdad** de los valores visuales del proyecto.
Los valores se materializan como custom properties CSS en `src/styles/tokens.css`.

Dirección visual: estética moderna y minimalista inspirada en [idle.space](https://idle.space/) —
superficies blancas, monocromo casi total, radios generosos y sombras suaves. El acento
ámbar se reserva para estados de juego (dados retenidos, celdas seleccionables).

## Paleta de colores

| Token                    | Valor     | Uso                                                  |
| ------------------------ | --------- | ---------------------------------------------------- |
| `--color-bg`             | `#fafafa` | Fondo de la aplicación                               |
| `--color-surface`        | `#ffffff` | Tarjetas, tablero, scoreboard                        |
| `--color-surface-alt`    | `#f5f5f5` | Superficies secundarias, celdas de etiqueta          |
| `--color-text-primary`   | `#171717` | Texto principal, títulos                             |
| `--color-text-secondary` | `#6b7280` | Texto secundario, descripciones                      |
| `--color-text-tertiary`  | `#9ca3af` | Texto de apoyo, placeholders                         |
| `--color-border`         | `#e5e7eb` | Bordes de superficies                                |
| `--color-border-strong`  | `#d1d5db` | Bordes de celdas del tablero                         |
| `--color-primary`        | `#111111` | Botones principales, texto activo                    |
| `--color-primary-hover`  | `#1f2937` | Hover de botones principales                         |
| `--color-primary-subtle` | `#f3f4f6` | Fondo de elementos activos sutiles                   |
| `--color-accent`         | `#f59e0b` | Estado de juego: dados retenidos, celdas disponibles |
| `--color-accent-subtle`  | `#fef3c7` | Fondo de dados retenidos                             |
| `--color-success`        | `#16a34a` | Éxito (bonus conseguido)                             |
| `--color-error`          | `#dc2626` | Error                                                |
| `--color-warning`        | `#d97706` | Advertencia                                          |

## Tipografía

- Familia: **Geist** (Google Fonts), fallback `system-ui`.
- Jerarquía:
  - Display: `2.5rem` / 800 (título de la home)
  - Título: `1.5rem` / 700 (secciones)
  - Subtítulo: `1.125rem` / 600 (nombres de jugadores)
  - Body: `1rem` / 400 (texto general)
  - Label: `0.875rem` / 500 (celdas, botones)
  - Caption: `0.75rem` / 500 (badges, anotaciones)
- Los títulos usan `letter-spacing: -0.02em` para el aire condensado del estilo de referencia.

## Espaciados y grilla

- Escala de spacing: 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 rem.
- Breakpoints (mobile-first, media queries `min-width`):
  - `sm`: 640px — tablero de dos columnas de jugadores
  - `md`: 768px — controles y layout de página
  - `lg`: 1024px — tamaño máximo del contenedor del juego
- El tablero de puntuaciones usa una grilla por filas: etiqueta + celda jugador 1 + celda jugador 2,
  con contenido centrado en cada celda y bordes compartidos que conectan las celdas de cada jugador.

## Componentes base

### Botón

- Primary: fondo `--color-primary`, texto blanco, radio `--radius-full`, altura 48px, hover `--color-primary-hover`.
- Secondary: fondo `--color-surface`, borde `--color-border`, texto `--color-text-primary`.
- Ghost: sin fondo ni borde, texto `--color-text-secondary`.
- Estados: `hover` (oscurecer), `disabled` (opacidad 0.5, cursor `not-allowed`), foco visible con `--focus-ring`.

### Tarjeta (scoreboard, modo de juego)

- Fondo `--color-surface`, borde `--color-border` 1px, radio `--radius-xl`, sombra `--shadow-md`.

### Dado

- Cuadrado blanco con puntos negros, radio `--radius-md`, sombra `--shadow-md`.
- Retenido: fondo `--color-die-hold`, borde 2px `--color-die-hold-border`.

### Celda del tablero

- Fondo `--color-surface`, borde 1px `--color-border-strong`.
- Disponible: hover con `--color-accent-subtle` y borde acento; ocupa el turno y resalta.
- Rellenada: valor fijo, sin hover.
- Celda redonda de bonus: círculo 56px con borde `--color-border-strong` y texto centrado (`0/63`).

## Iconografía

- Librería estándar: **Material Symbols (Rounded)** de Google, cargada por Google Fonts.
- No se incrustan emojis en la interfaz ni en el código.
- Iconos usados: `smart_toy` (bot), `group` (2 jugadores), `play_arrow` (jugar),
  `undo`, `restart_alt`, `arrow_back`, `sports_esports` (título), `cottage` (full house),
  `style` (escalera pequeña), `view_carousel` (escalera grande), `help` (oportunidad),
  `casino` (lanzar dados).
- Los dados del 1 al 6 se dibujan con puntos CSS (no con iconos), para mantener
  el estilo consistente y escalable.
