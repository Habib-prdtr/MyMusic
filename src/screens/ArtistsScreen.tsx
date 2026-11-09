import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { User, Play, ChevronRight, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';
import { ArtistGroup, Track } from '../types/music';
import { TrackItem } from '../components/TrackItem';

interface ArtistsScreenProps {
  onOpenTrackMenu: (track: Track) => void;
}

export const ArtistsScreen: React.FC<ArtistsScreenProps> = ({ onOpenTrackMenu }) => {
  const getArtistGroups = useMusicStore(s => s.getArtistGroups);
  const playTrack = useMusicStore(s => s.playTrack);
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playbackState = useMusicStore(s => s.playbackState);
  const toggleFavorite = useMusicStore(s => s.toggleFavorite);
  const isFavorite = useMusicStore(s => s.isFavorite);

  const artists = getArtistGroups();
  const [selectedArtist, setSelectedArtist] = useState<ArtistGroup | null>(null);

  const handlePlayArtistAll = (group: ArtistGroup) => {
    if (group.tracks.length > 0) {
      playTrack(group.tracks[0], group.tracks);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{artists.length} Artists</Text>
      </View>

      <FlatList
        data={artists}
        keyExtractor={item => item.artist}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.artistCard}
            onPress={() => setSelectedArtist(item)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <User size={22} color={COLORS.primaryLight} />
            </View>

            <View style={styles.artistInfo}>
              <Text style={styles.artistName} numberOfLines={1}>
                {item.artist}
              </Text>
              <Text style={styles.trackCount}>
                {item.trackCount} {item.trackCount === 1 ? 'track' : 'tracks'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.quickPlayBtn}
              onPress={() => handlePlayArtistAll(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Play size={16} color={COLORS.text} fill={COLORS.text} />
            </TouchableOpacity>

            <ChevronRight size={18} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No artists found.</Text>
          </View>
        }
      />

      {/* Selected Artist Tracks Sheet */}
      <Modal
        visible={!!selectedArtist}
        animationType="slide"
        onRequestClose={() => setSelectedArtist(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalAvatar}>
              <User size={28} color={COLORS.primaryLight} />
            </View>
            <View style={{ flex: 1, marginRight: SPACING.md }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedArtist?.artist}
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedArtist?.trackCount} {selectedArtist?.trackCount === 1 ? 'track' : 'tracks'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedArtist(null)}
              style={styles.modalCloseBtn}
            >
              <X size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedArtist && selectedArtist.tracks.length > 0 && (
            <TouchableOpacity
              style={styles.playAllBanner}
              onPress={() => handlePlayArtistAll(selectedArtist)}
            >
              <Play size={18} color="#FFF" fill="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.playAllText}>Play All Tracks</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={selectedArtist?.tracks || []}
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
                    if (selectedArtist) {
                      playTrack(item, selectedArtist.tracks);
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
    gap: SPACING.sm,
  },
  artistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  trackCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quickPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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
