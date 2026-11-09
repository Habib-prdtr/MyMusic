import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Music2, ShieldCheck, Settings, FolderHeart } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

interface PermissionViewProps {
  isDeniedPermanently?: boolean;
  onRequestPermission: () => void;
  onRefreshPermission: () => void;
  onContinueAnyway?: () => void;
}

export const PermissionView: React.FC<PermissionViewProps> = ({
  onRequestPermission,
  onRefreshPermission,
  onContinueAnyway,
}) => {
  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (e) {
      console.warn('Failed to open settings', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Music2 size={48} color={COLORS.primaryLight} />
      </View>

      <Text style={styles.title}>Welcome to FallingMusic</Text>
      
      <Text style={styles.description}>
        FallingMusic is 100% offline and respects your privacy. To detect, index, and play the songs
        stored on your device, please grant permission to access audio files.
      </Text>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <ShieldCheck size={20} color={COLORS.success} />
          <Text style={styles.featureText}>100% Offline & No tracking or uploads</Text>
        </View>
        <View style={styles.featureItem}>
          <FolderHeart size={20} color={COLORS.primaryLight} />
          <Text style={styles.featureText}>Automatic MediaStore scan for all music files</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRequestPermission}>
          <Text style={styles.primaryBtnText}>Grant Audio Permission</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsBtn} onPress={handleOpenSettings}>
          <Settings size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={styles.settingsBtnText}>Open Device Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefreshPermission}>
          <Text style={styles.refreshBtnText}>I already enabled it, check again</Text>
        </TouchableOpacity>

        {onContinueAnyway && (
          <TouchableOpacity style={styles.continueBtn} onPress={onContinueAnyway}>
            <Text style={styles.continueBtnText}>Continue to Music Library →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.25)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  featuresList: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  refreshBtn: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  refreshBtnText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '500',
  },
  continueBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.cardActive,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  continueBtnText: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
