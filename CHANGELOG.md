# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el proyecto
respeta [Versionado Semántico](https://semver.org/lang/es/).

## [0.1.0] — 2026-09-05

### Added

- Proyecto React 19 + Vite 8 + Yarn 4 con ESLint, Prettier, Husky y lint-staged.
- Pipeline de CI con GitHub Actions (lint, tests y build por PR).
- Libro de estilo (`docs/style-guide.md`) y tokens de diseño (`src/styles/tokens.css`).
- Motor de reglas de Yatzy en JavaScript puro: dados, puntuación de las 13 categorías,
  bonus de 63 y máquina de estados del turno.
- Bot en JavaScript puro con tres niveles de dificultad: Fácil (voraz aleatorio), Medio
  (voraz) y Difícil (valor esperado sobre todos los subconjuntos de dados).
- Interfaz completa: scoreboard con contadores, tablero de puntuaciones con sección
  superior e inferior, dados retenibles y botón de lanzamiento `GIRA y 3 dados (1, 2 , 3)`.
- Pantallas de inicio (modo y dificultad) y de fin de partida.
- 83 tests unitarios y de componentes (Vitest + Testing Library).
