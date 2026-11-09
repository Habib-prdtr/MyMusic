import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, RepeatMode } from '../types/music';

const STORAGE_KEYS = {
  FAVORITES: 'pulsemusic_favorites_v1',
  PLAYLISTS: 'pulsemusic_playlists_v1',
  PLAYER_PREFS: 'pulsemusic_prefs_v1',
  LAST_PLAYED: 'pulsemusic_last_played_v1',
  RECENTLY_PLAYED: 'pulsemusic_recents_v1',
};

export interface PlayerPreferences {
  repeatMode: RepeatMode;
  isShuffle: boolean;
}

export const StorageService = {
  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveFavorites(favorites: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to storage', e);
    }
  },

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists to storage', e);
    }
  },

  async getPlayerPrefs(): Promise<PlayerPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_PREFS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async savePlayerPrefs(prefs: PlayerPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_PREFS, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save player prefs', e);
    }
  },

  async getRecentlyPlayed(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveRecentlyPlayed(trackIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(trackIds.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save recents', e);
    }
  },
};
