# Libro de estilo — Yatzy

Este documento es la **única fuente de verdad** de los valores visuales del proyecto.
Los valores se materializan como custom properties CSS en `src/styles/tokens.css`.

Dirección visual: estilo **juego de mesa / cartoon** — colores cálidos (coral, crema,
beige), bordes gruesos oscuros en todos los elementos, tipografía redondeada y bold
(Fredoka), diseño flat sin sombras pronunciadas. Las dos columnas de jugadores se
distinguen por color: naranja/coral para el jugador 1 y turquesa para el jugador 2.

## Paleta de colores

| Token                    | Valor     | Uso                                               |
| ------------------------ | --------- | ------------------------------------------------- |
| `--color-bg`             | `#e8917a` | Fondo exterior (coral)                            |
| `--color-surface`        | `#f9ebce` | Fondo de las tarjetas (crema)                     |
| `--color-surface-alt`    | `#f3dfa9` | Franjas alternas de las filas (beige)             |
| `--color-surface-light`  | `#ffffff` | Badges de etiqueta, círculos, botones secundarios |
| `--color-border`         | `#2b2b2b` | Bordes gruesos oscuros (4px)                      |
| `--color-text-primary`   | `#2b2b2b` | Texto principal                                   |
| `--color-text-secondary` | `#7a6a52` | Texto secundario                                  |
| `--color-purple`         | `#7a5cf0` | Esquina de los badges y texto BONUS               |
| `--color-yellow`         | `#ffc93c` | Texto YATZY y estado activo de las estrellas      |
| `--color-cell-p1`        | `#e8916e` | Celdas del jugador 1 (naranja)                    |
| `--color-cell-p1-border` | `#b04a36` | Borde de las celdas del jugador 1                 |
| `--color-cell-p2`        | `#7fc4c4` | Celdas del jugador 2 (turquesa)                   |
| `--color-cell-p2-border` | `#3b7d7d` | Borde de las celdas del jugador 2                 |
| `--color-bar`            | `#c25a4e` | Barra inferior GIRA y botón primario              |
| `--color-star`           | `#3f3f3f` | Botones estrella de los dados                     |

## Tipografía

- Familia: **Fredoka** (Google Fonts), fallback `system-ui`. Estilo casual y redondeado.
- Jerarquía:
    - Título home: `2.5rem` / 700 con sombra dura (`text-shadow: 3px 3px 0`).
    - Display del marcador: `2rem` / 700.
    - Título: `1.5rem` / 700.
    - Subtítulo: `1.125rem` / 700.
    - Body: `1rem` / 400–500.
    - Label: `0.875rem` / 700.
    - Caption: `0.75rem` / 700.
- Texto **YATZY** en amarillo con `text-shadow: 2px 2px 0` del borde oscuro.

## Estilo de código

- **Indentación de 4 espacios** (sin tabs) en JS, JSX y CSS; la gestiona Prettier
  (`.prettierrc.json`: `tabWidth: 4`, `useTabs: false`) y se verifica en CI con
  `yarn format:check`.
- El **código se escribe en inglés** (identificadores, nombres de funciones,
  constantes) y se **comenta en español**. Los textos de interfaz van en español.

## Espaciados y grilla

- Escala de spacing: 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 rem.
- La aplicación es una **columna vertical centrada de ~480px** sobre fondo coral;
  el tablero, el marcador y la barra GIRA comparten un ancho máximo de 460px.
- El tablero usa filas de 7 columnas compartidas: `badge, celda p1, celda p2, divisor,
badge, celda p1, celda p2`. Las filas alternan franjas crema/beige y las mitades se
  separan con una línea vertical central.
- Las celdas son cuadrados fijos de `--cell-size` (48px) y los badges de etiqueta
  de `--badge-size` (68px); en pantallas ≤380px se compactan a 40px y 56px.

## Componentes base

### Tarjeta (scoreboard, tablero, fin de partida)

- Fondo `--color-surface`, borde `--border-thick` (4px oscuro), radio `--radius-card` (24px).

### Badge de etiqueta (fila del tablero)

- Fondo blanco, radio 10px, borde morado en la esquina superior izquierda y borde
  oscuro en el resto (efecto cómic).

### Celda de puntuación

- Cuadrado 42px con borde 3px; jugador 1 naranja (`--color-cell-p1`) con borde rojo
  oscuro, jugador 2 turquesa con borde turquesa oscuro.
- Vacías hasta anotar; en el turno del jugador muestran el valor prospectivo y son
  pulsables (escalan ligeramente al hover).

### Círculo de bonus

- Círculo de 42px blanco con borde naranja (p1) o turquesa (p2) y texto `suma/63`;
  se rellena de amarillo al alcanzar el umbral.

### Botón

- Bordes de 2px oscuros y radio de píldora; primario rojo ladrillo con texto blanco,
  secundario blanco con texto oscuro.

### Estrella de dado (conservación)

- Cuadrado gris oscuro (`--color-star`) con icono de estrella blanco y el valor del
  dado debajo; marcada para conservar el dado pasa a fondo amarillo con contenido
  oscuro. Al pulsar GIRA se relanzan solo los dados sin estrella.

### Barra GIRA

- Barra ancha roja ladrillo (`--color-bar`) con borde grueso, texto "GIRA" a la
  izquierda y tres círculos blancos numerados 1/2/3 a la derecha (contador de tiradas).

## Iconografía

- Librería estándar: **Material Symbols (Rounded)** de Google.
- No se incrustan emojis en la interfaz ni en el código.
- Iconos usados: `star` (dados), `cottage` (full house), `style` (escalera pequeña),
  `view_carousel` (escalera grande), `help` (oportunidad), `smart_toy`, `group`,
  `play_arrow`, `restart_alt`, `arrow_back`, `emoji_events`.
- Los dados del 1 al 6 se dibujan con puntos CSS (`DieFace`), también en el favicon SVG.
