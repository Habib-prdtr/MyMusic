import { Platform } from 'react-native';
import {
  getAssetsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  PermissionStatus,
} from 'expo-media-library/legacy';
import { Directory, File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Track, SortOption, SortDirection } from '../types/music';
import { cleanSongTitle, cleanArtistName, cleanAlbumName } from '../utils/formatters';

export interface PermissionStatusResult {
  granted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus;
}

const DEMO_OFFLINE_TRACKS: Track[] = [
  {
    id: 'demo_1',
    title: 'Neon Dream',
    artist: 'The Midnight Echo',
    album: 'Synthwave Odyssey',
    duration: 184,
    uri: Platform.OS === 'web'
      ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      : 'file:///sdcard/Music/The Midnight Echo - Neon Dream.wav',
    artworkUri: undefined,
    dateAdded: Date.now() - 10000,
    filename: 'The Midnight Echo - Neon Dream.mp3',
  },
  {
    id: 'demo_2',
    title: 'Cyber City',
    artist: 'Aurora Skyline',
    album: 'Retro Future',
    duration: 212,
    uri: Platform.OS === 'web'
      ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      : 'file:///sdcard/Music/Aurora Skyline - Cyber City.wav',
    artworkUri: undefined,
    dateAdded: Date.now() - 5000,
    filename: 'Aurora Skyline - Cyber City.mp3',
  },
  {
    id: 'demo_3',
    title: 'Synthwave Odyssey',
    artist: 'Pulse Soundscape',
    album: 'Deep Space',
    duration: 372,
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artworkUri: undefined,
    dateAdded: Date.now() - 2000,
    filename: 'Pulse Soundscape - Synthwave Odyssey.mp3',
  },
];

export const MediaScannerService = {
  /**
   * Check current media access permissions
   */
  async checkPermissions(): Promise<PermissionStatusResult> {
    if (Platform.OS === 'web') {
      return {
        granted: true,
        canAskAgain: false,
        status: PermissionStatus.GRANTED,
      };
    }

    try {
      const result = await getPermissionsAsync(false);
      const granted = result.granted || result.status === PermissionStatus.GRANTED || (result as any).accessPrivileges === 'all';
      return {
        granted,
        canAskAgain: result.canAskAgain,
        status: result.status,
      };
    } catch (e) {
      console.warn('Error checking permissions (fallback to true for Expo Go):', e);
      return {
        granted: true,
        canAskAgain: false,
        status: PermissionStatus.GRANTED,
      };
    }
  },

  /**
   * Request media access permission
   */
  async requestPermissions(): Promise<PermissionStatusResult> {
    if (Platform.OS === 'web') {
      return {
        granted: true,
        canAskAgain: false,
        status: PermissionStatus.GRANTED,
      };
    }

    try {
      const result = await requestPermissionsAsync(false);
      const granted = result.granted || result.status === PermissionStatus.GRANTED || (result as any).accessPrivileges === 'all';
      return {
        granted,
        canAskAgain: result.canAskAgain,
        status: result.status,
      };
    } catch (e) {
      console.warn('Error requesting permissions (fallback to true for Expo Go):', e);
      return {
        granted: true,
        canAskAgain: false,
        status: PermissionStatus.GRANTED,
      };
    }
  },

  /**
   * Pick local audio files from device/computer via file picker
   */
  async pickAudioFiles(): Promise<Track[]> {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets) return [];

      const tracks: Track[] = [];
      for (const asset of res.assets) {
        const { parsedTitle, parsedArtist } = this.parseFilenameMetadata(asset.name);
        tracks.push({
          id: `picked_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: cleanSongTitle(parsedTitle, asset.name),
          artist: cleanArtistName(parsedArtist),
          album: cleanAlbumName('Imported Tracks'),
          duration: 180,
          uri: asset.uri,
          artworkUri: undefined,
          dateAdded: Date.now(),
          filename: asset.name,
        });
      }
      return tracks;
    } catch (e) {
      console.warn('Error picking audio files:', e);
      return [];
    }
  },

  /**
   * Fallback scanner for filesystem or starter tracks when MediaStore is unavailable
   */
  async scanFileSystemFallback(): Promise<Track[]> {
    if (Platform.OS === 'web') {
      return DEMO_OFFLINE_TRACKS;
    }

    const validExtensions = ['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg'];
    const foundTracks: Track[] = [];

    const candidatePaths = [
      'file:///sdcard/Music',
      'file:///sdcard/Download',
      Paths.document?.uri,
      Paths.cache?.uri,
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      try {
        const dir = new Directory(p);
        if (dir.exists) {
          const items = dir.list();
          for (const item of items) {
            if (item instanceof File) {
              const lower = item.name.toLowerCase();
              if (validExtensions.some(ext => lower.endsWith(ext))) {
                const { parsedTitle, parsedArtist } = this.parseFilenameMetadata(item.name);
                foundTracks.push({
                  id: `fs_${item.uri}`,
                  title: cleanSongTitle(parsedTitle, item.name),
                  artist: cleanArtistName(parsedArtist),
                  album: cleanAlbumName('Device Storage'),
                  duration: 180,
                  uri: item.uri,
                  artworkUri: undefined,
                  dateAdded: Date.now(),
                  filename: item.name,
                });
              }
            }
          }
        }
      } catch {
        // Ignore directory read errors
      }
    }

    if (foundTracks.length > 0) {
      return foundTracks;
    }

    return DEMO_OFFLINE_TRACKS;
  },

  /**
   * Scan local audio files via OS MediaStore
   */
  async scanAudioFiles(): Promise<Track[]> {
    if (Platform.OS === 'web') {
      return DEMO_OFFLINE_TRACKS;
    }

    try {
      // Query up to 10,000 audio assets
      const assets = await getAssetsAsync({
        mediaType: ['audio'],
        first: 10000,
        sortBy: [['creationTime', false]],
      });

      if (!assets || !assets.assets || assets.assets.length === 0) {
        return await this.scanFileSystemFallback();
      }

      const validExtensions = ['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg'];
      const tracks: Track[] = [];

      for (const asset of assets.assets) {
        const filename = asset.filename || '';
        const lowerName = filename.toLowerCase();
        const hasValidExt = validExtensions.some(ext => lowerName.endsWith(ext));

        // Skip non-audio extensions if any
        if (!hasValidExt) continue;

        // Skip very short sounds (ringtones, notification tones < 10 seconds)
        const durationSec = Math.round(asset.duration || 0);
        if (durationSec > 0 && durationSec < 10) continue;

        // Smart title & artist metadata parsing from filename if ID3 isn't loaded
        const { parsedTitle, parsedArtist } = this.parseFilenameMetadata(filename);

        tracks.push({
          id: asset.id,
          title: cleanSongTitle(parsedTitle, filename),
          artist: cleanArtistName(parsedArtist),
          album: cleanAlbumName(asset.albumId || 'Local Storage'),
          duration: durationSec,
          uri: asset.uri,
          artworkUri: undefined,
          dateAdded: asset.creationTime || Date.now(),
          filename: filename,
        });
      }

      if (tracks.length === 0) {
        return await this.scanFileSystemFallback();
      }

      return tracks;
    } catch (e) {
      console.warn('MediaStore scan failed, trying filesystem fallback:', e);
      return await this.scanFileSystemFallback();
    }
  },

  /**
   * Parses artist and title from standard filename patterns:
   * "Artist - Title.mp3"
   * "01 - Artist - Title.mp3"
   * "Artist _ Title.mp3"
   */
  parseFilenameMetadata(filename: string): { parsedTitle: string; parsedArtist: string } {
    // Strip extension
    const base = filename.replace(/\.[^/.]+$/, '').trim();
    // Strip leading track numbers like "01. ", "01 - ", "(1) "
    const cleaned = base.replace(/^\(?\d+\)?[\s.-]+/, '');

    if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ');
      if (parts.length >= 2) {
        return {
          parsedArtist: parts[0].trim(),
          parsedTitle: parts.slice(1).join(' - ').trim(),
        };
      }
    }

    if (cleaned.includes(' – ')) {
      const parts = cleaned.split(' – ');
      if (parts.length >= 2) {
        return {
          parsedArtist: parts[0].trim(),
          parsedTitle: parts.slice(1).join(' – ').trim(),
        };
      }
    }

    return {
      parsedTitle: cleaned,
      parsedArtist: 'Unknown Artist',
    };
  },

  /**
   * Sort tracks according to user preference
   */
  sortTracks(tracks: Track[], option: SortOption, direction: SortDirection = 'asc'): Track[] {
    const sorted = [...tracks];
    const modifier = direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (option) {
        case 'title':
          return modifier * a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        case 'artist':
          return modifier * a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });
        case 'dateAdded':
          return modifier * ((a.dateAdded || 0) - (b.dateAdded || 0));
        case 'duration':
          return modifier * (a.duration - b.duration);
        default:
          return 0;
      }
    });

    return sorted;
  },
};
