import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Music, Heart, MoreVertical, Volume2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { Track } from '../types/music';
import { formatDuration } from '../utils/formatters';

interface TrackItemProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onMorePress: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = memo(({
  track,
  isActive,
  isPlaying,
  isFavorite,
  onPress,
  onToggleFavorite,
  onMorePress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.artworkContainer, isActive && styles.artworkActive]}>
        {isActive ? (
          <Volume2 size={20} color={COLORS.primaryLight} />
        ) : (
          <Music size={20} color={COLORS.textSecondary} />
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {track.artist} • {formatDuration(track.duration)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onToggleFavorite}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconBtn}
        >
          <Heart
            size={18}
            color={isFavorite ? COLORS.heart : COLORS.textMuted}
            fill={isFavorite ? COLORS.heart : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onMorePress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconBtn}
        >
          <MoreVertical size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

TrackItem.displayName = 'TrackItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.md,
  },
  containerActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  artworkContainer: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artworkActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  titleActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconBtn: {
    padding: SPACING.xs,
  },
});
