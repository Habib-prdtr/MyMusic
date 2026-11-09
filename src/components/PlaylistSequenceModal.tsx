import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  ListOrdered,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Square,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { useMusicStore } from '../store/musicStore';

interface PlaylistSequenceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PlaylistSequenceModal: React.FC<PlaylistSequenceModalProps> = ({
  visible,
  onClose,
}) => {
  const playlists = useMusicStore(s => s.playlists);
  const favorites = useMusicStore(s => s.favorites);
  const playlistSequence = useMusicStore(s => s.playlistSequence);
  const isSequenceActive = useMusicStore(s => s.isSequenceActive);
  const activeSequenceIndex = useMusicStore(s => s.activeSequenceIndex);
  const startPlaylistSequence = useMusicStore(s => s.startPlaylistSequence);
  const stopPlaylistSequence = useMusicStore(s => s.stopPlaylistSequence);
  const setPlaylistSequence = useMusicStore(s => s.setPlaylistSequence);
  const getActiveSequencePlaylistName = useMusicStore(s => s.getActiveSequencePlaylistName);

  // Local draft of sequence while editing in modal
  const [draftSequence, setDraftSequence] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setDraftSequence(playlistSequence);
    }
  }, [visible, playlistSequence]);

  const allAvailable = [
    { id: 'favorites', name: 'Favorite Songs', count: favorites.length },
    ...playlists.map(p => ({ id: p.id, name: p.name, count: p.trackIds.length })),
  ];

  const getPlaylistInfo = (id: string) => {
    if (id === 'favorites') {
      return { id: 'favorites', name: 'Favorite Songs', count: favorites.length };
    }
    const found = playlists.find(p => p.id === id);
    return {
      id,
      name: found ? found.name : 'Unknown Playlist',
      count: found ? found.trackIds.length : 0,
    };
  };

  const handleAddToSequence = (id: string) => {
    setDraftSequence(prev => [...prev, id]);
  };

  const handleRemoveFromSequence = (index: number) => {
    setDraftSequence(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setDraftSequence(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= draftSequence.length - 1) return;
    setDraftSequence(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleStartSequence = async () => {
    if (draftSequence.length === 0) return;
    setPlaylistSequence(draftSequence);
    await startPlaylistSequence(draftSequence, 0);
    onClose();
  };

  const handleStopSequence = () => {
    stopPlaylistSequence();
    setDraftSequence([]);
  };

  const activeName = getActiveSequencePlaylistName();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <ListOrdered size={20} color={COLORS.primaryLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Urutan Putar Playlist</Text>
                <Text style={styles.subtitle}>
                  Putar beruntun beberapa playlist tanpa mengulang dari awal
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active status pill banner */}
          {isSequenceActive && activeName && (
            <View style={styles.activeBanner}>
              <View style={styles.activeDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activeTitle}>Urutan Sedang Berjalan</Text>
                <Text style={styles.activeDesc}>
                  Memutar: <Text style={{ color: '#FFF', fontWeight: '700' }}>{activeName}</Text> (
                  {activeSequenceIndex + 1}/{playlistSequence.length})
                </Text>
              </View>
              <TouchableOpacity style={styles.stopBtn} onPress={handleStopSequence}>
                <Square size={12} color="#FFF" fill="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.stopBtnText}>Hentikan</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Sequence List Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                URUTAN PEMUTARAN ({draftSequence.length})
              </Text>
              {draftSequence.length > 0 && (
                <TouchableOpacity onPress={() => setDraftSequence([])}>
                  <Text style={styles.clearText}>Kosongkan</Text>
                </TouchableOpacity>
              )}
            </View>

            {draftSequence.length === 0 ? (
              <View style={styles.emptyBox}>
                <Sparkles size={28} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Belum ada playlist dalam urutan</Text>
                <Text style={styles.emptySubtitle}>
                  Pilih playlist di bawah untuk menentukan urutan pemutaran sementara.
                </Text>
              </View>
            ) : (
              <View style={styles.sequenceContainer}>
                {draftSequence.map((id, index) => {
                  const info = getPlaylistInfo(id);
                  const isCurrentPlaying =
                    isSequenceActive && activeSequenceIndex === index;

                  return (
                    <View
                      key={`${id}_${index}`}
                      style={[
                        styles.sequenceItem,
                        isCurrentPlaying && styles.sequenceItemActive,
                      ]}
                    >
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>{index + 1}</Text>
                      </View>

                      <View style={styles.itemInfo}>
                        <Text
                          style={[
                            styles.itemName,
                            isCurrentPlaying && styles.itemNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {info.name}
                        </Text>
                        <Text style={styles.itemMeta}>
                          {info.count} {info.count === 1 ? 'lagu' : 'lagu'}
                          {isCurrentPlaying ? ' • Sedang diputar' : ''}
                        </Text>
                      </View>

                      <View style={styles.reorderActions}>
                        <TouchableOpacity
                          style={[styles.arrowBtn, index === 0 && styles.disabledBtn]}
                          onPress={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp
                            size={18}
                            color={index === 0 ? COLORS.textMuted : COLORS.text}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.arrowBtn,
                            index === draftSequence.length - 1 && styles.disabledBtn,
                          ]}
                          onPress={() => handleMoveDown(index)}
                          disabled={index === draftSequence.length - 1}
                        >
                          <ChevronDown
                            size={18}
                            color={
                              index === draftSequence.length - 1
                                ? COLORS.textMuted
                                : COLORS.text
                            }
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemoveFromSequence(index)}
                        >
                          <Trash2 size={16} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Available Playlists Section */}
            <View style={[styles.sectionHeaderRow, { marginTop: SPACING.xl }]}>
              <Text style={styles.sectionTitle}>TAMBAH KE URUTAN</Text>
            </View>

            <View style={styles.availableContainer}>
              {allAvailable.map(item => (
                <View key={item.id} style={styles.availableCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availableName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.availableMeta}>{item.count} lagu</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddToSequence(item.id)}
                  >
                    <Plus size={16} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
                    <Text style={styles.addBtnText}>Tambah</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.startBtn,
                draftSequence.length === 0 && styles.startBtnDisabled,
              ]}
              onPress={handleStartSequence}
              disabled={draftSequence.length === 0}
            >
              <Play size={18} color="#FFF" fill="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>
                {isSequenceActive ? 'Perbarui & Putar Urutan' : 'Mulai Putar Urutan Ini'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#161722',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '85%',
    minHeight: '60%',
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
    marginRight: SPACING.sm,
  },
  activeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  activeDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  stopBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  contentScroll: {
    paddingHorizontal: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.xl,
  },
  sequenceContainer: {
    gap: SPACING.xs,
  },
  sequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sequenceItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  orderBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  orderBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemNameActive: {
    color: COLORS.primaryLight,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  reorderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  removeBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(235, 87, 87, 0.1)',
    marginLeft: 4,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  availableContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  availableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  availableName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  availableMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
