import { PLAYER_1, PLAYER_2 } from '@/features/game/constants.js';
import './Scoreboard.css';

// Marcador superior: nombres de los jugadores y contadores con "vs" al centro;
// el jugador en turno queda resaltado con su color (naranja/turquesa)
function Scoreboard({ player1Name, player2Name, player1Score, player2Score, badge = null, turn }) {
    const player1Active = turn === PLAYER_1;
    const player2Active = turn === PLAYER_2;

    return (
        <section className="scoreboard" aria-label="Marcador de la partida">
            <div className="scoreboard__badge-row">
                {badge !== null && <span className="scoreboard__badge">{badge}</span>}
            </div>
            <div className="scoreboard__names">
                <span
                    className={`scoreboard__name${player1Active ? ' scoreboard__name--active' : ''}`}
                >
                    {player1Name}
                </span>
                <span
                    className={`scoreboard__name${player2Active ? ' scoreboard__name--active' : ''}`}
                >
                    {player2Name}
                </span>
            </div>
            <div className="scoreboard__counts">
                <span
                    className={`scoreboard__count${player1Active ? ' scoreboard__count--active' : ''}`}
                >
                    {player1Score}
                </span>
                <span className="scoreboard__vs">VS</span>
                <span
                    className={`scoreboard__count${player2Active ? ' scoreboard__count--active' : ''}`}
                >
                    {player2Score}
                </span>
            </div>
        </section>
    );
}

export default Scoreboard;
