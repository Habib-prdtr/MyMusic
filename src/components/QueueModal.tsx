import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { X, ListMusic, Volume2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';
import { formatDuration } from '../utils/formatters';

export const QueueModal: React.FC = () => {
  const isQueueVisible = useMusicStore(s => s.isQueueVisible);
  const setQueueVisible = useMusicStore(s => s.setQueueVisible);
  const queue = useMusicStore(s => s.queue);
  const queueIndex = useMusicStore(s => s.queueIndex);
  const activeTrack = useMusicStore(s => s.activeTrack);
  const playTrack = useMusicStore(s => s.playTrack);

  return (
    <Modal
      visible={isQueueVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setQueueVisible(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setQueueVisible(false)}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ListMusic size={22} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.title}>Play Queue</Text>
                <Text style={styles.subtitle}>{queue.length} tracks</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setQueueVisible(false)} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={queue}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isActive = activeTrack?.id === item.id && index === queueIndex;
              return (
                <TouchableOpacity
                  style={[styles.itemRow, isActive && styles.itemRowActive]}
                  onPress={() => {
                    playTrack(item, queue);
                  }}
                >
                  <Text style={[styles.indexText, isActive && styles.indexTextActive]}>
                    {index + 1}
                  </Text>
                  
                  <View style={styles.itemInfo}>
                    <Text
                      style={[styles.itemTitle, isActive && styles.itemTitleActive]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.itemArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>

                  {isActive ? (
                    <Volume2 size={18} color={COLORS.primaryLight} />
                  ) : (
                    <Text style={styles.itemDuration}>{formatDuration(item.duration)}</Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  itemRowActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  indexText: {
    width: 28,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  indexTextActive: {
    color: COLORS.primaryLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemTitleActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  itemArtist: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
