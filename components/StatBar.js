// components/StatBar.js
import React, { useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../styles/appStyles';

function StatBar({ label, value, emoji, max, statColor, style }) {
  const anim = useRef(new Animated.Value(value)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, max],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const statTextStyle = [
    styles.statText,
    {
      color: statColor ? colors[statColor] : colors.textPrimary,
    },
  ];

  return (
    <View style={[styles.stat, style]}>
      <Text style={statTextStyle}>{label}</Text>

      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              width: widthInterpolated,
              backgroundColor: statColor
                ? colors[statColor]
                : colors.primaryLight,
            },
          ]}
        />
        <View style={styles.barBackground} />
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>
          {emoji} {Math.round(value)}
        </Text>
        <Text style={styles.maxText}>/ {max}</Text>
      </View>
    </View>
  );
}

export default memo(StatBar);

const styles = StyleSheet.create({
  bar: {
    borderRadius: 8,
    height: 16,
    position: 'absolute',
    zIndex: 1,
  },
  barBackground: {
    backgroundColor: colors.statBarBackground,
    borderRadius: 8,
    height: 16,
    position: 'absolute',
    width: '100%',
  },
  barContainer: {
    backgroundColor: colors.lightPurple,
    borderColor: colors.darkPurple,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  maxText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  stat: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  statText: {
    color: colors.statBarText,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    width: 70,
  },
  valueContainer: {
    alignItems: 'baseline',
    flexDirection: 'row',
    width: 80,
  },
  valueText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
