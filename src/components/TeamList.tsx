import React from 'react';
import type { Team } from '../utils/pairing';

interface TeamListProps {
    teams: Team[];
    onStartTournament: () => void;
}

const TeamList: React.FC<TeamListProps> = ({ teams, onStartTournament }) => {
    if (teams.length === 0) return null;

    return (
        <div className="team-list-section">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Danh Sách Đội ({teams.length})</h2>

            <div className="team-grid">
                {teams.map((team, index) => (
                    <div key={team.id} className="team-card">
                        <div className="team-index">#{index + 1}</div>
                        <div className="team-names">
                            {team.members.map(m => (
                                <div key={m.id} className={`member-tag ${m.gender}`}>
                                    {m.name}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="actions">
                <button className="btn-primary" onClick={onStartTournament}>
                    Bắt Đầu Giải Đấu
                </button>
            </div>

            <style>{`
        .team-list-section {
          animation: fadeIn 0.5s ease-out;
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .team-card {
           background: var(--surface);
           border: 1px solid var(--border);
           border-radius: var(--radius);
           padding: 1rem;
           display: flex;
           align-items: center;
           gap: 1rem;
           transition: transform 0.2s;
        }
        .team-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
        }
        .team-index {
          font-weight: 900;
          font-size: 1.5rem;
          color: var(--text-muted);
          opacity: 0.3;
        }
        .team-names {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .member-tag {
          font-weight: 500;
        }
        .member-tag.M { color: #60a5fa; } /* Blue 400 */
        .member-tag.F { color: #f472b6; } /* Pink 400 */
        .member-tag.\\? { color: #a3a3a3; } /* Neutral */
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default TeamList;
