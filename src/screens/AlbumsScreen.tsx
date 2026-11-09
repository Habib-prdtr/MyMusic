import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { Disc, Play, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';
import { AlbumGroup, Track } from '../types/music';
import { TrackItem } from '../components/TrackItem';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / COLUMN_COUNT;

interface AlbumsScreenProps {
  onOpenTrackMenu: (track: Track) => void;
}

export const AlbumsScreen: React.FC<AlbumsScreenProps> = ({ onOpenTrackMenu }) => {
  const getAlbumGroups = useMusicStore(s => s.getAlbumGroups);
  const playTrack = useMusicStore(s => s.playTrack);
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playbackState = useMusicStore(s => s.playbackState);
  const toggleFavorite = useMusicStore(s => s.toggleFavorite);
  const isFavorite = useMusicStore(s => s.isFavorite);

  const albums = getAlbumGroups();
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumGroup | null>(null);

  const handlePlayAlbumAll = (group: AlbumGroup) => {
    if (group.tracks.length > 0) {
      playTrack(group.tracks[0], group.tracks);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{albums.length} Albums</Text>
      </View>

      <FlatList
        data={albums}
        keyExtractor={item => item.album}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.albumCard}
            onPress={() => setSelectedAlbum(item)}
            activeOpacity={0.8}
          >
            <View style={styles.artwork}>
              <Disc size={36} color={COLORS.primaryLight} />
              <TouchableOpacity
                style={styles.cardPlayOverlay}
                onPress={() => handlePlayAlbumAll(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Play size={16} color="#FFF" fill="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.albumMeta}>
              <Text style={styles.albumName} numberOfLines={1}>
                {item.album}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {item.artist}
              </Text>
              <Text style={styles.trackCount}>{item.trackCount} tracks</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No albums found.</Text>
          </View>
        }
      />

      {/* Album Detail Modal */}
      <Modal
        visible={!!selectedAlbum}
        animationType="slide"
        onRequestClose={() => setSelectedAlbum(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalArtwork}>
              <Disc size={32} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1, marginRight: SPACING.md }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedAlbum?.album}
              </Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {selectedAlbum?.artist} • {selectedAlbum?.trackCount} tracks
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedAlbum(null)}
              style={styles.modalCloseBtn}
            >
              <X size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedAlbum && selectedAlbum.tracks.length > 0 && (
            <TouchableOpacity
              style={styles.playAllBanner}
              onPress={() => handlePlayAlbumAll(selectedAlbum)}
            >
              <Play size={18} color="#FFF" fill="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.playAllText}>Play Album</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={selectedAlbum?.tracks || []}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: SPACING.xxl }}
            renderItem={({ item }) => {
              const isActive = activeTrack?.id === item.id;
              return (
                <TrackItem
                  track={item}
                  isActive={isActive}
                  isPlaying={isActive && playbackState === 'playing'}
                  isFavorite={isFavorite(item.id)}
                  onPress={() => {
                    if (selectedAlbum) {
                      playTrack(item, selectedAlbum.tracks);
                    }
                  }}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  onMorePress={() => onOpenTrackMenu(item)}
                />
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  albumCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artwork: {
    width: '100%',
    height: CARD_WIDTH * 0.95,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardPlayOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  albumMeta: {
    padding: SPACING.md,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  artistName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  trackCount: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
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
  modalArtwork: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
});
