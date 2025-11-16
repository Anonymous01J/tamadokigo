// components/EvolutionBadge.js - Componente visual correcto
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSpecialAbilities } from '../utils/evolutionSystem';
import { colors } from '../styles/appStyles';

export default function EvolutionBadge({ evolutionStage, daysAlive }) {
  if (!evolutionStage) return null;

  const abilities = getSpecialAbilities(evolutionStage.key);

  // Calcular días hasta próxima evolución
  const daysUntilNext =
    evolutionStage.maxDays === Infinity
      ? null
      : evolutionStage.maxDays - daysAlive + 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{evolutionStage.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.stageName}>{evolutionStage.name}</Text>
          <Text style={styles.description}>{evolutionStage.description}</Text>
        </View>
      </View>

      {daysUntilNext && daysUntilNext > 0 && (
        <Text style={styles.nextEvolution}>
          🌟 Próxima evolución en {daysUntilNext} día
          {daysUntilNext !== 1 ? 's' : ''}
        </Text>
      )}

      {daysUntilNext === null && (
        <Text style={styles.maxStage}>👑 ¡Nivel máximo alcanzado!</Text>
      )}

      <View style={styles.abilitiesContainer}>
        <Text style={styles.abilitiesTitle}>✨ Habilidades:</Text>
        {abilities.map((ability, index) => (
          <Text key={index} style={styles.ability}>
            • {ability}
          </Text>
        ))}
      </View>

      <View style={styles.statsInfo}>
        <Text style={styles.statsInfoText}>
          📊 Stats máximas: {evolutionStage.maxStats}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  abilitiesContainer: {
    backgroundColor: colors.statRowBorder,
    borderRadius: 8,
    marginTop: 8,
    padding: 8,
  },
  abilitiesTitle: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ability: {
    color: colors.textPrimary,
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  container: {
    backgroundColor: colors.detailedStatsBackground,
    borderColor: colors.primaryLight,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 10,
    padding: 12,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  emoji: {
    fontSize: 48,
    marginRight: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  maxStage: {
    backgroundColor: colors.lightYellow,
    borderRadius: 8,
    color: colors.darkYellow,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 6,
    padding: 6,
    textAlign: 'center',
  },
  nextEvolution: {
    backgroundColor: colors.statRowBorder,
    borderRadius: 8,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginVertical: 6,
    padding: 6,
    textAlign: 'center',
  },
  stageName: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statsInfo: {
    alignItems: 'center',
    marginTop: 6,
  },
  statsInfoText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
