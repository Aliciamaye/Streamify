import { Album, Playlist, Track } from './types';

export const MOCK_LYRICS_1 = [
  { time: 0, text: "Instrumental Intro..." },
  { time: 5, text: "Yeah, we're streaming now" },
  { time: 10, text: "Feel the digital flow" },
  { time: 15, text: "Pixels on the screen" },
  { time: 20, text: "Living in a dream" },
  { time: 25, text: "(Music intensifies)" },
  { time: 35, text: "Don't stop the music" },
  { time: 40, text: "Let the rhythm take control" },
];

export const TRACKS: Record<string, Track> = {
  't1': {
    id: 't1',
    title: 'Neon Horizon',
    artist: 'Cyber Dreams',
    album: 'Digital Sunset',
    duration: 210,
    coverUrl: 'https://picsum.photos/id/10/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: MOCK_LYRICS_1
  },
  't2': {
    id: 't2',
    title: 'Midnight Drive',
    artist: 'Cyber Dreams',
    album: 'Digital Sunset',
    duration: 185,
    coverUrl: 'https://picsum.photos/id/10/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: MOCK_LYRICS_1
  },
  't3': {
    id: 't3',
    title: 'Deep Focus',
    artist: 'Mindful State',
    album: 'Flow',
    duration: 240,
    coverUrl: 'https://picsum.photos/id/11/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  't4': {
    id: 't4',
    title: 'Morning Coffee',
    artist: 'Acoustic Soul',
    album: 'Sunday Vibes',
    duration: 160,
    coverUrl: 'https://picsum.photos/id/12/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  't5': {
    id: 't5',
    title: 'Urban Jungle',
    artist: 'City Beats',
    album: 'Metro',
    duration: 195,
    coverUrl: 'https://picsum.photos/id/13/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  't6': {
    id: 't6',
    title: 'Rainy Day',
    artist: 'LoFi Study',
    album: 'Chillhop Essentials',
    duration: 200,
    coverUrl: 'https://picsum.photos/id/14/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  }
};

export const ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Digital Sunset',
    artist: 'Cyber Dreams',
    year: 2024,
    coverUrl: 'https://picsum.photos/id/10/400/400',
    description: 'A journey through synthwave landscapes and neon lights.',
    tracks: ['t1', 't2']
  },
  {
    id: 'a2',
    title: 'Flow',
    artist: 'Mindful State',
    year: 2023,
    coverUrl: 'https://picsum.photos/id/11/400/400',
    description: 'Perfect beats for deep work and concentration.',
    tracks: ['t3']
  },
  {
    id: 'a3',
    title: 'Sunday Vibes',
    artist: 'Acoustic Soul',
    year: 2022,
    coverUrl: 'https://picsum.photos/id/12/400/400',
    description: 'Relaxing acoustic melodies for lazy weekends.',
    tracks: ['t4']
  },
  {
    id: 'a4',
    title: 'Metro',
    artist: 'City Beats',
    year: 2024,
    coverUrl: 'https://picsum.photos/id/13/400/400',
    description: 'The rhythm of the city that never sleeps.',
    tracks: ['t5']
  },
  {
    id: 'a5',
    title: 'Chillhop Essentials',
    artist: 'LoFi Study',
    year: 2023,
    coverUrl: 'https://picsum.photos/id/14/400/400',
    description: 'Beats to study and relax to.',
    tracks: ['t6']
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'My Favorites',
    trackIds: ['t1', 't3', 't6'],
    isCustom: true
  },
  {
    id: 'p2',
    name: 'Late Night Coding',
    trackIds: ['t2', 't5'],
    isCustom: true
  }
];
