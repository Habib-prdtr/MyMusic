import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Leaf } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LEAF_COLORS = [
  '#0D9488', // Teal 600 (Hijau Tosca utama)
  '#14B8A6', // Teal 500 (Hijau Tosca terang)
  '#2DD4BF', // Teal 400 (Mint Tosca)
  '#059669', // Emerald 600
  '#10B981', // Emerald 500
  '#5EEAD4', // Soft mint tosca
];

interface LeafConfig {
  id: number;
  startX: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
  swayDistance: number;
  initialRotation: number;
  rotateTarget: number;
}

const TOTAL_LEAVES = 18;

const SingleLeaf: React.FC<{ config: LeafConfig }> = ({ config }) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Falling animation loop
    const fall = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    // Swaying (horizontal drift) loop
    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: config.duration / 3,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: config.duration / 3,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: config.duration / 3,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    fall.start();
    sway.start();

    return () => {
      fall.stop();
      sway.stop();
    };
  }, [fallAnim, swayAnim, config]);

  const translateY = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT + 40],
  });

  const translateX = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-config.swayDistance, 0, config.swayDistance],
  });

  const rotate = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${config.initialRotation}deg`, `${config.rotateTarget}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.leafWrapper,
        {
          left: config.startX,
          opacity: config.opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate },
          ],
        },
      ]}
    >
      <Leaf size={config.size} color={config.color} fill={config.color} />
    </Animated.View>
  );
};

interface FallingLeavesProps {
  enabled?: boolean;
}

export const FallingLeaves: React.FC<FallingLeavesProps> = ({ enabled = true }) => {
  const [leaves] = useState<LeafConfig[]>(() => {
    return Array.from({ length: TOTAL_LEAVES }).map((_, index) => {
      const size = Math.floor(Math.random() * 12) + 12; // 12px to 24px
      const startX = Math.random() * (SCREEN_WIDTH - 30);
      const color = LEAF_COLORS[index % LEAF_COLORS.length];
      const opacity = 0.25 + Math.random() * 0.35; // 0.25 to 0.60
      const duration = 8000 + Math.random() * 7000; // 8s to 15s
      const delay = Math.random() * 6000;
      const swayDistance = 20 + Math.random() * 35;
      const initialRotation = Math.random() * 360;
      const rotateTarget = initialRotation + 180 + Math.random() * 180;

      return {
        id: index,
        startX,
        size,
        color,
        opacity,
        duration,
        delay,
        swayDistance,
        initialRotation,
        rotateTarget,
      };
    });
  });

  if (!enabled) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {leaves.map(leaf => (
        <SingleLeaf key={leaf.id} config={leaf} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1, // Below modal dialogs, above background
  },
  leafWrapper: {
    position: 'absolute',
    top: 0,
  },
});
