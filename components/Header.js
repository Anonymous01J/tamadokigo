// components/Header.js
import React from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { appStyles } from '../styles/appStyles';

export default function Header({ daysAlive, onStatsPress }) {
  return (
    <View style={appStyles.topBar}>
      <View style={appStyles.daysAliveContainer}>
        <Text style={appStyles.daysAliveEmoji}>🎂</Text>
        <Text style={appStyles.daysAliveText}>{daysAlive}d</Text>
      </View>

      <Text style={appStyles.title}>🐾 TamaDoki 🐾</Text>

      <IconButton
        icon="trophy"
        iconColor="#fff"
        size={24}
        style={appStyles.statsButton}
        onPress={onStatsPress}
      />
    </View>
  );
}
