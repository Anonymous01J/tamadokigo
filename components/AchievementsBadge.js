// components/AchievementsBadge.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/appStyles';

const ACHIEVEMENTS = {
  week_survivor: {
    emoji: '🎂',
    title: 'Superviviente',
    desc: '7 días de vida',
  },
  master_chef: {
    emoji: '👨‍🍳',
    title: 'Chef Maestro',
    desc: '50 comidas servidas',
  },
  playmate: { emoji: '🎮', title: 'Compañero Leal', desc: '30 juegos' },
  perfect_care: {
    emoji: '⭐',
    title: 'Cuidado Perfecto',
    desc: 'Todos los stats al máximo',
  },
};

export default function AchievementsBadge({
  achievements,
  stats,
  totalDaysAlive,
  deaths,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📊 Estadísticas</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalDaysAlive}</Text>
          <Text style={styles.statLabel}>Días totales</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{deaths}</Text>
          <Text style={styles.statLabel}>Muertes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.timesFed}</Text>
          <Text style={styles.statLabel}>Comidas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.timesPlayed}</Text>
          <Text style={styles.statLabel}>Juegos</Text>
        </View>
      </View>

      {achievements.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            🏆 Logros ({achievements.length}/4)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            {achievements.map((ach) => (
              <View key={ach} style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>
                  {ACHIEVEMENTS[ach].emoji}
                </Text>
                <Text style={styles.achievementTitle}>
                  {ACHIEVEMENTS[ach].title}
                </Text>
                <Text style={styles.achievementDesc}>
                  {ACHIEVEMENTS[ach].desc}
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  achievementBadge: {
    alignItems: 'center',
    backgroundColor: colors.statRowBorder,
    borderColor: colors.primaryLight,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    minWidth: 100,
    padding: 12,
  },
  achievementDesc: {
    color: colors.textPrimary,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  achievementEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  achievementTitle: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  achievementsScroll: {
    flexDirection: 'row',
  },
  container: {
    backgroundColor: colors.detailedStatsBackground,
    borderRadius: 15,
    marginVertical: 10,
    padding: 15,
    width: '100%',
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    marginTop: 2,
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
});
