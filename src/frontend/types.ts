export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  lyrics?: LyricLine[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year: number;
  description: string;
  tracks: string[]; // Track IDs
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  coverUrl?: string;
  isCustom: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type ThemeId = 'midnight' | 'nebula' | 'sunset' | 'ocean';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    primary: string;
    accent: string;
  };
}

export enum ViewState {
  HOME,
  SEARCH,
  LIBRARY,
  ALBUM_DETAIL,
  LYRICS
}
