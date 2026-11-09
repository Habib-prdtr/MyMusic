import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {
  ChevronDown,
  ListMusic,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  FolderPlus,
  Disc3,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';
import { formatDuration } from '../utils/formatters';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(width - 64, 320);

interface NowPlayingModalProps {
  onOpenAddToPlaylist: () => void;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  onOpenAddToPlaylist,
}) => {
  const isNowPlayingVisible = useMusicStore(s => s.isNowPlayingVisible);
  const setNowPlayingVisible = useMusicStore(s => s.setNowPlayingVisible);
  const setQueueVisible = useMusicStore(s => s.setQueueVisible);
  
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playbackState = useMusicStore(s => s.playbackState);
  const position = useMusicStore(s => s.position);
  const duration = useMusicStore(s => s.duration);
  const isShuffle = useMusicStore(s => s.isShuffle);
  const repeatMode = useMusicStore(s => s.repeatMode);
  
  const togglePlayPause = useMusicStore(s => s.togglePlayPause);
  const playNext = useMusicStore(s => s.playNext);
  const playPrevious = useMusicStore(s => s.playPrevious);
  const seekTo = useMusicStore(s => s.seekTo);
  const toggleShuffle = useMusicStore(s => s.toggleShuffle);
  const cycleRepeatMode = useMusicStore(s => s.cycleRepeatMode);
  const toggleFavorite = useMusicStore(s => s.toggleFavorite);
  const isFavorite = useMusicStore(s => (activeTrack ? s.isFavorite(activeTrack.id) : false));

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPos, setSeekPos] = useState(0);

  if (!activeTrack) return null;

  const isPlaying = playbackState === 'playing';
  const displayPosition = isSeeking ? seekPos : position;

  return (
    <Modal
      visible={isNowPlayingVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setNowPlayingVisible(false)}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setNowPlayingVisible(false)}
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronDown size={28} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={styles.topLabel}>PLAYING FROM STORAGE</Text>
            <Text style={styles.topAlbum} numberOfLines={1}>
              {activeTrack.album}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setQueueVisible(true)}
            style={styles.iconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ListMusic size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Artwork Card */}
        <View style={styles.artworkSection}>
          <View style={styles.artworkCard}>
            <View style={styles.vinylDisc}>
              <View style={styles.vinylGrooves}>
                <Disc3 size={84} color={COLORS.primaryLight} />
              </View>
            </View>
          </View>
        </View>

        {/* Track Info & Favorite Heart */}
        <View style={styles.trackInfoSection}>
          <View style={styles.metaBox}>
            <Text style={styles.title} numberOfLines={1}>
              {activeTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {activeTrack.artist}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleFavorite(activeTrack.id)}
            style={styles.favoriteBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Heart
              size={26}
              color={isFavorite ? COLORS.heart : COLORS.textSecondary}
              fill={isFavorite ? COLORS.heart : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Seeker */}
        <View style={styles.seekerSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={displayPosition}
            minimumTrackTintColor={COLORS.primaryLight}
            maximumTrackTintColor={COLORS.borderLight}
            thumbTintColor={COLORS.text}
            onValueChange={val => {
              setIsSeeking(true);
              setSeekPos(val);
            }}
            onSlidingComplete={val => {
              seekTo(val);
              setIsSeeking(false);
            }}
          />

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(displayPosition)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Shuffle Button */}
          <TouchableOpacity
            onPress={toggleShuffle}
            style={[styles.smallCtrlBtn, isShuffle && styles.activeCtrlBtn]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Shuffle
              size={22}
              color={isShuffle ? COLORS.primaryLight : COLORS.textMuted}
            />
          </TouchableOpacity>

          {/* Previous Track */}
          <TouchableOpacity
            onPress={playPrevious}
            style={styles.mediumCtrlBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SkipBack size={28} color={COLORS.text} fill={COLORS.text} />
          </TouchableOpacity>

          {/* Large Hero Play / Pause */}
          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.heroPlayBtn}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause size={32} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={32} color="#FFF" fill="#FFF" style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>

          {/* Next Track */}
          <TouchableOpacity
            onPress={playNext}
            style={styles.mediumCtrlBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SkipForward size={28} color={COLORS.text} fill={COLORS.text} />
          </TouchableOpacity>

          {/* Repeat Button */}
          <TouchableOpacity
            onPress={cycleRepeatMode}
            style={[styles.smallCtrlBtn, repeatMode !== 'off' && styles.activeCtrlBtn]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={22} color={COLORS.primaryLight} />
            ) : (
              <Repeat
                size={22}
                color={repeatMode === 'all' ? COLORS.primaryLight : COLORS.textMuted}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Options: Add to playlist */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.addPlaylistBtn}
            onPress={() => {
              setNowPlayingVisible(false);
              onOpenAddToPlaylist();
            }}
          >
            <FolderPlus size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.addPlaylistText}>Add to Playlist</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  topTitleBox: {
    alignItems: 'center',
    maxWidth: width * 0.6,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  topAlbum: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  iconBtn: {
    padding: SPACING.xs,
  },
  artworkSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  artworkCard: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: RADIUS.xxl,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  vinylDisc: {
    width: ARTWORK_SIZE * 0.85,
    height: ARTWORK_SIZE * 0.85,
    borderRadius: RADIUS.full,
    backgroundColor: '#07080B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#191C28',
  },
  vinylGrooves: {
    width: ARTWORK_SIZE * 0.45,
    height: ARTWORK_SIZE * 0.45,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  trackInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaBox: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  favoriteBtn: {
    padding: SPACING.xs,
  },
  seekerSection: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  smallCtrlBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  activeCtrlBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  mediumCtrlBtn: {
    padding: SPACING.sm,
  },
  heroPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomActions: {
    alignItems: 'center',
  },
  addPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addPlaylistText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
