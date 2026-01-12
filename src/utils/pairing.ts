export interface Player {
    id: string;
    name: string;
    gender: 'M' | 'F';
}

export interface Team {
    id: string;
    members: Player[];
    name: string; // e.g. "Create Team Name" or "John & Jane"
}

export const generateTeams = (males: string[], females: string[]): Team[] => {
    const shuffle = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const mList = shuffle([...males.filter(n => n.trim())]);
    const fList = shuffle([...females.filter(n => n.trim())]);

    const teams: Team[] = [];

    // Pair M + F
    while (mList.length > 0 && fList.length > 0) {
        const m = mList.pop();
        const f = fList.pop();
        teams.push({
            id: crypto.randomUUID(),
            members: [
                { id: crypto.randomUUID(), name: m, gender: 'M' },
                { id: crypto.randomUUID(), name: f, gender: 'F' }
            ],
            name: `${m} & ${f}`
        });
    }

    // Handle leftovers
    const leftovers = [...mList, ...fList]; // These are just strings

    // Pair remaining leftovers
    while (leftovers.length >= 2) {
        const p1 = leftovers.pop();
        const p2 = leftovers.pop();
        teams.push({
            id: crypto.randomUUID(),
            members: [
                { id: crypto.randomUUID(), name: p1, gender: 'M' }, // Gender unknown/irrelevant for overflow
                { id: crypto.randomUUID(), name: p2, gender: 'F' }
            ],
            name: `${p1} & ${p2}`
        });
    }

    // Handle single leftover if any (odd total number of participants)
    if (leftovers.length > 0) {
        const p = leftovers.pop();
        teams.push({
            id: crypto.randomUUID(),
            members: [
                { id: crypto.randomUUID(), name: p, gender: 'M' }
            ],
            name: `${p} (Solo)`
        });
    }

    return teams;
};
