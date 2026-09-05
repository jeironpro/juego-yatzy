# Yatzy

Juego de **Yatzy** (también conocido como *Yahtzee*) implementado como aplicación web.
Se puede jugar de dos maneras:

- **Contra el bot** (implementado en JavaScript puro) en tres niveles: Fácil, Medio y Difícil.
- **Dos jugadores** en el mismo dispositivo (hot-seat), turno alternado.

La interfaz incluye un scoreboard con las puntuaciones de ambos jugadores, un tablero de
puntuaciones con las 13 categorías (sección superior con bonus de 63 y sección inferior de
combinaciones), cinco dados retenibles con un clic y el botón `GIRA y 3 dados (1, 2 , 3)` para
los tres lanzamientos de cada turno.

## Reglas del juego

- Cada turno consta de **hasta 3 lanzamientos** de 5 dados. Entre lanzamientos se pueden
  retener los dados que se deseen pulsándolos.
- Tras cualquier lanzamiento se debe elegir una categoría para anotar; si se agotan los
  3 lanzamientos, la anotación es obligatoria.

### Sección superior (dados del 1 al 6)

- **Unos, Doses, Treses, Cuatros, Cincos, Seises**: suma de los dados que muestran esa cara.
- **Bonus**: si la suma de la sección superior alcanza **63**, se suman **+35** puntos.
  Las celdas redondas muestran el progreso (`suma/63`).

### Sección inferior (combinaciones)

| Categoría | Puntuación |
|---|---|
| Trío (`3x`) | Suma de todos los dados si hay al menos 3 iguales |
| Póker (`4x`) | Suma de todos los dados si hay al menos 4 iguales |
| Full house (casa) | 25 puntos con un trío + una pareja |
| Escalera pequeña (`SMALL`) | 30 puntos con 4 consecutivos (1-2-3-4, 2-3-4-5 o 3-4-5-6) |
| Escalera grande (`LARGE`) | 40 puntos con 5 consecutivos (1-2-3-4-5 o 2-3-4-5-6) |
| Yatzy | 50 puntos con 5 dados iguales |
| Oportunidad (`?`) | Suma de todos los dados |

Gana el jugador con mayor puntuación total al completar las 13 categorías.

## Stack

| Tecnología | Uso |
|---|---|
| React 19 | Interfaz de usuario (SPA) |
| Vite 8 | Bundler y dev server |
| Yarn 4 | Gestor de paquetes (fijado en `packageManager`) |
| Vitest + Testing Library | Tests unitarios y de componentes |
| ESLint + Prettier | Lint y formato (Husky + lint-staged en pre-commit) |
| GitHub Actions | CI: lint, tests y build por PR |

## Cómo correr

Requisitos: Node.js 24 (ver `.nvmrc`) y Yarn 4.

```bash
yarn install   # instala dependencias
yarn dev       # servidor de desarrollo (http://localhost:5173)
yarn build     # build de producción en dist/
yarn preview   # sirve el build localmente
yarn test      # ejecuta los tests (Vitest)
yarn lint      # ejecuta ESLint
yarn format    # formatea el código con Prettier
```

## Estructura del proyecto

```
src/
  components/ui/        # componentes genéricos (Button, Icon)
  features/game/        # motor de reglas en JS puro (dice, scoring, game) + tests
  features/bot/         # bot en JS puro (heurística y valor esperado) y dificultades
  features/dice/        # dados dibujados con puntos CSS (Die, DieFace, DiceRow)
  features/scorecard/   # tablero de puntuaciones (Scorecard, celdas y bonus redondo)
  features/scoreboard/  # marcador superior con contadores
  features/menu/        # pantalla de inicio y fin de partida
  hooks/                # useGame (estado de partida y turno del bot)
  styles/               # tokens de diseño y estilos base
docs/
  style-guide.md        # libro de estilo (paleta, tipografía, componentes)
```

## Diseño

La dirección visual es clara y minimalista, inspirada en la estética de
[idle.space](https://idle.space/): superficies blancas, monocromo casi total, radios
generosos y sombras suaves, con acento ámbar para los estados de juego (dados retenidos y
celdas seleccionables). Todos los valores visuales (paleta, tipografía, espaciados, radios,
sombras) están definidos en el libro de estilo y materializados como custom properties en
`src/styles/tokens.css`. Los iconos usan la librería **Material Symbols** de Google y los
dados se dibujan con puntos CSS.

### Navegación y flujo de la partida

```
Home ──► (elegir modo y dificultad) ──► Partida ──► Fin de partida
                                              │          │
                                              └── Reiniciar / Menú
```

En el modo contra el bot, el turno del bot se desarrolla automáticamente: lanza, decide qué
dados conservar (heurística voraz o búsqueda de valor esperado según la dificultad) y anota
la mejor categoría disponible.

## Calidad

- **Tests**: 83 tests entre el motor de reglas, el bot, hooks y componentes (`yarn test`).
- **CI**: pipeline en `.github/workflows/ci.yml` que ejecuta lint, tests y build en cada
  pull request y push a `main`.
- **Pre-commit**: Husky + lint-staged aplican ESLint y Prettier sobre los archivos modificados.

## Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más
detalles.