import React from 'react';
import { type Group, calculateGroupStandings } from '../utils/group';

interface GroupStageProps {
    groups: Group[];
    onUpdateMatch: (groupId: string, matchId: string, scoreA: number, scoreB: number, isFinished: boolean) => void;
    onFinishGroupStage: () => void;
}

const GroupStage: React.FC<GroupStageProps> = ({ groups, onUpdateMatch, onFinishGroupStage }) => {
    // Basic validation to enable the "Next" button
    const allMatchesFinished = groups.every(g => g.matches.every(m => m.isFinished));

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Vòng Bảng</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                {groups.map(group => {
                    const standings = calculateGroupStandings(group);

                    return (
                        <div key={group.id} style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            flex: '1 1 350px',
                            minWidth: '300px',
                            border: '1px solid var(--border)'
                        }}>
                            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                {group.name}
                            </h3>

                            {/* STANDINGS TABLE */}
                            <table style={{ width: '100%', marginBottom: '1.5rem', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-muted)' }}>
                                        <th style={{ textAlign: 'left', padding: '4px' }}>#</th>
                                        <th style={{ textAlign: 'left', padding: '4px' }}>Team</th>
                                        <th style={{ textAlign: 'center', padding: '4px' }}>W</th>
                                        <th style={{ textAlign: 'center', padding: '4px' }}>+/-</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((s, idx) => (
                                        <tr key={s.team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <td style={{ padding: '8px 4px' }}>{idx + 1}</td>
                                            <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>{s.team.name}</td>
                                            <td style={{ textAlign: 'center', padding: '8px 4px' }}>{s.won}</td>
                                            <td style={{ textAlign: 'center', padding: '8px 4px' }}>{s.pointDiff > 0 ? `+${s.pointDiff}` : s.pointDiff}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* MATCHES LIST */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {group.matches.map(match => (
                                    <div key={match.id} style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '8px',
                                        padding: '0.8rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                            <span style={{ flex: 1, textAlign: 'right', paddingRight: '10px' }}>{match.teamA.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VS</span>
                                            <span style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>{match.teamB.name}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="number"
                                                value={match.scoreA}
                                                onChange={(e) => onUpdateMatch(group.id, match.id, parseInt(e.target.value) || 0, match.scoreB, true)}
                                                style={{ width: '50px', textAlign: 'center', padding: '4px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                                            />
                                            <span>-</span>
                                            <input
                                                type="number"
                                                value={match.scoreB}
                                                onChange={(e) => onUpdateMatch(group.id, match.id, match.scoreA, parseInt(e.target.value) || 0, true)}
                                                style={{ width: '50px', textAlign: 'center', padding: '4px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button
                    onClick={onFinishGroupStage}
                    disabled={!allMatchesFinished}
                    style={{
                        opacity: allMatchesFinished ? 1 : 0.5,
                        cursor: allMatchesFinished ? 'pointer' : 'not-allowed',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1.1rem',
                        padding: '1rem 2rem'
                    }}
                >
                    {allMatchesFinished ? "Hoàn thành & Tạo vòng Knockout" : "Hãy hoàn thành tất cả các trận đấu"}
                </button>
            </div>
        </div>
    );
};

export default GroupStage;
