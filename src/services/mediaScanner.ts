import {
  getAssetsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  PermissionStatus,
} from 'expo-media-library';
import { Track, SortOption, SortDirection } from '../types/music';
import { cleanSongTitle, cleanArtistName, cleanAlbumName } from '../utils/formatters';

export interface PermissionStatusResult {
  granted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus;
}

export const MediaScannerService = {
  /**
   * Check current media access permissions
   */
  async checkPermissions(): Promise<PermissionStatusResult> {
    try {
      const result = await getPermissionsAsync();
      return {
        granted: result.granted,
        canAskAgain: result.canAskAgain,
        status: result.status,
      };
    } catch (e) {
      console.warn('Error checking permissions:', e);
      return {
        granted: false,
        canAskAgain: true,
        status: PermissionStatus.UNDETERMINED,
      };
    }
  },

  /**
   * Request media access permission
   */
  async requestPermissions(): Promise<PermissionStatusResult> {
    try {
      const result = await requestPermissionsAsync();
      return {
        granted: result.granted,
        canAskAgain: result.canAskAgain,
        status: result.status,
      };
    } catch (e) {
      console.warn('Error requesting permissions:', e);
      return {
        granted: false,
        canAskAgain: false,
        status: PermissionStatus.DENIED,
      };
    }
  },

  /**
   * Scan local audio files via OS MediaStore
   */
  async scanAudioFiles(): Promise<Track[]> {
    try {
      // Query up to 10,000 audio assets
      const assets = await getAssetsAsync({
        mediaType: ['audio'],
        first: 10000,
        sortBy: [['creationTime', false]],
      });

      if (!assets || !assets.assets || assets.assets.length === 0) {
        return [];
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

      return tracks;
    } catch (e) {
      console.error('Failed to scan audio files:', e);
      return [];
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
