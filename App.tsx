import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Music, Users, Disc, ListMusic, Radio, Leaf } from 'lucide-react-native';

import { useMusicStore } from './src/store/musicStore';
import { COLORS, RADIUS, SPACING } from './src/utils/theme';
import { TabType, Track } from './src/types/music';

import { TracksScreen } from './src/screens/TracksScreen';
import { ArtistsScreen } from './src/screens/ArtistsScreen';
import { AlbumsScreen } from './src/screens/AlbumsScreen';
import { PlaylistsScreen } from './src/screens/PlaylistsScreen';

import { MiniPlayer } from './src/components/MiniPlayer';
import { NowPlayingModal } from './src/components/NowPlayingModal';
import { QueueModal } from './src/components/QueueModal';
import {
  CreatePlaylistModal,
  AddToPlaylistModal,
} from './src/components/PlaylistModal';
import { PermissionView } from './src/components/PermissionView';
import { FallingLeaves } from './src/components/FallingLeaves';

export default function App() {
  const initialize = useMusicStore(s => s.initialize);
  const requestPermissionAndScan = useMusicStore(s => s.requestPermissionAndScan);
  const hasPermission = useMusicStore(s => s.hasPermission);
  const isLoading = useMusicStore(s => s.isLoading);
  const activeTab = useMusicStore(s => s.activeTab);
  const setActiveTab = useMusicStore(s => s.setActiveTab);
  const playlists = useMusicStore(s => s.playlists);
  const createPlaylist = useMusicStore(s => s.createPlaylist);
  const addTrackToPlaylist = useMusicStore(s => s.addTrackToPlaylist);

  const [isCreatePlaylistVisible, setIsCreatePlaylistVisible] = useState(false);
  const [selectedTrackForMenu, setSelectedTrackForMenu] = useState<Track | null>(null);
  const [showLeaves, setShowLeaves] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const tabs: { key: TabType; label: string; icon: typeof Music }[] = [
    { key: 'tracks', label: 'Tracks', icon: Music },
    { key: 'artists', label: 'Artists', icon: Users },
    { key: 'albums', label: 'Albums', icon: Disc },
    { key: 'playlists', label: 'Playlists', icon: ListMusic },
  ];

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="dark" />
      <SafeAreaView
        style={[
          styles.rootContainer,
          Platform.OS === 'web' && ({ height: '100vh', width: '100%', maxWidth: 768, alignSelf: 'center' } as any),
        ]}
        edges={['top', 'left', 'right']}
      >
        <FallingLeaves enabled={showLeaves} />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Initializing PulseMusic...</Text>
          </View>
        ) : hasPermission === false ? (
          <PermissionView
            onRequestPermission={requestPermissionAndScan}
            onRefreshPermission={initialize}
            onContinueAnyway={() => {
              useMusicStore.setState({ hasPermission: true });
              useMusicStore.getState().scanLibrary();
            }}
          />
        ) : (
          <View style={styles.mainContainer}>
            {/* Top Brand Header */}
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <View style={styles.brandIconBox}>
                  <Radio size={20} color="#FFF" />
                </View>
                <Text style={styles.brandTitle}>PulseMusic</Text>
                <View style={styles.offlineBadge}>
                  <Text style={styles.offlineText}>OFFLINE</Text>
                </View>

                {/* Falling Leaves Toggle Button */}
                <TouchableOpacity
                  style={[styles.leavesToggleBtn, showLeaves && styles.leavesToggleBtnActive]}
                  onPress={() => setShowLeaves(prev => !prev)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Toggle falling leaves effect"
                >
                  <Leaf
                    size={14}
                    color={showLeaves ? COLORS.primary : COLORS.textMuted}
                    fill={showLeaves ? COLORS.primary : 'transparent'}
                  />
                  <Text
                    style={[
                      styles.leavesToggleText,
                      showLeaves && styles.leavesToggleTextActive,
                    ]}
                  >
                    Daun
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Screen Content based on active tab */}
            <View style={styles.contentArea}>
              {activeTab === 'tracks' && (
                <TracksScreen onOpenTrackMenu={t => setSelectedTrackForMenu(t)} />
              )}
              {activeTab === 'artists' && (
                <ArtistsScreen onOpenTrackMenu={t => setSelectedTrackForMenu(t)} />
              )}
              {activeTab === 'albums' && (
                <AlbumsScreen onOpenTrackMenu={t => setSelectedTrackForMenu(t)} />
              )}
              {activeTab === 'playlists' && (
                <PlaylistsScreen
                  onRequestCreatePlaylist={() => setIsCreatePlaylistVisible(true)}
                  onOpenTrackMenu={t => setSelectedTrackForMenu(t)}
                />
              )}
            </View>

            {/* Floating Mini Player (FR-5.1) */}
            <MiniPlayer />

            {/* Bottom Tab Bar Navigation */}
            <View style={styles.tabBar}>
              {tabs.map(tab => {
                const isFocused = activeTab === tab.key;
                const IconComponent = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.tabItem}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.tabIconBox, isFocused && styles.tabIconBoxActive]}>
                      <IconComponent
                        size={20}
                        color={isFocused ? COLORS.primaryLight : COLORS.textMuted}
                      />
                    </View>
                    <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Modals & Dialogs */}
        <NowPlayingModal
          onOpenAddToPlaylist={() => {
            const active = useMusicStore.getState().activeTrack;
            if (active) setSelectedTrackForMenu(active);
          }}
        />

        <QueueModal />

        <CreatePlaylistModal
          visible={isCreatePlaylistVisible}
          onClose={() => setIsCreatePlaylistVisible(false)}
          onCreate={name => createPlaylist(name)}
        />

        <AddToPlaylistModal
          visible={!!selectedTrackForMenu}
          track={selectedTrackForMenu}
          playlists={playlists}
          onClose={() => setSelectedTrackForMenu(null)}
          onSelectPlaylist={(playlistId, trackId) => {
            addTrackToPlaylist(playlistId, trackId);
            setSelectedTrackForMenu(null);
          }}
          onRequestCreatePlaylist={() => setIsCreatePlaylistVisible(true)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  offlineBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)',
  },
  offlineText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.8,
  },
  leavesToggleBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leavesToggleBtnActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    borderColor: COLORS.primaryLight,
  },
  leavesToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  leavesToggleTextActive: {
    color: COLORS.primaryDark,
  },
  contentArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconBox: {
    padding: 4,
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  tabIconBoxActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
