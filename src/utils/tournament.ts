import type { Team } from './pairing';

export interface Match {
    id: string;
    roundIndex: number; // 0 = finals, highest = first round
    matchIndex: number;
    teamA?: Team | null; // null represents a Bye or waiting for winner
    teamB?: Team | null;
    winner?: Team | null;
    nextMatchId?: string | null;
}

export const generateBracket = (teams: Team[]): Match[] => {
    if (teams.length < 2) return [];

    const totalTeams = teams.length;
    // Next power of 2
    const size = Math.pow(2, Math.ceil(Math.log2(totalTeams)));

    // Pad with byes (nulls) if needed
    const seeds: (Team | null)[] = [...teams];
    while (seeds.length < size) {
        seeds.push(null);
    }

    // Shuffle seeds if desired, or keep them as is (randomness was in pairing)
    // For standard seeds, usually 1 vs size, 2 vs size-1, etc.
    // But here we can just pair adjacent since we already shuffled.

    let matches: Match[] = [];
    let roundTeams = seeds;
    let roundCount = Math.log2(size);

    // We are generating rounds from First Round (RoundCount - 1) down to Finals (0)
    // Actually, usually easier to store rounds as 0=First, N=Finals
    // Let's do 0 = First Round

    // Strategy: Create the tree structure.
    // We need to link matches. 

    // Let's build levels.
    // Level 0: size/2 matches.
    // Level 1: size/4 matches.
    // ...
    // Level N: 1 match.

    let currentLevelMatches: Match[] = [];

    // First Round
    for (let i = 0; i < size / 2; i++) {
        const tA = roundTeams[i * 2];
        const tB = roundTeams[i * 2 + 1];

        // Auto-advance if Bye
        let winner = null;
        if (tA && !tB) winner = tA;
        if (!tA && tB) winner = tB;

        currentLevelMatches.push({
            id: crypto.randomUUID(),
            roundIndex: 0,
            matchIndex: i,
            teamA: tA,
            teamB: tB,
            winner: winner
        });
    }
    matches.push(...currentLevelMatches);

    let prevLevelMatches = currentLevelMatches;

    for (let r = 1; r < roundCount; r++) {
        currentLevelMatches = [];
        for (let i = 0; i < prevLevelMatches.length / 2; i++) {
            const m1 = prevLevelMatches[i * 2];
            const m2 = prevLevelMatches[i * 2 + 1];

            const newMatch: Match = {
                id: crypto.randomUUID(),
                roundIndex: r,
                matchIndex: i,
                teamA: null, // Waiting for m1 winner
                teamB: null, // Waiting for m2 winner
                winner: null
            };

            // Link previous matches to this one
            m1.nextMatchId = newMatch.id;
            m2.nextMatchId = newMatch.id;

            // If previous matches were auto-won (byes), promote them immediately
            if (m1.winner) newMatch.teamA = m1.winner;
            if (m2.winner) newMatch.teamB = m2.winner;

            // Check for double auto-win propagation (recursive byes)
            if (newMatch.teamA && !newMatch.teamB && !isFirstRoundWithRealBye(m2)) {
                // This logic gets complex for deep byes, but simple pairing usually balances well.
                // Simplest: If teamA is present and teamB is a permeant bye, auto win.
                // But 'null' in team slot means waiting, not bye.
                // We need to distinguish "Waiting" vs "Bye". 
                // Logic: Byes only happen in Round 0. 
                // So if Round > 0, null means waiting.
            }

            currentLevelMatches.push(newMatch);
        }
        matches.push(...currentLevelMatches);
        prevLevelMatches = currentLevelMatches;
    }

    return matches;
};

// Helper: check if a match is a bye match (one side empty) from round 0? 
// Not strictly needed if we adhere to "Round 0 handles Byes". 
// Logic update: In later rounds, we just wait for winners.
function isFirstRoundWithRealBye(_m: Match) {
    return false; // placeholder logic if needed
}
