import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { Plus, ListMusic, Check, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { Track, Playlist } from '../types/music';

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={e => e.stopPropagation()}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>New Playlist</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Playlist Name"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            maxLength={40}
          />

          <View style={styles.dialogActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !name.trim() && styles.disabledBtn]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={styles.confirmBtnText}>Create</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface AddToPlaylistModalProps {
  visible: boolean;
  track: Track | null;
  playlists: Playlist[];
  onClose: () => void;
  onSelectPlaylist: (playlistId: string, trackId: string) => void;
  onRequestCreatePlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  track,
  playlists,
  onClose,
  onSelectPlaylist,
  onRequestCreatePlaylist,
}) => {
  if (!track) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={e => e.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Add to Playlist</Text>
              <Text style={styles.sheetSubtitle} numberOfLines={1}>
                {track.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.createNewRow}
            onPress={() => {
              onClose();
              onRequestCreatePlaylist();
            }}
          >
            <View style={styles.createIconBox}>
              <Plus size={20} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.createNewText}>Create New Playlist</Text>
          </TouchableOpacity>

          <ScrollView style={styles.playlistList} showsVerticalScrollIndicator={false}>
            {playlists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No playlists created yet.</Text>
              </View>
            ) : (
              playlists.map(pl => {
                const alreadyInPlaylist = pl.trackIds.includes(track.id);
                return (
                  <TouchableOpacity
                    key={pl.id}
                    style={styles.playlistRow}
                    onPress={() => {
                      onSelectPlaylist(pl.id, track.id);
                      onClose();
                    }}
                  >
                    <View style={styles.plIconBox}>
                      <ListMusic size={18} color={COLORS.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.plName}>{pl.name}</Text>
                      <Text style={styles.plCount}>{pl.trackIds.length} tracks</Text>
                    </View>
                    {alreadyInPlaylist && (
                      <Check size={18} color={COLORS.primaryLight} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  cancelBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },

  sheetContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  createNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.cardActive,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  createIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createNewText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  playlistList: {
    maxHeight: 280,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  plIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  plCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
