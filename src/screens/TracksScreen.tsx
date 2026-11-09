import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ArrowDownUp, RefreshCw, Music2, FolderPlus } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';
import { SearchBar } from '../components/SearchBar';
import { TrackItem } from '../components/TrackItem';
import { SortModal } from '../components/SortModal';
import { MediaScannerService } from '../services/mediaScanner';
import { Track } from '../types/music';

interface TracksScreenProps {
  onOpenTrackMenu: (track: Track) => void;
}

export const TracksScreen: React.FC<TracksScreenProps> = ({ onOpenTrackMenu }) => {
  const filteredTracks = useMusicStore(s => s.filteredTracks);
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playbackState = useMusicStore(s => s.playbackState);
  const isScanning = useMusicStore(s => s.isScanning);
  const searchQuery = useMusicStore(s => s.searchQuery);
  const sortOption = useMusicStore(s => s.sortOption);
  const sortDirection = useMusicStore(s => s.sortDirection);

  const scanLibrary = useMusicStore(s => s.scanLibrary);
  const importTracks = useMusicStore(s => s.importTracks);
  const playTrack = useMusicStore(s => s.playTrack);
  const setSearchQuery = useMusicStore(s => s.setSearchQuery);
  const setSortOption = useMusicStore(s => s.setSortOption);
  const toggleFavorite = useMusicStore(s => s.toggleFavorite);
  const isFavorite = useMusicStore(s => s.isFavorite);

  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Bar & Action Buttons */}
      <View style={styles.headerControls}>
        <View style={styles.searchWrapper}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={styles.headerBtnRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={async () => {
              const picked = await MediaScannerService.pickAudioFiles();
              if (picked.length > 0) {
                importTracks(picked);
              }
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FolderPlus size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsSortModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowDownUp size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={scanLibrary}
            disabled={isScanning}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={COLORS.primaryLight} />
            ) : (
              <RefreshCw size={18} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Subheader Track Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredTracks.length} {filteredTracks.length === 1 ? 'Track' : 'Tracks'}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </Text>
      </View>

      {/* Virtualized FlashList */}
      <View style={{ flex: 1 }}>
        <FlashList
          data={filteredTracks}
          keyExtractor={item => item.id}
          refreshing={isScanning}
          onRefresh={scanLibrary}
          renderItem={({ item }) => {
            const isActive = activeTrack?.id === item.id;
            return (
              <TrackItem
                track={item}
                isActive={isActive}
                isPlaying={isActive && playbackState === 'playing'}
                isFavorite={isFavorite(item.id)}
                onPress={() => playTrack(item, filteredTracks)}
                onToggleFavorite={() => toggleFavorite(item.id)}
                onMorePress={() => onOpenTrackMenu(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Music2 size={36} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching tracks' : 'No music found on device'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search keyword.'
                  : 'Pull down to refresh or check your music folders.'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Sort Options Modal */}
      <SortModal
        visible={isSortModalVisible}
        onClose={() => setIsSortModalVisible(false)}
        currentSort={sortOption}
        currentDirection={sortDirection}
        onSelectSort={(opt, dir) => setSortOption(opt, dir)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  searchWrapper: {
    flex: 1,
  },
  headerBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
