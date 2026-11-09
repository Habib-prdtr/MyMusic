import { createAudioPlayer, AudioModule, AudioPlayer } from 'expo-audio';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Track } from '../types/music';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo';

export type StatusUpdateCallback = (status: {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  isBuffering: boolean;
  didJustFinish: boolean;
}) => void;

class AudioService {
  private player: AudioPlayer | null = null;
  private currentTrack: Track | null = null;
  private isConfigured = false;
  private statusCallback: StatusUpdateCallback | null = null;
  private onTrackEndedCallback: (() => void) | null = null;
  private statusSubscription: { remove: () => void } | null = null;

  async initAudio(): Promise<void> {
    if (this.isConfigured) return;
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
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

  async playTrack(track: Track, initialPositionSeconds = 0): Promise<boolean> {
    try {
      await this.initAudio();

      // If playing the same track and paused, just resume
      if (this.player && this.currentTrack?.id === track.id) {
        if (!this.player.playing) {
          this.player.play();
        }
        return true;
      }

      // Clean up previous player
      await this.unloadCurrentSound();

      this.currentTrack = track;

      // Create new player with expo-audio
      const player = createAudioPlayer(track.uri, {
        updateInterval: 250,
      });

      this.player = player;

      // Setup lock screen controls & notification metadata (FR-4) for standalone / dev builds
      if (!isExpoGo) {
        try {
          const lockScreenPromise = (player as any).setActiveForLockScreen?.(true, {
            title: track.title,
            artist: track.artist,
            albumTitle: track.album,
          });
          if (lockScreenPromise && typeof lockScreenPromise.catch === 'function') {
            lockScreenPromise.catch(() => {});
          }
        } catch {
          // Ignored if unavailable
        }
      }

      // Attach playbackStatusUpdate listener
      this.statusSubscription = player.addListener('playbackStatusUpdate', status => {
        const isPlaying = status.playing;
        const positionMillis = Math.round(status.currentTime * 1000);
        const durationMillis = status.duration > 0
          ? Math.round(status.duration * 1000)
          : track.duration * 1000;

        if (this.statusCallback) {
          this.statusCallback({
            isPlaying,
            positionMillis,
            durationMillis,
            isBuffering: status.isBuffering ?? false,
            didJustFinish: status.didJustFinish ?? false,
          });
        }

        if (status.didJustFinish) {
          if (this.onTrackEndedCallback) {
            this.onTrackEndedCallback();
          }
        }
      });

      if (initialPositionSeconds > 0) {
        await player.seekTo(initialPositionSeconds);
      }

      player.play();
      return true;
    } catch (e) {
      console.error('Failed to play track:', track.title, e);
      return false;
    }
  }

  async resume(): Promise<void> {
    if (!this.player) return;
    try {
      this.player.play();
    } catch (e) {
      console.warn('Error resuming audio:', e);
    }
  }

  async pause(): Promise<void> {
    if (!this.player) return;
    try {
      this.player.pause();
    } catch (e) {
      console.warn('Error pausing audio:', e);
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (!this.player) return;
    try {
      await this.player.seekTo(positionMillis / 1000);
    } catch (e) {
      console.warn('Error seeking audio:', e);
    }
  }

  async stop(): Promise<void> {
    if (!this.player) return;
    try {
      this.player.pause();
      await this.player.seekTo(0);
    } catch (e) {
      console.warn('Error stopping audio:', e);
    }
  }

  async unloadCurrentSound(): Promise<void> {
    if (this.statusSubscription) {
      this.statusSubscription.remove();
      this.statusSubscription = null;
    }
    if (this.player) {
      try {
        this.player.pause();
        this.player.remove();
      } catch {}
      this.player = null;
    }
  }
}

export const audioService = new AudioService();
