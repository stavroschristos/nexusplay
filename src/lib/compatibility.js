// Gaming compatibility engine — calculates how well two gamers match
// based on shared games, genres, franchises, play styles, completion habits,
// and achievement patterns.

export function getCompatibilityBreakdown(userA, userB) {
  if (!userA || !userB) return null;

  const reasons = [];
  let score = 35;

  // 1. Shared games — up to +25
  const gamesA = new Set((userA.favorite_games || []).map((g) => g.toLowerCase()));
  const gamesB = new Set((userB.favorite_games || []).map((g) => g.toLowerCase()));
  const sharedGames = [...gamesA].filter((g) => gamesB.has(g));
  const gamesWeight = Math.min(25, sharedGames.length * 7);
  score += gamesWeight;
  if (sharedGames.length > 0) {
    reasons.push({ label: `${sharedGames.length} shared game${sharedGames.length > 1 ? 's' : ''}`, detail: sharedGames.slice(0, 3).map((g) => titleCase(g)).join(', '), weight: gamesWeight, icon: 'games' });
  }

  // 2. Shared genres — up to +15
  const genresA = new Set((userA.favorite_genres || []).map((g) => g.toLowerCase()));
  const genresB = new Set((userB.favorite_genres || []).map((g) => g.toLowerCase()));
  const sharedGenres = [...genresA].filter((g) => genresB.has(g));
  const genresWeight = Math.min(15, sharedGenres.length * 5);
  score += genresWeight;
  if (sharedGenres.length > 0) {
    reasons.push({ label: `${sharedGenres.length} shared genre${sharedGenres.length > 1 ? 's' : ''}`, detail: sharedGenres.slice(0, 3).map((g) => titleCase(g)).join(', '), weight: genresWeight, icon: 'genres' });
  }

  // 3. Favorite franchises — up to +12
  const franchisesA = new Set((userA.favorite_franchises || []).map((f) => f.toLowerCase()));
  const franchisesB = new Set((userB.favorite_franchises || []).map((f) => f.toLowerCase()));
  const sharedFranchises = [...franchisesA].filter((f) => franchisesB.has(f));
  const franchisesWeight = Math.min(12, sharedFranchises.length * 4);
  score += franchisesWeight;
  if (sharedFranchises.length > 0) {
    reasons.push({ label: `${sharedFranchises.length} shared franchise${sharedFranchises.length > 1 ? 's' : ''}`, detail: sharedFranchises.slice(0, 2).map((f) => titleCase(f)).join(', '), weight: franchisesWeight, icon: 'franchises' });
  }

  // 4. Similar play styles — up to +18
  let playStyleScore = 0;
  if (userA.completion_style && userB.completion_style && userA.completion_style === userB.completion_style) {
    playStyleScore += 6;
    reasons.push({ label: `Both ${userA.completion_style}`, detail: 'Same completion approach', weight: 6, icon: 'playstyle' });
  }
  if (userA.competitive_level && userB.competitive_level && userA.competitive_level === userB.competitive_level) {
    playStyleScore += 6;
    reasons.push({ label: `Both ${userA.competitive_level}`, detail: 'Same competitive intensity', weight: 6, icon: 'playstyle' });
  }
  if (userA.multiplayer_preference && userB.multiplayer_preference && userA.multiplayer_preference === userB.multiplayer_preference) {
    playStyleScore += 6;
    reasons.push({ label: `Both prefer ${userA.multiplayer_preference}`, detail: 'Same multiplayer style', weight: 6, icon: 'playstyle' });
  }
  score += playStyleScore;

  // 5. Similar completion habits — up to +15
  const habitsA = new Set((userA.gaming_habits || []).map((h) => h.toLowerCase()));
  const habitsB = new Set((userB.gaming_habits || []).map((h) => h.toLowerCase()));
  const sharedHabits = [...habitsA].filter((h) => habitsB.has(h));
  const habitsWeight = Math.min(15, sharedHabits.length * 5);
  score += habitsWeight;
  if (sharedHabits.length > 0) {
    reasons.push({ label: `${sharedHabits.length} shared habit${sharedHabits.length > 1 ? 's' : ''}`, detail: sharedHabits.slice(0, 3).map((h) => titleCase(h)).join(', '), weight: habitsWeight, icon: 'habits' });
  }

  // 6. Similar achievement patterns — up to +15
  let achievementScore = 0;
  const platDiff = Math.abs((userA.platinum_count || 0) - (userB.platinum_count || 0));
  if (platDiff <= 2) achievementScore += 5; else if (platDiff <= 5) achievementScore += 3;
  const rareDiff = Math.abs((userA.rare_achievements || 0) - (userB.rare_achievements || 0));
  if (rareDiff <= 5) achievementScore += 5; else if (rareDiff <= 15) achievementScore += 3;
  const compDiff = Math.abs((userA.completion_percentage || 0) - (userB.completion_percentage || 0));
  if (compDiff <= 10) achievementScore += 5; else if (compDiff <= 25) achievementScore += 3;
  score += achievementScore;
  if (achievementScore >= 9) {
    reasons.push({ label: 'Similar achievement patterns', detail: 'Trophy & completion profile match', weight: achievementScore, icon: 'achievements' });
  }

  // 7. Shared platforms — up to +5
  const platformsA = new Set(userA.platforms_owned || []);
  const platformsB = new Set(userB.platforms_owned || []);
  const sharedPlatforms = [...platformsA].filter((p) => platformsB.has(p));
  score += Math.min(5, sharedPlatforms.length * 2);

  score = Math.min(99, Math.round(score));

  return {
    score,
    reasons: reasons.sort((a, b) => b.weight - a.weight),
    sharedGames: sharedGames.map((g) => titleCase(g)),
    sharedGenres: sharedGenres.map((g) => titleCase(g)),
    sharedFranchises: sharedFranchises.map((f) => titleCase(f)),
    sharedHabits: sharedHabits.map((h) => titleCase(h)),
    sharedPlatforms,
    playStyleScore,
    achievementScore,
  };
}

export function calculateCompatibility(userA, userB) {
  return getCompatibilityBreakdown(userA, userB)?.score || 0;
}

export function sharedGamesCount(userA, userB) {
  if (!userA || !userB) return 0;
  const gamesA = new Set((userA.favorite_games || []).map((g) => g.toLowerCase()));
  const gamesB = new Set((userB.favorite_games || []).map((g) => g.toLowerCase()));
  return [...gamesA].filter((g) => gamesB.has(g)).length;
}

export function sharedHabitsCount(userA, userB) {
  if (!userA || !userB) return 0;
  const habitsA = new Set((userA.gaming_habits || []).map((h) => h.toLowerCase()));
  const habitsB = new Set((userB.gaming_habits || []).map((h) => h.toLowerCase()));
  return [...habitsA].filter((h) => habitsB.has(h)).length;
}

export function achievementSimilarity(userA, userB) {
  if (!userA || !userB) return 0;
  let s = 0;
  const platDiff = Math.abs((userA.platinum_count || 0) - (userB.platinum_count || 0));
  if (platDiff <= 2) s += 10; else if (platDiff <= 5) s += 6;
  const rareDiff = Math.abs((userA.rare_achievements || 0) - (userB.rare_achievements || 0));
  if (rareDiff <= 5) s += 10; else if (rareDiff <= 15) s += 6;
  const compDiff = Math.abs((userA.completion_percentage || 0) - (userB.completion_percentage || 0));
  if (compDiff <= 10) s += 10; else if (compDiff <= 25) s += 6;
  return s;
}

function titleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}