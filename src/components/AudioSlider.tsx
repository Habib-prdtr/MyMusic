import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

interface AudioSliderProps {
  value: number; // in seconds
  maximumValue: number; // in seconds
  onSlidingStart?: () => void;
  onValueChange?: (val: number) => void;
  onSlidingComplete?: (val: number) => void;
}

export const AudioSlider: React.FC<AudioSliderProps> = ({
  value,
  maximumValue,
  onSlidingStart,
  onValueChange,
  onSlidingComplete,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const effectiveMax = maximumValue > 0 ? maximumValue : 1;
  const currentVal = isDragging ? dragValue : value;
  const progressPercent = Math.min(100, Math.max(0, (currentVal / effectiveMax) * 100));

  const calculateValueFromX = (locationX: number): number => {
    if (trackWidth <= 0) return 0;
    const clampedX = Math.max(0, Math.min(trackWidth, locationX));
    return (clampedX / trackWidth) * effectiveMax;
  };

  const handleGrant = (evt: GestureResponderEvent) => {
    setIsDragging(true);
    onSlidingStart?.();
    const newVal = calculateValueFromX(evt.nativeEvent.locationX);
    setDragValue(newVal);
    onValueChange?.(newVal);
  };

  const handleMove = (evt: GestureResponderEvent) => {
    const newVal = calculateValueFromX(evt.nativeEvent.locationX);
    setDragValue(newVal);
    onValueChange?.(newVal);
  };

  const handleRelease = (evt: GestureResponderEvent) => {
    const finalVal = calculateValueFromX(evt.nativeEvent.locationX);
    setIsDragging(false);
    onSlidingComplete?.(finalVal);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={styles.touchArea}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleGrant}
      onResponderMove={handleMove}
      onResponderRelease={handleRelease}
      onResponderTerminate={() => setIsDragging(false)}
      onLayout={handleLayout}
    >
      <View style={styles.rail}>
        <View style={[styles.progress, { width: `${progressPercent}%` }]} />
      </View>
      <View
        style={[
          styles.thumb,
          isDragging && styles.thumbActive,
          {
            left: `${progressPercent}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  touchArea: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  rail: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    width: '100%',
  },
  progress: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    marginLeft: -7,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbActive: {
    width: 20,
    height: 20,
    marginLeft: -10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
