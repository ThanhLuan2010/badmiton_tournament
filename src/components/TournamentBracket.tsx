import React, { useMemo } from 'react';
import type { Match } from '../utils/tournament';
import type { Team } from '../utils/pairing';

interface TournamentBracketProps {
    matches: Match[];
    onDeclareWinner: (matchId: string, winner: Team) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, onDeclareWinner }) => {
    // Group matches by round
    const rounds = useMemo(() => {
        const r: Record<number, Match[]> = {};
        matches.forEach(m => {
            if (!r[m.roundIndex]) r[m.roundIndex] = [];
            r[m.roundIndex].push(m);
        });
        // Sort matches in each round by matchIndex to keep them in order
        Object.keys(r).forEach(k => {
            r[Number(k)].sort((a, b) => a.matchIndex - b.matchIndex);
        });
        return r;
    }, [matches]);

    const roundIndexes = Object.keys(rounds).map(Number).sort((a, b) => a - b);

    return (
        <div className="bracket-container">
            <div className="bracket-scroll">
                {roundIndexes.map((roundIdx, i) => (
                    <div key={roundIdx} className="round-column">
                        <h3 className="round-title">
                            {i === roundIndexes.length - 1 ? 'Chung Kết' : `Vòng ${i + 1}`}
                        </h3>
                        <div className="match-list">
                            {rounds[roundIdx].map(match => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    onDeclareWinner={onDeclareWinner}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* We can show the Champion if the final match has a winner */}
                {(() => {
                    const finalMatch = rounds[roundIndexes[roundIndexes.length - 1]]?.[0];
                    if (finalMatch && finalMatch.winner) {
                        return (
                            <div className="champion-column">
                                <div className="champion-badge">
                                    <h3>🏆 VÔ ĐỊCH 🏆</h3>
                                    <div className="winner-name">{finalMatch.winner.name}</div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

            </div>

            <style>{`
        .bracket-container {
          width: 100%;
          overflow-x: auto;
          background: var(--surface);
          border-radius: var(--radius);
          padding: 2rem;
          border: 1px solid var(--border);
        }
        
        .bracket-scroll {
          display: flex;
          gap: 4rem;
          min-width: min-content;
          /* Center if content is smaller than screen */
          margin: 0 auto;
        }

        .round-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          min-width: 200px;
        }

        .round-title {
          text-align: center;
          color: var(--primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .match-list {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          flex-grow: 1;
          gap: 2rem;
        }
        
        .champion-column {
            display: flex;
            align-items: center;
            justify-content: center;
            padding-left: 2rem;
            animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .champion-badge {
            background: linear-gradient(135deg, #fbbf24, #d97706);
            padding: 2rem;
            border-radius: var(--radius);
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
            text-align: center;
            color: #fff;
        }
        .winner-name {
            font-size: 1.5rem;
            font-weight: 900;
            margin-top: 0.5rem;
        }

        @keyframes popIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

const MatchCard: React.FC<{ match: Match; onDeclareWinner: (id: string, w: Team) => void }> = ({ match, onDeclareWinner }) => {
    const isClickable = (team: Team | null | undefined) => {
        return !!team && !match.winner;
    };

    return (
        <div className={`match-card ${match.winner ? 'finished' : ''}`}>
            <div
                className={`match-team ${match.winner?.id === match.teamA?.id ? 'winner' : ''} ${match.teamA ? 'active' : 'empty'}`}
                onClick={() => isClickable(match.teamA) && onDeclareWinner(match.id, match.teamA!)}
            >
                {match.teamA ? match.teamA.name : '...'}
            </div>
            <div className="vs">VS</div>
            <div
                className={`match-team ${match.winner?.id === match.teamB?.id ? 'winner' : ''} ${match.teamB ? 'active' : 'empty'}`}
                onClick={() => isClickable(match.teamB) && onDeclareWinner(match.id, match.teamB!)}
            >
                {match.teamB ? match.teamB.name : '...'}
            </div>

            <style>{`
        .match-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: var(--shadow);
          min-height: 80px;
        }

        .match-team {
          padding: 0.5rem 1rem;
          cursor: default;
          transition: background 0.2s;
          flex: 1;
          display: flex;
          align-items: center;
          font-size: 0.9rem;
        }

        .match-team.active {
          cursor: pointer;
        }

        .match-team.active:hover {
          background: var(--surface-hover);
        }
        
        .match-team.winner {
            background: rgba(16, 185, 129, 0.2); /* Emerald 500 alpha */
            color: #34d399;
            font-weight: bold;
        }
        
        .match-team.empty {
            color: var(--text-muted);
            font-style: italic;
        }

        .vs {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.7rem;
            color: var(--text-muted);
            opacity: 0.5;
            pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default TournamentBracket;
