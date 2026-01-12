import { useState } from 'react'
import './App.css'
import PlayerInput from './components/PlayerInput'
import TeamList from './components/TeamList'
import TournamentBracket from './components/TournamentBracket'
import { generateTeams, type Team } from './utils/pairing'
import { generateBracket, type Match } from './utils/tournament'

function App() {
  const [step, setStep] = useState<'input' | 'teams' | 'tournament'>('input');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const handleGenerateTeams = (males: string[], females: string[]) => {
    const newTeams = generateTeams(males, females);
    if (newTeams.length < 2) {
      alert("Cần ít nhất 2 người để tạo đội!");
      return;
    }
    setTeams(newTeams);
    setStep('teams');
  };

  const handleStartTournament = () => {
    const bracket = generateBracket(teams);
    setMatches(bracket);
    setStep('tournament');
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

          // Determine if this winner goes to A or B slot?
          // We can check if the current match is the 'A' source or 'B' source for the next match.
          // BUT, my util didn't explicitly store "Source A/B".
          // However, my util pushed matches in pairs: [0,1] -> next[0].
          // match.matchIndex is key.
          // If matchIndex is even (0, 2, 4), it goes to teamA of next match.
          // If matchIndex is odd (1, 3, 5), it goes to teamB of next match.

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
      setMatches([]);
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
          <TeamList teams={teams} onStartTournament={handleStartTournament} />
          <div className="actions" style={{ marginTop: '1rem' }}>
            <button onClick={() => setStep('input')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Quay lại</button>
          </div>
        </div>
      )}

      {step === 'tournament' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <TournamentBracket matches={matches} onDeclareWinner={handleDeclareWinner} />
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
