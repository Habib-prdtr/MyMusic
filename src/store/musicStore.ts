import { create } from 'zustand';
import {
  Track,
  Playlist,
  RepeatMode,
  SortOption,
  SortDirection,
  PlaybackState,
  TabType,
  ArtistGroup,
  AlbumGroup,
} from '../types/music';
import { MediaScannerService } from '../services/mediaScanner';
import { audioService } from '../services/audioService';
import { StorageService } from './storage';

interface MusicStoreState {
  tracks: Track[];
  filteredTracks: Track[];
  activeTrack: Track | null;
  playbackState: PlaybackState;
  position: number; // in seconds
  duration: number; // in seconds
  isBuffering: boolean;
  
  queue: Track[];
  queueIndex: number;
  originalQueue: Track[];
  
  repeatMode: RepeatMode;
  isShuffle: boolean;
  
  favorites: string[];
  playlists: Playlist[];
  
  searchQuery: string;
  sortOption: SortOption;
  sortDirection: SortDirection;
  
  hasPermission: boolean | null;
  isLoading: boolean;
  isScanning: boolean;
  
  activeTab: TabType;
  isNowPlayingVisible: boolean;
  isQueueVisible: boolean;

  // Actions
  initialize: () => Promise<void>;
  requestPermissionAndScan: () => Promise<boolean>;
  scanLibrary: () => Promise<void>;
  importTracks: (newTracks: Track[]) => void;
  
  playTrack: (track: Track, customQueue?: Track[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  
  toggleFavorite: (trackId: string) => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  
  createPlaylist: (name: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  setSortOption: (option: SortOption, direction?: SortDirection) => void;
  setActiveTab: (tab: TabType) => void;
  setNowPlayingVisible: (visible: boolean) => void;
  setQueueVisible: (visible: boolean) => void;

  // Playlist Sequencing (Urutan Antrean Playlist Sementara)
  playlistSequence: string[];
  activeSequenceIndex: number;
  isSequenceActive: boolean;
  setPlaylistSequence: (sequence: string[]) => void;
  startPlaylistSequence: (sequence: string[], startIndex?: number) => Promise<void>;
  stopPlaylistSequence: () => void;
  getActiveSequencePlaylistName: () => string | null;

  // Computed getters
  getArtistGroups: () => ArtistGroup[];
  getAlbumGroups: () => AlbumGroup[];
  getFavoriteTracks: () => Track[];
  getPlaylistTracks: (playlistId: string) => Track[];
}

export const useMusicStore = create<MusicStoreState>((set, get) => ({
  tracks: [],
  filteredTracks: [],
  activeTrack: null,
  playbackState: 'idle',
  position: 0,
  duration: 0,
  isBuffering: false,

  queue: [],
  queueIndex: -1,
  originalQueue: [],

  repeatMode: 'off',
  isShuffle: false,

  favorites: [],
  playlists: [],

  searchQuery: '',
  sortOption: 'title',
  sortDirection: 'asc',

  hasPermission: null,
  isLoading: true,
  isScanning: false,

  activeTab: 'tracks',
  isNowPlayingVisible: false,
  isQueueVisible: false,

  playlistSequence: [],
  activeSequenceIndex: -1,
  isSequenceActive: false,

  initialize: async () => {
    // 1. Hook into AudioService callbacks
    audioService.setStatusCallback(status => {
      set({
        playbackState: status.isPlaying ? 'playing' : (status.positionMillis > 0 ? 'paused' : 'idle'),
        position: status.positionMillis / 1000,
        duration: status.durationMillis > 0 ? status.durationMillis / 1000 : get().duration,
        isBuffering: status.isBuffering,
      });
    });

    audioService.setOnTrackEndedCallback(() => {
      const { repeatMode } = get();
      if (repeatMode === 'one') {
        const active = get().activeTrack;
        if (active) {
          audioService.playTrack(active, 0);
        }
      } else {
        get().playNext();
      }
    });

    // 2. Load stored favorites, playlists, and preferences
    try {
      const [favs, lists, prefs] = await Promise.all([
        StorageService.getFavorites(),
        StorageService.getPlaylists(),
        StorageService.getPlayerPrefs(),
      ]);

      set({
        favorites: favs,
        playlists: lists,
        repeatMode: prefs ? prefs.repeatMode : 'off',
        isShuffle: prefs ? prefs.isShuffle : false,
      });
    } catch (e) {
      console.warn('Error loading cached data', e);
    }

    // 3. Check permission status
    const perm = await MediaScannerService.checkPermissions();
    set({ hasPermission: perm.granted, isLoading: false });

    if (perm.granted) {
      await get().scanLibrary();
    }
  },

  requestPermissionAndScan: async () => {
    const result = await MediaScannerService.requestPermissions();
    set({ hasPermission: result.granted });
    if (result.granted) {
      await get().scanLibrary();
      return true;
    }
    return false;
  },

  scanLibrary: async () => {
    set({ isScanning: true });
    try {
      const scanned = await MediaScannerService.scanAudioFiles();
      const { sortOption, sortDirection, searchQuery } = get();
      const sorted = MediaScannerService.sortTracks(scanned, sortOption, sortDirection);

      const filtered = filterTracks(sorted, searchQuery);

      set({
        tracks: sorted,
        filteredTracks: filtered,
        isScanning: false,
      });
    } catch (e) {
      console.error('Scan error:', e);
      set({ isScanning: false });
    }
  },

  importTracks: (newTracks: Track[]) => {
    if (!newTracks || newTracks.length === 0) return;
    const existing = get().tracks;
    const existingIds = new Set(existing.map(t => t.id));
    const toAdd = newTracks.filter(t => !existingIds.has(t.id));
    if (toAdd.length === 0) return;

    const merged = [...toAdd, ...existing];
    const { sortOption, sortDirection, searchQuery } = get();
    const sorted = MediaScannerService.sortTracks(merged, sortOption, sortDirection);
    const filtered = filterTracks(sorted, searchQuery);

    set({
      tracks: sorted,
      filteredTracks: filtered,
    });
  },

  playTrack: async (track: Track, customQueue?: Track[]) => {
    const state = get();
    let currentQueue = customQueue || (state.queue.length > 0 ? state.queue : state.tracks);

    // If queue doesn't contain this track, build a new queue
    if (!customQueue && !currentQueue.some(t => t.id === track.id)) {
      currentQueue = state.tracks;
    }

    let targetQueue = [...currentQueue];
    if (state.isShuffle && !customQueue) {
      // Keep selected track at front, shuffle rest
      const others = currentQueue.filter(t => t.id !== track.id);
      targetQueue = [track, ...shuffleArray(others)];
    }

    const idx = targetQueue.findIndex(t => t.id === track.id);

    set({
      activeTrack: track,
      queue: targetQueue,
      originalQueue: currentQueue,
      queueIndex: idx >= 0 ? idx : 0,
      playbackState: 'playing',
      position: 0,
      duration: track.duration,
    });

    await audioService.playTrack(track);

    // Update recently played
    StorageService.getRecentlyPlayed().then(recents => {
      const updated = [track.id, ...recents.filter(id => id !== track.id)];
      StorageService.saveRecentlyPlayed(updated);
    });
  },

  togglePlayPause: async () => {
    const { playbackState, activeTrack, tracks } = get();
    if (!activeTrack) {
      if (tracks.length > 0) {
        await get().playTrack(tracks[0]);
      }
      return;
    }

    if (playbackState === 'playing') {
      await audioService.pause();
      set({ playbackState: 'paused' });
    } else {
      await audioService.resume();
      set({ playbackState: 'playing' });
    }
  },

  playNext: async () => {
    const {
      queue,
      queueIndex,
      repeatMode,
      isSequenceActive,
      playlistSequence,
      activeSequenceIndex,
    } = get();
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      // If temporary sequential playlist mode is active
      if (isSequenceActive && playlistSequence.length > 0) {
        let nextSeq = activeSequenceIndex + 1;
        while (nextSeq < playlistSequence.length) {
          const nextPlId = playlistSequence[nextSeq];
          const nextTracks =
            nextPlId === 'favorites'
              ? get().getFavoriteTracks()
              : get().getPlaylistTracks(nextPlId);

          if (nextTracks.length > 0) {
            set({ activeSequenceIndex: nextSeq });
            await get().playTrack(nextTracks[0], nextTracks);
            return;
          }
          nextSeq++;
        }

        // Sequence reached the end
        if (repeatMode === 'all') {
          // Loop entire sequence
          await get().startPlaylistSequence(playlistSequence, 0);
          return;
        } else {
          await audioService.stop();
          set({
            playbackState: 'idle',
            position: 0,
            isSequenceActive: false,
            activeSequenceIndex: -1,
          });
          return;
        }
      }

      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Queue finished
        await audioService.stop();
        set({ playbackState: 'idle', position: 0 });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({
        activeTrack: nextTrack,
        queueIndex: nextIndex,
        position: 0,
        duration: nextTrack.duration,
        playbackState: 'playing',
      });
      await audioService.playTrack(nextTrack);
    }
  },

  playPrevious: async () => {
    const {
      queue,
      queueIndex,
      position,
      isSequenceActive,
      playlistSequence,
      activeSequenceIndex,
    } = get();
    if (queue.length === 0) return;

    // If playback is more than 3 seconds in, restart track
    if (position > 3) {
      await audioService.seekTo(0);
      set({ position: 0 });
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (isSequenceActive && playlistSequence.length > 0 && activeSequenceIndex > 0) {
        let prevSeq = activeSequenceIndex - 1;
        while (prevSeq >= 0) {
          const prevPlId = playlistSequence[prevSeq];
          const prevTracks =
            prevPlId === 'favorites'
              ? get().getFavoriteTracks()
              : get().getPlaylistTracks(prevPlId);

          if (prevTracks.length > 0) {
            set({ activeSequenceIndex: prevSeq });
            const lastTrack = prevTracks[prevTracks.length - 1];
            await get().playTrack(lastTrack, prevTracks);
            return;
          }
          prevSeq--;
        }
      }

      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      set({
        activeTrack: prevTrack,
        queueIndex: prevIndex,
        position: 0,
        duration: prevTrack.duration,
        playbackState: 'playing',
      });
      await audioService.playTrack(prevTrack);
    }
  },

  seekTo: async (seconds: number) => {
    set({ position: seconds });
    await audioService.seekTo(seconds * 1000);
  },

  setRepeatMode: (mode: RepeatMode) => {
    set({ repeatMode: mode });
    StorageService.savePlayerPrefs({
      repeatMode: mode,
      isShuffle: get().isShuffle,
    });
  },

  cycleRepeatMode: () => {
    const { repeatMode } = get();
    const nextMode: RepeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    get().setRepeatMode(nextMode);
  },

  toggleShuffle: () => {
    const { isShuffle, queue, activeTrack, originalQueue } = get();
    const newShuffle = !isShuffle;

    let newQueue: Track[];
    if (newShuffle) {
      const source = originalQueue.length > 0 ? originalQueue : queue;
      if (activeTrack) {
        const others = source.filter(t => t.id !== activeTrack.id);
        newQueue = [activeTrack, ...shuffleArray(others)];
      } else {
        newQueue = shuffleArray(source);
      }
    } else {
      newQueue = originalQueue.length > 0 ? [...originalQueue] : [...queue];
    }

    const newIdx = activeTrack ? newQueue.findIndex(t => t.id === activeTrack.id) : 0;

    set({
      isShuffle: newShuffle,
      queue: newQueue,
      queueIndex: newIdx >= 0 ? newIdx : 0,
    });

    StorageService.savePlayerPrefs({
      repeatMode: get().repeatMode,
      isShuffle: newShuffle,
    });
  },

  toggleFavorite: async (trackId: string) => {
    const { favorites } = get();
    const exists = favorites.includes(trackId);
    const updated = exists ? favorites.filter(id => id !== trackId) : [...favorites, trackId];
    set({ favorites: updated });
    await StorageService.saveFavorites(updated);
  },

  isFavorite: (trackId: string) => {
    return get().favorites.includes(trackId);
  },

  createPlaylist: async (name: string) => {
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Untitled Playlist',
      createdAt: Date.now(),
      trackIds: [],
    };
    const updated = [newPlaylist, ...get().playlists];
    set({ playlists: updated });
    await StorageService.savePlaylists(updated);
    return newPlaylist;
  },

  deletePlaylist: async (playlistId: string) => {
    const updated = get().playlists.filter(pl => pl.id !== playlistId);
    set({ playlists: updated });
    await StorageService.savePlaylists(updated);
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    const updated = get().playlists.map(pl => {
      if (pl.id === playlistId) {
        if (!pl.trackIds.includes(trackId)) {
          return { ...pl, trackIds: [...pl.trackIds, trackId] };
        }
      }
      return pl;
    });
    set({ playlists: updated });
    await StorageService.savePlaylists(updated);
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    const updated = get().playlists.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, trackIds: pl.trackIds.filter(id => id !== trackId) };
      }
      return pl;
    });
    set({ playlists: updated });
    await StorageService.savePlaylists(updated);
  },

  setSearchQuery: (query: string) => {
    const { tracks } = get();
    const filtered = filterTracks(tracks, query);
    set({ searchQuery: query, filteredTracks: filtered });
  },

  setSortOption: (option: SortOption, direction?: SortDirection) => {
    const { tracks, sortDirection: currentDir, searchQuery } = get();
    const dir = direction || (get().sortOption === option && currentDir === 'asc' ? 'desc' : 'asc');
    const sorted = MediaScannerService.sortTracks(tracks, option, dir);
    const filtered = filterTracks(sorted, searchQuery);

    set({
      sortOption: option,
      sortDirection: dir,
      tracks: sorted,
      filteredTracks: filtered,
    });
  },

  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  setNowPlayingVisible: (visible: boolean) => set({ isNowPlayingVisible: visible }),
  setQueueVisible: (visible: boolean) => set({ isQueueVisible: visible }),

  setPlaylistSequence: (sequence: string[]) => {
    set({ playlistSequence: sequence });
  },

  startPlaylistSequence: async (sequence: string[], startIndex = 0) => {
    if (!sequence || sequence.length === 0) return;
    const targetIndex = Math.min(Math.max(0, startIndex), sequence.length - 1);

    let foundIndex = -1;
    let foundTracks: Track[] = [];

    for (let i = targetIndex; i < sequence.length; i++) {
      const plId = sequence[i];
      const tracks =
        plId === 'favorites'
          ? get().getFavoriteTracks()
          : get().getPlaylistTracks(plId);

      if (tracks.length > 0) {
        foundIndex = i;
        foundTracks = tracks;
        break;
      }
    }

    if (foundIndex === -1 || foundTracks.length === 0) {
      return;
    }

    set({
      playlistSequence: sequence,
      activeSequenceIndex: foundIndex,
      isSequenceActive: true,
    });

    await get().playTrack(foundTracks[0], foundTracks);
  },

  stopPlaylistSequence: () => {
    set({
      isSequenceActive: false,
      activeSequenceIndex: -1,
    });
  },

  getActiveSequencePlaylistName: () => {
    const { isSequenceActive, activeSequenceIndex, playlistSequence, playlists } = get();
    if (!isSequenceActive || activeSequenceIndex < 0 || activeSequenceIndex >= playlistSequence.length) {
      return null;
    }
    const currentId = playlistSequence[activeSequenceIndex];
    if (currentId === 'favorites') {
      return 'Favorite Songs';
    }
    const pl = playlists.find(p => p.id === currentId);
    return pl ? pl.name : 'Playlist';
  },

  getArtistGroups: () => {
    const { tracks } = get();
    const map = new Map<string, Track[]>();

    for (const t of tracks) {
      const art = t.artist || 'Unknown Artist';
      const existing = map.get(art) || [];
      existing.push(t);
      map.set(art, existing);
    }

    const groups: ArtistGroup[] = [];
    map.forEach((trks, artist) => {
      groups.push({
        artist,
        tracks: trks,
        trackCount: trks.length,
      });
    });

    return groups.sort((a, b) => a.artist.localeCompare(b.artist));
  },

  getAlbumGroups: () => {
    const { tracks } = get();
    const map = new Map<string, Track[]>();

    for (const t of tracks) {
      const alb = t.album || 'Unknown Album';
      const existing = map.get(alb) || [];
      existing.push(t);
      map.set(alb, existing);
    }

    const groups: AlbumGroup[] = [];
    map.forEach((trks, album) => {
      groups.push({
        album,
        artist: trks[0]?.artist || 'Unknown Artist',
        artworkUri: trks[0]?.artworkUri,
        tracks: trks,
        trackCount: trks.length,
      });
    });

    return groups.sort((a, b) => a.album.localeCompare(b.album));
  },

  getFavoriteTracks: () => {
    const { tracks, favorites } = get();
    const favSet = new Set(favorites);
    return tracks.filter(t => favSet.has(t.id));
  },

  getPlaylistTracks: (playlistId: string) => {
    const { tracks, playlists } = get();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return [];
    const idMap = new Map(tracks.map(t => [t.id, t]));
    return pl.trackIds.map(id => idMap.get(id)).filter((t): t is Track => !!t);
  },
}));

function filterTracks(tracks: Track[], query: string): Track[] {
  if (!query || query.trim() === '') return tracks;
  const q = query.toLowerCase().trim();
  return tracks.filter(
    t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q)
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
