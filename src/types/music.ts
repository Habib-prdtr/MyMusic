export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  uri: string;
  artworkUri?: string;
  dateAdded?: number;
  size?: number;
  filename: string;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  trackIds: string[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export type SortOption = 'title' | 'artist' | 'dateAdded' | 'duration';
export type SortDirection = 'asc' | 'desc';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'buffering';

export type TabType = 'tracks' | 'artists' | 'albums' | 'playlists';

export interface ArtistGroup {
  artist: string;
  tracks: Track[];
  trackCount: number;
}

export interface AlbumGroup {
  album: string;
  artist: string;
  artworkUri?: string;
  tracks: Track[];
  trackCount: number;
}
