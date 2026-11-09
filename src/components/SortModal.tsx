import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Check, ArrowDownUp, X } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import { SortOption, SortDirection } from '../types/music';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  currentSort: SortOption;
  currentDirection: SortDirection;
  onSelectSort: (option: SortOption, direction: SortDirection) => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  currentSort,
  currentDirection,
  onSelectSort,
}) => {
  const options: { label: string; value: SortOption }[] = [
    { label: 'Song Title (A-Z)', value: 'title' },
    { label: 'Artist Name', value: 'artist' },
    { label: 'Recently Added', value: 'dateAdded' },
    { label: 'Duration (Length)', value: 'duration' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ArrowDownUp size={20} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.title}>Sort Tracks</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {options.map(item => {
              const isSelected = currentSort === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => {
                    const nextDir = isSelected
                      ? currentDirection === 'asc'
                        ? 'desc'
                        : 'asc'
                      : 'asc';
                    onSelectSort(item.value, nextDir);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedRow}>
                      <Text style={styles.dirText}>
                        {currentDirection === 'asc' ? 'Ascending' : 'Descending'}
                      </Text>
                      <Check size={18} color={COLORS.primaryLight} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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
  content: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  optionItemSelected: {
    backgroundColor: COLORS.cardActive,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.text,
    fontWeight: '700',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dirText: {
    fontSize: 12,
    color: COLORS.primaryLight,
  },
});
