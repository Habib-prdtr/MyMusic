import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Track } from '../types/music';

export type StatusUpdateCallback = (status: {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isBuffering: boolean;
  didJustFinish: boolean;
}) => void;

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentTrack: Track | null = null;
  private isConfigured = false;
  private statusCallback: StatusUpdateCallback | null = null;
  private onTrackEndedCallback: (() => void) | null = null;

  async initAudio(): Promise<void> {
    if (this.isConfigured) return;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      });
      this.isConfigured = true;
    } catch (e) {
      console.warn('Failed to configure audio mode:', e);
    }
  }

  setStatusCallback(callback: StatusUpdateCallback | null) {
    this.statusCallback = callback;
  }

  setOnTrackEndedCallback(callback: (() => void) | null) {
    this.onTrackEndedCallback = callback;
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  async playTrack(track: Track, initialPositionMillis = 0): Promise<boolean> {
    try {
      await this.initAudio();

      // If playing the same track and paused, just resume
      if (this.sound && this.currentTrack?.id === track.id) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          if (!status.isPlaying) {
            await this.sound.playAsync();
          }
          return true;
        }
      }

      // Unload previous sound if any
      await this.unloadCurrentSound();

      this.currentTrack = track;

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: true,
          positionMillis: initialPositionMillis,
          progressUpdateIntervalMillis: 250,
        },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      return true;
    } catch (e) {
      console.error('Failed to play track:', track.title, e);
      return false;
    }
  }

  async resume(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.playAsync();
    } catch (e) {
      console.warn('Error resuming audio:', e);
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
    } catch (e) {
      console.warn('Error pausing audio:', e);
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.setPositionAsync(positionMillis);
    } catch (e) {
      console.warn('Error seeking audio:', e);
    }
  }

  async stop(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
    } catch (e) {
      console.warn('Error stopping audio:', e);
    }
  }

  async unloadCurrentSound(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch {}
      try {
        await this.sound.unloadAsync();
      } catch {}
      this.sound = null;
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn(`Playback error: ${status.error}`);
      }
      return;
    }

    if (this.statusCallback) {
      this.statusCallback({
        isPlaying: status.isPlaying,
        positionMillis: status.positionMillis,
        durationMillis: status.durationMillis || (this.currentTrack ? this.currentTrack.duration * 1000 : 0),
        isBuffering: status.isBuffering,
        didJustFinish: status.didJustFinish,
      });
    }

    if (status.didJustFinish) {
      if (this.onTrackEndedCallback) {
        this.onTrackEndedCallback();
      }
    }
  };
}

export const audioService = new AudioService();
