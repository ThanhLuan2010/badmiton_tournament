import { useState } from 'react'
import './App.css'
import PlayerInput from './components/PlayerInput'
import TeamList from './components/TeamList'
import TournamentBracket from './components/TournamentBracket'
import GroupStage from './components/GroupStage'
import { generateTeams, type Team } from './utils/pairing'
import { generateBracket, type Match } from './utils/tournament'
import { generateGroups, type Group, calculateGroupStandings } from './utils/group'

function App() {
  const [step, setStep] = useState<'input' | 'teams' | 'groups' | 'tournament'>('input');
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [champion, setChampion] = useState<Team | null>(null);

  const handleGenerateTeams = (males: string[], females: string[]) => {
    const newTeams = generateTeams(males, females);
    if (newTeams.length < 2) {
      alert("Cần ít nhất 2 người để tạo đội!");
      return;
    }
    setTeams(newTeams);
    setStep('teams');
  };

  const handleStartGroupStage = () => {
    // Generate Groups
    const newGroups = generateGroups(teams);
    setGroups(newGroups);
    setStep('groups');
  };

  const handleUpdateGroupMatch = (groupId: string, matchId: string, scoreA: number, scoreB: number, isFinished: boolean) => {
    setGroups(prevGroups => prevGroups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        matches: g.matches.map(m => {
          if (m.id !== matchId) return m;
          return { ...m, scoreA, scoreB, isFinished };
        })
      };
    }));
  };

  const handleFinishGroupStage = () => {
    // 1. Identify winners of each group
    const winners: Team[] = [];
    groups.forEach(g => {
      const standings = calculateGroupStandings(g);
      if (standings.length > 0) {
        winners.push(standings[0].team);
      }
    });

    if (winners.length === 0) return; // Should not happen

    if (winners.length === 1) {
      // Direct Champion
      setChampion(winners[0]);
      setMatches([]); // No bracket needed
      setStep('tournament');
    } else {
      // Generate Bracket
      const bracket = generateBracket(winners);
      setMatches(bracket);
      setChampion(null); // Will be decided in bracket
      setStep('tournament');
    }
  };

  const handleDeclareWinner = (matchId: string, winner: Team) => {
    setMatches(prevMatches => {
      const matchIndex = prevMatches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return prevMatches;

      const updatedMatches = [...prevMatches];
      const match = { ...updatedMatches[matchIndex], winner: winner };
      updatedMatches[matchIndex] = match;

      // Propagate logic
      if (match.nextMatchId) {
        const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
        if (nextMatchIndex !== -1) {
          const nextMatch = { ...updatedMatches[nextMatchIndex] };

          if (match.matchIndex % 2 === 0) {
            nextMatch.teamA = winner;
          } else {
            nextMatch.teamB = winner;
          }
          updatedMatches[nextMatchIndex] = nextMatch;
        }
      }

      return updatedMatches;
    });
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn làm lại từ đầu?")) {
      setStep('input');
      setTeams([]);
      setGroups([]);
      setMatches([]);
      setChampion(null);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Team Sấm Sét Tournament 💘</h1>
        <p>Ghép cặp ngẫu nhiên & Tranh tài</p>
      </header>

      {step === 'input' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <PlayerInput onGenerate={handleGenerateTeams} />
        </div>
      )}

      {step === 'teams' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <TeamList teams={teams} onStartTournament={handleStartGroupStage} />
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button onClick={() => setStep('input')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Quay lại</button>
          </div>
        </div>
      )}

      {step === 'groups' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <GroupStage
            groups={groups}
            onUpdateMatch={handleUpdateGroupMatch}
            onFinishGroupStage={handleFinishGroupStage}
          />
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button onClick={() => setStep('teams')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Quay lại</button>
          </div>
        </div>
      )}

      {step === 'tournament' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          {champion && matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h2>🏆 NHÀ VÔ ĐỊCH 🏆</h2>
              <h1 style={{ fontSize: '3rem', color: '#fbbf24', marginTop: '1rem' }}>{champion.name}</h1>
              <p style={{ marginTop: '2rem', fontStyle: 'italic', opacity: 0.8 }}>Chiến thắng thuyết phục ngay từ vòng bảng!</p>
            </div>
          ) : (
            <TournamentBracket matches={matches} onDeclareWinner={handleDeclareWinner} />
          )}

          <div className="actions" style={{ marginTop: '2rem' }}>
            <button onClick={handleReset} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Làm mới giải đấu</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        button {
             border-radius: 50px;
             padding: 0.8rem 1.5rem;
             cursor: pointer;
             transition: all 0.2s;
        }
      `}</style>
    </div>
  )
}

export default App
