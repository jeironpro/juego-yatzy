import Icon from '@/components/ui/Icon.jsx';
import DieFace from '@/features/dice/DieFace.jsx';
import {
  CATEGORY_CHANCE,
  CATEGORY_FOUR_OF_A_KIND,
  CATEGORY_FULL_HOUSE,
  CATEGORY_LARGE_STRAIGHT,
  CATEGORY_SMALL_STRAIGHT,
  CATEGORY_THREE_OF_A_KIND,
  CATEGORY_YATZY,
  BONUS_SCORE,
  BONUS_THRESHOLD,
  PLAYER_1,
  PLAYER_2,
  UPPER_CATEGORIES,
} from '@/features/game/constants.js';
import { computeUpperSum, scoreCategory } from '@/features/game/scoring.js';
import BonusCircle from './BonusCircle.jsx';
import ScorecardCell from './ScorecardCell.jsx';
import './Scorecard.css';

// Filas de la sección inferior: etiqueta, icono opcional y texto bajo el icono
const LOWER_ROWS = [
  { id: CATEGORY_THREE_OF_A_KIND, label: '3x' },
  { id: CATEGORY_FOUR_OF_A_KIND, label: '4x' },
  { id: CATEGORY_FULL_HOUSE, icon: 'cottage' },
  { id: CATEGORY_SMALL_STRAIGHT, icon: 'style', caption: 'SMALL' },
  { id: CATEGORY_LARGE_STRAIGHT, icon: 'view_carousel', caption: 'LARGE' },
  { id: CATEGORY_YATZY, label: 'YATZY' },
  { id: CATEGORY_CHANCE, icon: 'help' },
];

// Etiqueta de una fila: cara de dado, texto o icono (con texto bajo el icono)
function RowLabel({ label = null, icon = null, caption = null }) {
  return (
    <div className="scorecard__label">
      {label !== null && <span className="scorecard__label-text">{label}</span>}
      {icon !== null && <Icon name={icon} />}
      {caption !== null && <span className="scorecard__label-caption">{caption}</span>}
    </div>
  );
}

// Construye el contenido de la celda de un jugador para una categoría:
// valor rellenado, valor que se obtendría con la tirada actual o 0 atenuado
function buildCellProps(game, category, player, interactable) {
  const score = game.scores[player][category];
  if (score !== null) {
    return { value: score, selectable: false };
  }
  const isTurnPlayer = player === game.turn;
  const hasDice = game.dice.length > 0;
  if (isTurnPlayer && hasDice) {
    return {
      value: scoreCategory(game.dice, category),
      selectable: interactable,
      muted: !interactable,
    };
  }
  return { value: 0, muted: true };
}

// Celda de puntuación de un jugador para una categoría
function PlayerCell({ game, category, player, interactable, onSelectCategory }) {
  const props = buildCellProps(game, category, player, interactable);
  const onClick = props.selectable ? () => onSelectCategory(category) : null;
  return (
    <ScorecardCell
      value={props.value}
      selectable={props.selectable}
      muted={props.muted}
      onClick={onClick}
    />
  );
}

// Tablero de puntuaciones: sección superior (dados 1-6 y bonus), línea divisora
// y sección inferior (combinaciones). Cada fila conecta etiqueta + jugador 1 + jugador 2
function Scorecard({ game, interactable = false, onSelectCategory }) {
  return (
    <section className="scorecard" aria-label="Tablero de puntuaciones">
      <div className="scorecard__grid scorecard__grid--upper">
        {UPPER_CATEGORIES.map((category, index) => (
          <div className="scorecard__row" key={category}>
            <div className="scorecard__label-cell">
              <RowLabel
                label={
                  <span className="scorecard__die">
                    <DieFace value={index + 1} />
                  </span>
                }
              />
            </div>
            <PlayerCell
              game={game}
              category={category}
              player={PLAYER_1}
              interactable={interactable}
              onSelectCategory={onSelectCategory}
            />
            <PlayerCell
              game={game}
              category={category}
              player={PLAYER_2}
              interactable={interactable}
              onSelectCategory={onSelectCategory}
            />
          </div>
        ))}
        <div className="scorecard__row">
          <div className="scorecard__label-cell">
            <div className="scorecard__bonus-label">
              <span>BONUS</span>
              <span className="scorecard__bonus-value">+{BONUS_SCORE}</span>
            </div>
          </div>
          <div className="scorecard__bonus-cell">
            <BonusCircle
              upperSum={computeUpperSum(game.scores[PLAYER_1])}
              threshold={BONUS_THRESHOLD}
            />
          </div>
          <div className="scorecard__bonus-cell">
            <BonusCircle
              upperSum={computeUpperSum(game.scores[PLAYER_2])}
              threshold={BONUS_THRESHOLD}
            />
          </div>
        </div>
      </div>

      <div className="scorecard__divider" role="separator" />

      <div className="scorecard__grid scorecard__grid--lower">
        {LOWER_ROWS.map((row) => (
          <div className="scorecard__row" key={row.id}>
            <div className="scorecard__label-cell">
              <RowLabel label={row.label} icon={row.icon} caption={row.caption} />
            </div>
            <PlayerCell
              game={game}
              category={row.id}
              player={PLAYER_1}
              interactable={interactable}
              onSelectCategory={onSelectCategory}
            />
            <PlayerCell
              game={game}
              category={row.id}
              player="player2"
              interactable={interactable}
              onSelectCategory={onSelectCategory}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Scorecard;
