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

// Filas de la columna izquierda: dados del 1 al 6 (caras dibujadas) y bonus
const LEFT_ROWS = UPPER_CATEGORIES.map((category, index) => ({
    id: category,
    die: index + 1,
}));

// Filas de la columna derecha: combinaciones de la sección inferior
const RIGHT_ROWS = [
    { id: CATEGORY_THREE_OF_A_KIND, label: '3X' },
    { id: CATEGORY_FOUR_OF_A_KIND, label: '4X' },
    { id: CATEGORY_FULL_HOUSE, icon: 'cottage' },
    { id: CATEGORY_SMALL_STRAIGHT, icon: 'style', caption: 'SMALL' },
    { id: CATEGORY_LARGE_STRAIGHT, icon: 'view_carousel', caption: 'LARGE' },
    { id: CATEGORY_YATZY, label: 'YATZY', yatzy: true },
    { id: CATEGORY_CHANCE, icon: 'help' },
];

// Badge cuadrado de etiqueta: fondo blanco y borde morado en la esquina superior
function RowBadge({ die = null, label = null, icon = null, caption = null, yatzy = false }) {
    return (
        <div className={`scorecard__badge${yatzy ? ' scorecard__badge--yatzy' : ''}`}>
            {die !== null && <DieFace value={die} />}
            {label !== null && <span className="scorecard__badge-text">{label}</span>}
            {icon !== null && <Icon name={icon} />}
            {caption !== null && <span className="scorecard__badge-caption">{caption}</span>}
        </div>
    );
}

// Construye el contenido de la celda de un jugador: valor anotado, valor que se
// obtendría con la tirada actual o vacío
function buildCellProps(game, category, player, interactable) {
    const score = game.scores[player][category];
    if (score !== null) {
        return { value: score, selectable: false };
    }
    const isTurnPlayer = player === game.turn;
    const hasDice = game.dice.length > 0;
    if (isTurnPlayer && hasDice) {
        return { value: scoreCategory(game.dice, category), selectable: interactable };
    }
    return { value: null, selectable: false };
}

// Celda de puntuación de un jugador para una categoría
function PlayerCell({ game, category, player, interactable, onSelectCategory }) {
    const props = buildCellProps(game, category, player, interactable);
    const onClick = props.selectable ? () => onSelectCategory(category) : null;
    return (
        <ScorecardCell
            player={player}
            value={props.value}
            selectable={props.selectable}
            onClick={onClick}
        />
    );
}

// Mitad de una fila: badge de etiqueta más las celdas naranja y turquesa.
// Es una grilla propia de tres columnas (badge flexible + dos celdas fijas)
function RowHalf({ badge, category, game, interactable, onSelectCategory }) {
    return (
        <div className="scorecard__half">
            {badge}
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
    );
}

// Fila especial del bonus: etiqueta en morado y círculos de progreso 0/63
// en lugar de las celdas normales de la mitad izquierda
function BonusRow({ game, interactable, onSelectCategory }) {
    return (
        <div className="scorecard__row">
            <div className="scorecard__half">
                <div className="scorecard__badge scorecard__badge--bonus">
                    <span className="scorecard__badge-text">BONUS</span>
                    <span className="scorecard__bonus-value">+{BONUS_SCORE}</span>
                </div>
                <BonusCircle
                    player={PLAYER_1}
                    upperSum={computeUpperSum(game.scores[PLAYER_1])}
                    threshold={BONUS_THRESHOLD}
                />
                <BonusCircle
                    player={PLAYER_2}
                    upperSum={computeUpperSum(game.scores[PLAYER_2])}
                    threshold={BONUS_THRESHOLD}
                />
            </div>
            <span className="scorecard__row-divider" />
            <div className="scorecard__half">
                <RowBadge icon="help" />
                <PlayerCell
                    game={game}
                    category={CATEGORY_CHANCE}
                    player={PLAYER_1}
                    interactable={interactable}
                    onSelectCategory={onSelectCategory}
                />
                <PlayerCell
                    game={game}
                    category={CATEGORY_CHANCE}
                    player={PLAYER_2}
                    interactable={interactable}
                    onSelectCategory={onSelectCategory}
                />
            </div>
        </div>
    );
}

// Tablero de puntuaciones estilo juego de mesa: 7 filas con franjas alternas,
// cada una con mitad izquierda (sección superior) y derecha (combinaciones)
// separadas por una línea vertical central
function Scorecard({ game, interactable = false, onSelectCategory }) {
    return (
        <section className="scorecard" aria-label="Tablero de puntuaciones">
            <div className="scorecard__rows">
                {LEFT_ROWS.map((left, index) => {
                    const right = RIGHT_ROWS[index];
                    return (
                        <div className="scorecard__row" key={left.id}>
                            <RowHalf
                                badge={<RowBadge die={left.die} />}
                                category={left.id}
                                game={game}
                                interactable={interactable}
                                onSelectCategory={onSelectCategory}
                            />
                            <span className="scorecard__row-divider" />
                            <RowHalf
                                badge={
                                    <RowBadge
                                        label={right.label}
                                        icon={right.icon}
                                        caption={right.caption}
                                        yatzy={right.yatzy}
                                    />
                                }
                                category={right.id}
                                game={game}
                                interactable={interactable}
                                onSelectCategory={onSelectCategory}
                            />
                        </div>
                    );
                })}
                <BonusRow
                    game={game}
                    interactable={interactable}
                    onSelectCategory={onSelectCategory}
                />
            </div>
        </section>
    );
}

export default Scorecard;
