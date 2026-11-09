import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Play, Pause, SkipForward, Disc3 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';

export const MiniPlayer: React.FC = () => {
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playbackState = useMusicStore(s => s.playbackState);
  const position = useMusicStore(s => s.position);
  const duration = useMusicStore(s => s.duration);
  const togglePlayPause = useMusicStore(s => s.togglePlayPause);
  const playNext = useMusicStore(s => s.playNext);
  const setNowPlayingVisible = useMusicStore(s => s.setNowPlayingVisible);

  if (!activeTrack) return null;

  const isPlaying = playbackState === 'playing';
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  return (
    <View style={styles.outerContainer}>
      <Pressable
        style={styles.container}
        onPress={() => setNowPlayingVisible(true)}
      >
        {/* Progress bar line at top */}
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.contentRow}>
          {/* Artwork / Icon thumbnail */}
          <View style={styles.artwork}>
            <Disc3 size={24} color={COLORS.primaryLight} />
          </View>

          {/* Title & Artist */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {activeTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {activeTrack.artist}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                togglePlayPause();
              }}
              style={styles.playBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPlaying ? (
                <Pause size={20} color="#FFF" fill="#FFF" />
              ) : (
                <Play size={20} color="#FFF" fill="#FFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                playNext();
              }}
              style={styles.nextBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SkipForward size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: COLORS.miniPlayerBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  progressBarBackground: {
    height: 2.5,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardActive,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    padding: SPACING.xs,
  },
});
