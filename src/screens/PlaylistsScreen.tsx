import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import {
  Heart,
  Plus,
  Play,
  ListMusic,
  Trash2,
  X,
  Music,
  ListOrdered,
  Square,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';
import { Playlist, Track } from '../types/music';
import { TrackItem } from '../components/TrackItem';
import { PlaylistSequenceModal } from '../components/PlaylistSequenceModal';

interface PlaylistsScreenProps {
  onRequestCreatePlaylist: () => void;
  onOpenTrackMenu: (track: Track) => void;
}

export const PlaylistsScreen: React.FC<PlaylistsScreenProps> = ({
  onRequestCreatePlaylist,
  onOpenTrackMenu,
}) => {
  const playlists = useMusicStore(s => s.playlists);
  const deletePlaylist = useMusicStore(s => s.deletePlaylist);
  const removeTrackFromPlaylist = useMusicStore(s => s.removeTrackFromPlaylist);
  const getFavoriteTracks = useMusicStore(s => s.getFavoriteTracks);
  const getPlaylistTracks = useMusicStore(s => s.getPlaylistTracks);
  const playTrack = useMusicStore(s => s.playTrack);
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playbackState = useMusicStore(s => s.playbackState);
  const toggleFavorite = useMusicStore(s => s.toggleFavorite);
  const isFavorite = useMusicStore(s => s.isFavorite);

  const isSequenceActive = useMusicStore(s => s.isSequenceActive);
  const playlistSequence = useMusicStore(s => s.playlistSequence);
  const activeSequenceIndex = useMusicStore(s => s.activeSequenceIndex);
  const stopPlaylistSequence = useMusicStore(s => s.stopPlaylistSequence);
  const getActiveSequencePlaylistName = useMusicStore(s => s.getActiveSequencePlaylistName);
  const activeSequencePlaylistName = getActiveSequencePlaylistName();

  const [isSequenceModalVisible, setIsSequenceModalVisible] = useState(false);

  const favoriteTracks = getFavoriteTracks();
  const [selectedPlaylist, setSelectedPlaylist] = useState<{
    id: string;
    name: string;
    isFavorites?: boolean;
  } | null>(null);

  const activePlaylistTracks = selectedPlaylist?.isFavorites
    ? favoriteTracks
    : selectedPlaylist
    ? getPlaylistTracks(selectedPlaylist.id)
    : [];

  const handlePlayAll = (tracksToPlay: Track[]) => {
    if (tracksToPlay.length > 0) {
      playTrack(tracksToPlay[0], tracksToPlay);
    }
  };

  const confirmDeletePlaylist = (pl: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${pl.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(pl.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Active Sequence Banner */}
            {isSequenceActive && (
              <TouchableOpacity
                style={styles.activeSequenceCard}
                onPress={() => setIsSequenceModalVisible(true)}
                activeOpacity={0.85}
              >
                <View style={styles.seqIconBox}>
                  <ListOrdered size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={styles.pulsingDot} />
                    <Text style={styles.seqCardTitle}>Urutan Playlist Berjalan</Text>
                  </View>
                  <Text style={styles.seqCardSubtitle} numberOfLines={1}>
                    Sedang: <Text style={{ color: '#FFF', fontWeight: '700' }}>{activeSequencePlaylistName || 'Playlist'}</Text> ({activeSequenceIndex + 1}/{playlistSequence.length})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.stopSeqBtn}
                  onPress={e => {
                    e.stopPropagation();
                    stopPlaylistSequence();
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Square size={12} color="#FFF" fill="#FFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Favorites Hero Card */}
            <TouchableOpacity
              style={styles.favoritesHero}
              onPress={() =>
                setSelectedPlaylist({
                  id: 'favorites',
                  name: 'Favorites',
                  isFavorites: true,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.favIconBox}>
                <Heart size={28} color="#FFF" fill="#FFF" />
              </View>

              <View style={styles.favInfo}>
                <Text style={styles.favTitle}>Favorite Songs</Text>
                <Text style={styles.favCount}>
                  {favoriteTracks.length} {favoriteTracks.length === 1 ? 'track' : 'tracks'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.favPlayBtn}
                onPress={() => handlePlayAll(favoriteTracks)}
                disabled={favoriteTracks.length === 0}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Play size={18} color="#FFF" fill="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Custom Playlists Bar */}
            <View style={styles.sectionBar}>
              <Text style={styles.sectionTitle}>MY PLAYLISTS ({playlists.length})</Text>
              <View style={styles.sectionBtnGroup}>
                <TouchableOpacity
                  style={[styles.sequenceBtn, isSequenceActive && styles.sequenceBtnActive]}
                  onPress={() => setIsSequenceModalVisible(true)}
                >
                  <ListOrdered
                    size={15}
                    color={isSequenceActive ? '#FFF' : COLORS.primaryLight}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.sequenceBtnText,
                      isSequenceActive && styles.sequenceBtnTextActive,
                    ]}
                  >
                    {isSequenceActive ? 'Urutan Aktif' : 'Urutan'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.newPlaylistBtn}
                  onPress={onRequestCreatePlaylist}
                >
                  <Plus size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                  <Text style={styles.newPlaylistBtnText}>New</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const count = item.trackIds.length;
          const tracks = getPlaylistTracks(item.id);

          return (
            <TouchableOpacity
              style={styles.playlistCard}
              onPress={() =>
                setSelectedPlaylist({
                  id: item.id,
                  name: item.name,
                  isFavorites: false,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.playlistIconBox}>
                <ListMusic size={22} color={COLORS.primaryLight} />
              </View>

              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.playlistCount}>{count} tracks</Text>
              </View>

              <TouchableOpacity
                style={styles.quickPlayBtn}
                onPress={() => handlePlayAll(tracks)}
                disabled={count === 0}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Play size={15} color="#FFF" fill="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDeletePlaylist(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No custom playlists yet.</Text>
            <TouchableOpacity
              style={styles.emptyCreateBtn}
              onPress={onRequestCreatePlaylist}
            >
              <Plus size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyCreateBtnText}>Create Playlist</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Playlist / Favorites Detail Modal */}
      <Modal
        visible={!!selectedPlaylist}
        animationType="slide"
        onRequestClose={() => setSelectedPlaylist(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalAvatar,
                selectedPlaylist?.isFavorites && styles.modalAvatarFav,
              ]}
            >
              {selectedPlaylist?.isFavorites ? (
                <Heart size={28} color="#FFF" fill="#FFF" />
              ) : (
                <ListMusic size={28} color={COLORS.primaryLight} />
              )}
            </View>

            <View style={{ flex: 1, marginRight: SPACING.md }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedPlaylist?.name}
              </Text>
              <Text style={styles.modalSubtitle}>
                {activePlaylistTracks.length}{' '}
                {activePlaylistTracks.length === 1 ? 'track' : 'tracks'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedPlaylist(null)}
              style={styles.modalCloseBtn}
            >
              <X size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {activePlaylistTracks.length > 0 && (
            <TouchableOpacity
              style={styles.playAllBanner}
              onPress={() => handlePlayAll(activePlaylistTracks)}
            >
              <Play size={18} color="#FFF" fill="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.playAllText}>Play All Tracks</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={activePlaylistTracks}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: SPACING.xxl }}
            renderItem={({ item }) => {
              const isActive = activeTrack?.id === item.id;
              return (
                <View style={styles.trackRowWrapper}>
                  <View style={{ flex: 1 }}>
                    <TrackItem
                      track={item}
                      isActive={isActive}
                      isPlaying={isActive && playbackState === 'playing'}
                      isFavorite={isFavorite(item.id)}
                      onPress={() => playTrack(item, activePlaylistTracks)}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      onMorePress={() => onOpenTrackMenu(item)}
                    />
                  </View>

                  {!selectedPlaylist?.isFavorites && selectedPlaylist && (
                    <TouchableOpacity
                      style={styles.removeTrackBtn}
                      onPress={() =>
                        removeTrackFromPlaylist(selectedPlaylist.id, item.id)
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.modalEmpty}>
                <Music size={32} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
                <Text style={styles.modalEmptyText}>No tracks in this playlist.</Text>
              </View>
            }
          />
        </View>
      </Modal>

      <PlaylistSequenceModal
        visible={isSequenceModalVisible}
        onClose={() => setIsSequenceModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headerArea: {
    paddingVertical: SPACING.sm,
  },
  activeSequenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  seqIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  seqCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  seqCardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stopSeqBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sectionBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sequenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.cardActive,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sequenceBtnActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderColor: COLORS.primaryLight,
  },
  sequenceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  sequenceBtnTextActive: {
    color: '#FFF',
  },
  favoritesHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#881337',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#BE123C',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  favIconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.heart,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  favInfo: {
    flex: 1,
  },
  favTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  favCount: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  favPlayBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.cardActive,
    borderRadius: RADIUS.full,
  },
  newPlaylistBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playlistIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  playlistCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quickPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  deleteBtn: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  emptyCreateBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalAvatarFav: {
    backgroundColor: '#881337',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  modalCloseBtn: {
    padding: SPACING.xs,
  },
  playAllBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  playAllText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  trackRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  removeTrackBtn: {
    padding: SPACING.sm,
  },
  modalEmpty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  modalEmptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
