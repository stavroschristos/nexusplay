// Founder profile helpers: discover the platform founder + seed their showcase.
import { base44 } from '@/api/base44Client';

export async function getFounder() {
  try {
    const res = await base44.entities.User.filter({ is_founder: true });
    return res[0] || null;
  } catch {
    return null;
  }
}

// Rich founder identity content (used by the admin "Activate Founder Profile" action).
export const FOUNDER_IDENTITY = {
  display_name: 'Kai Renner',
  gamer_tag: 'nexus_founder',
  bio: "Lifelong gamer, founder of NexusPlay. I built this place so every gamer has a home for their identity, history, and community. RPGs are my first language, but I'll play anything with a great world to get lost in.",
  gaming_quote: 'A gamer without a history is just a player. Build your legacy.',
  avatar_url: 'https://images.unsplash.com/photo-1633332755192-713a750a8f0e?w=400&h=400&fit=crop',
  banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4db9aab?w=1600&h=500&fit=crop',
  profile_theme: 'nebula',
  favorite_genres: ['RPG', 'Action', 'Adventure', 'Horror', 'Soulslike', 'Indie'],
  favorite_franchises: ['Final Fantasy', 'Dark Souls', 'The Legend of Zelda', 'Mass Effect', 'Persona', 'Resident Evil'],
  platforms_owned: ['PlayStation', 'Xbox', 'Steam', 'Nintendo Switch', 'PC'],
  current_game: 'Final Fantasy VII Rebirth',
  favorite_games: ['Elden Ring', 'The Witcher 3', 'Final Fantasy VII Rebirth', 'Bloodborne', 'Persona 5 Royal'],
  all_time_favorites: ['Final Fantasy IX', 'The Witcher 3', 'Persona 5 Royal', 'Dark Souls', 'Mass Effect 2', 'Hollow Knight'],
  currently_playing: ['Final Fantasy VII Rebirth', 'Hades II', 'Helldivers 2'],
  life_changing_games: ['Final Fantasy VII', 'Dark Souls', 'Journey', 'The Last of Us', 'Mass Effect 2'],
  anticipated_games: ['GTA VI', 'Metroid Prime 4', 'Monster Hunter Wilds', 'Fable'],
  total_games_played: 642,
  total_hours_played: 12480,
  platinum_count: 38,
  rare_achievements: 91,
  completion_percentage: 74,
  achievement_score: 18450,
  gaming_personality: 'The World-Builder',
  identity_archetype: 'The Completionist Explorer',
  identity_summary: "You are a completionist explorer — drawn to living worlds you can lose yourself in for hundreds of hours. You chase platinum trophies but slow down to savor the story. RPGs are home, but a well-crafted indie can own your heart just as fast.",
  completion_style: 'Hardcore 100%',
  competitive_level: 'Recreational',
  multiplayer_preference: 'Co-op',
  gaming_habits: ['Night Owl', 'Lore Hunter', 'Trophy Hunter', 'Weekend Warrior'],
};

// Showcase content collections/posts/achievements for the founder, created by the admin.
export const FOUNDER_COLLECTIONS = [
  { title: 'My Top 10 RPGs of All Time', description: 'The role-playing games that defined how I see the medium.', games: ['The Witcher 3', 'Final Fantasy VII', 'Persona 5 Royal', 'Mass Effect 2', 'Elden Ring', 'Chrono Trigger', 'Final Fantasy IX', "Dragon Age: Origins", "Baldur's Gate 3", 'Skyrim'], is_public: true },
  { title: 'Games Everyone Should Play', description: 'A starter kit for anyone who wants to understand gaming as art.', games: ['Journey', 'The Last of Us', 'Portal 2', 'Hollow Knight', 'Stardew Valley', 'Outer Wilds', 'Disco Elysium'], is_public: true },
  { title: 'Best Boss Battles', description: 'Fights that made my hands shake.', games: ['Malenia — Elden Ring', 'Lady Maria — Bloodborne', 'Sephiroth — FF7 Rebirth', 'Gael — Dark Souls 3', 'Isshin — Sekiro'], is_public: true },
  { title: 'Most Underrated Games', description: 'Hidden gems that deserve way more love.', games: ['Prey (2017)', 'Control', 'Returnal', 'Hi-Fi Rush', 'Outer Wilds', 'Gravity Rush 2'], is_public: true },
  { title: 'Favorite Horror Games', description: 'The ones that genuinely scared me.', games: ['Resident Evil 4', 'Silent Hill 2', 'Dead Space', 'Alan Wake 2', 'Signalis'], is_public: true },
  { title: 'Games That Defined My Childhood', description: 'Where it all started.', games: ['Final Fantasy VII', 'The Legend of Zelda: Ocarina of Time', 'Crash Bandicoot', 'Pokémon Red', 'Jak and Daxter'], is_public: true },
];

export const FOUNDER_ACHIEVEMENTS = [
  { title: 'Platinum Trophy — Elden Ring', description: 'Earned every trophy. The Lands Between, fully conquered.', game: 'Elden Ring', platform: 'PlayStation', rarity: 'Legendary', earned_date: '2024-03-18', is_showcased: true },
  { title: 'The Dark Soul — Dark Souls', description: 'Inheritor of the soul arts, slayer of Gwyn.', game: 'Dark Souls', platform: 'PlayStation', rarity: 'Legendary', earned_date: '2012-11-02', is_showcased: true },
  { title: '100% Completion — The Witcher 3', description: 'Every contract, every gwent card, every question mark.', game: 'The Witcher 3', platform: 'PlayStation', rarity: 'Epic', earned_date: '2016-01-14', is_showcased: true },
  { title: 'Legend — Persona 5 Royal', description: 'Maxed every confidant and cleared the Velvet Room.', game: 'Persona 5 Royal', platform: 'PlayStation', rarity: 'Epic', earned_date: '2020-04-09', is_showcased: false },
  { title: 'Speedrun Badge — Hollow Knight', description: 'Beat the game in under 5 hours. Pure nail.', game: 'Hollow Knight', platform: 'Steam', rarity: 'Rare', earned_date: '2018-07-21', is_showcased: false },
  { title: 'Platinum — Bloodborne', description: 'Tonight, the hunt ends.', game: 'Bloodborne', platform: 'PlayStation', rarity: 'Legendary', earned_date: '2015-05-30', is_showcased: true },
];

export const FOUNDER_POSTS = [
  { content: 'Welcome to NexusPlay. 🎮\n\nI built this because gamers deserve a single home for everything we are — our history, our trophies, our communities, the friends we squad up with at 2am. This is your identity, not just a feed.\n\nBuild your profile. Show the world what you play. Find your people.\n\nThis is only the beginning. — Kai, Founder', type: 'text' },
  { content: "Hot take: The Witcher 3 is still the best open world ever made. Eight years later and nothing has matched its side quests. Change my mind.", type: 'text' },
  { content: 'Finally platinumed Elden Ring. Malenia took me 47 attempts. I have no regrets. 🏆', type: 'activity', activity_type: 'platinum', game_title: 'Elden Ring' },
  { content: "If you haven't played Outer Wilds yet, stop what you're doing. It's the kind of game you can only experience once. Go in blind. Thank me later.", type: 'text' },
  { content: "Question for the community: what game changed how you see gaming? For me it was Final Fantasy VII at age 10. I didn't know games could make you cry.", type: 'text' },
  { content: 'NexusPlay update: we just shipped Collections, Top 10 lists, and the Gaming Radar. Curate your taste and find people who match it. More coming soon. 🚀', type: 'text' },
];

export const FOUNDER_TOP_LISTS = [
  { title: 'Top 10 Games of All Time', category: 'games', items: ['The Witcher 3', 'Elden Ring', 'Final Fantasy VII', 'Persona 5 Royal', 'Bloodborne', 'Mass Effect 2', 'Hollow Knight', 'Journey', 'The Last of Us', 'Outer Wilds'] },
  { title: 'Best Soundtracks', category: 'soundtracks', items: ['Final Fantasy IX', 'NieR Automata', 'Persona 5', 'Bloodborne', 'Skyrim', 'Hollow Knight', 'Final Fantasy VII Rebirth'] },
  { title: 'Hardest Bosses', category: 'bosses', items: ['Malenia', 'Isshin', 'Slave Knight Gael', 'Orphan of Kos', 'Sword Saint Isshin', 'Demon of Hatred'] },
];

export const FOUNDER_MILESTONES = [
  { title: 'First Platinum', description: 'Earned my first platinum trophy in Dark Souls.', year: 2012, game: 'Dark Souls', type: 'platinum' },
  { title: '1000 Games Played', description: 'Logged my thousandth game.', year: 2020, game: 'Hades', type: 'milestone' },
  { title: 'Built NexusPlay', description: 'Launched the platform for fellow gamers.', year: 2026, game: '', type: 'milestone' },
];

// Apply founder identity to the current (admin) user.
export async function activateFounderProfile() {
  await base44.auth.updateMe({ is_founder: true, ...FOUNDER_IDENTITY });
}

// Seed all showcase content as the current (admin) user so created_by_id matches.
export async function seedFounderContent() {
  await base44.entities.Collection.bulkCreate(FOUNDER_COLLECTIONS.map((c) => ({ ...c, is_demo: true })));
  await base44.entities.Achievement.bulkCreate(FOUNDER_ACHIEVEMENTS.map((a) => ({ ...a, is_demo: true })));
  await base44.entities.Post.bulkCreate(FOUNDER_POSTS.map((p) => ({ ...p, is_demo: true })));
  await base44.entities.TopList.bulkCreate(FOUNDER_TOP_LISTS.map((t) => ({ ...t, is_demo: true })));
  await base44.entities.Timeline.bulkCreate(FOUNDER_MILESTONES.map((m) => ({ ...m, is_demo: true })));
}