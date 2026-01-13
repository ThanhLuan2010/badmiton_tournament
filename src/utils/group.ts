import type { Team } from './pairing';

export interface GroupMatch {
    id: string;
    teamA: Team;
    teamB: Team;
    scoreA: number;
    scoreB: number;
    isFinished: boolean;
}

export interface Group {
    id: string; // 'A', 'B', 'C', ...
    name: string;
    teams: Team[];
    matches: GroupMatch[];
}

export interface GroupStanding {
    team: Team;
    played: number;
    won: number;
    lost: number;
    pointsWon: number;
    pointsLost: number;
    pointDiff: number;
}

// Helper to shuffle array (Fisher-Yates)
const shuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const generateGroups = (teams: Team[], maxPerGroup = 3): Group[] => {
    if (teams.length === 0) return [];

    // 1. Shuffle teams randomly
    const shuffledTeams = shuffle(teams);

    // 2. Calculate number of groups needed (unused but conceptual)
    // const numGroups = Math.ceil(shuffledTeams.length / maxPerGroup);

    // 3. Distribute teams
    // Strategy: Distribute evenly. If 4 teams and max 3, better 2-2 than 3-1?
    // User requirement: "mỗi bảng tối đa 3 đội".
    // Usually standard is to fill up to max, then leftover.
    // However, 4 teams -> 3 and 1 is bad (1 has no matches?).
    // 4 teams -> 2 and 2 is better.
    // 5 teams -> 3 and 2.
    // 6 teams -> 3 and 3.
    // Let's settle on: Try to keep groups balanced if possible, but strict limit is 3.
    // Simple slice for now: 3, 3, 3... last one takes remainder.
    // IMPROVEMENT: If last group has < 2 teams, steal from previous?
    // Case: 4 teams. Limit 3. Groups: [T1, T2, T3], [T4]. T4 has no one to play.
    // In that case, we should do 2 groups of 2.
    // Algorithm:
    // targetGroupSize: try 3.
    // logic: chunk.

    // Let's just do simple chunking first, but handle the "orphan" case.
    const groups: Group[] = [];
    let remaining = [...shuffledTeams];

    // Group IDs: A, B, C...
    const getGroupId = (index: number) => String.fromCharCode(65 + index); // 65 is 'A'

    let groupIndex = 0;
    while (remaining.length > 0) {
        // If remaining is 4, and max is 3. Next take 3 -> leaves 1. Bad.
        // If remaining is 4, better take 2, then 2.

        // Edge case: total 4 teams.
        // If we strictly follow "max 3", we might end up with a group of 1.
        // If a group has 1 team, it can't play round robin.
        // So we want min per group to be 2 (if total teams >= 2).

        let take = maxPerGroup;
        if (remaining.length === 4 && maxPerGroup === 3) {
            take = 2; // Split 2-2
        }

        // If we only have 1 left for the next group, and current group could spare one?
        // Actually, the straightforward fill is:
        // 4 -> 2, 2
        // 5 -> 3, 2
        // 6 -> 3, 3
        // 7 -> 3, 2, 2 (or 3, 3, 1 -> bad)
        // 7 -> 3, 4 -> 3, 2, 2 ? 
        // Let's stick to strict logic:
        // Fill groups with maxPerGroup. 
        // Check last group. If size < 2, merge with previous or redistribute?
        // Simplest: just fill. If last group size == 1, pull one from previous group (if previous group > 2).

        const chunk = remaining.splice(0, take);
        groups.push({
            id: getGroupId(groupIndex),
            name: `Bảng ${getGroupId(groupIndex)}`,
            teams: chunk,
            matches: []
        });
        groupIndex++;
    }

    // Fix orphan group (size 1)
    if (groups.length > 1) {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup.teams.length === 1) {
            // Steal from second to last
            const secondLast = groups[groups.length - 2];
            if (secondLast.teams.length > 2) {
                const movedTeam = secondLast.teams.pop();
                if (movedTeam) {
                    lastGroup.teams.unshift(movedTeam); // Add to start
                }
            }
        }
    }

    // 4. Generate matches for each group
    groups.forEach(g => {
        g.matches = generateRoundRobinMatches(g.teams);
    });

    return groups;
};

const generateRoundRobinMatches = (teams: Team[]): GroupMatch[] => {
    const matches: GroupMatch[] = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                id: crypto.randomUUID(),
                teamA: teams[i],
                teamB: teams[j],
                scoreA: 0,
                scoreB: 0,
                isFinished: false
            });
        }
    }
    return matches;
};

export const calculateGroupStandings = (group: Group): GroupStanding[] => {
    const standings: Map<string, GroupStanding> = new Map();

    // Init standings
    group.teams.forEach(t => {
        standings.set(t.id, {
            team: t,
            played: 0,
            won: 0,
            lost: 0,
            pointsWon: 0,
            pointsLost: 0,
            pointDiff: 0
        });
    });

    // Process matches
    group.matches.forEach(m => {
        if (!m.isFinished) return;

        const statA = standings.get(m.teamA.id)!;
        const statB = standings.get(m.teamB.id)!;

        statA.played++;
        statB.played++;

        statA.pointsWon += m.scoreA;
        statA.pointsLost += m.scoreB;
        statA.pointDiff = statA.pointsWon - statA.pointsLost;

        statB.pointsWon += m.scoreB;
        statB.pointsLost += m.scoreA;
        statB.pointDiff = statB.pointsWon - statB.pointsLost;

        if (m.scoreA > m.scoreB) {
            statA.won++;
            statB.lost++;
        } else if (m.scoreB > m.scoreA) {
            statB.won++;
            statA.lost++;
        }
        // Draws not handled for now (badminton usually has winner), but if equal, no win/loss increment
    });

    // Sort standings
    return Array.from(standings.values()).sort((a, b) => {
        // 1. Most wins
        if (b.won !== a.won) return b.won - a.won;
        // 2. Best Point Difference
        if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
        // 3. Most Points Won
        return b.pointsWon - a.pointsWon;
    });
};
