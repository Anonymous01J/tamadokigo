// components/StatsModal.js
import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import AchievementsBadge from './AchievementsBadge';
import EvolutionBadge from './EvolutionBadge';
import { modalStyles } from '../styles/appStyles';
import { getEvolutionStage } from '../utils/evolutionSystem';

export default function StatsModal({ visible, onClose, pet }) {
  const evolutionStage = getEvolutionStage(pet.daysAlive);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>📊 Estadísticas</Text>
            <IconButton
              icon="close"
              iconColor="#e91e63"
              size={24}
              onPress={onClose}
            />
          </View>

          <ScrollView style={modalStyles.modalScroll}>
            {/* Badge de evolución */}
            <EvolutionBadge
              evolutionStage={evolutionStage}
              daysAlive={pet.daysAlive}
            />

            <AchievementsBadge
              achievements={pet.achievements || []}
              stats={pet.stats || {}}
              totalDaysAlive={pet.totalDaysAlive || 0}
              deaths={pet.deaths || 0}
            />

            <View style={modalStyles.detailedStats}>
              <Text style={modalStyles.detailedStatsTitle}>📈 Detalles</Text>
              <View style={modalStyles.statRow}>
                <Text style={modalStyles.statRowLabel}>🍖 Alimentado:</Text>
                <Text style={modalStyles.statRowValue}>
                  {pet.stats?.timesFed || 0}
                </Text>
              </View>
              <View style={modalStyles.statRow}>
                <Text style={modalStyles.statRowLabel}>🎮 Jugado:</Text>
                <Text style={modalStyles.statRowValue}>
                  {pet.stats?.timesPlayed || 0}
                </Text>
              </View>
              <View style={modalStyles.statRow}>
                <Text style={modalStyles.statRowLabel}>🛁 Bañado:</Text>
                <Text style={modalStyles.statRowValue}>
                  {pet.stats?.timesBathed || 0}
                </Text>
              </View>
              <View style={modalStyles.statRow}>
                <Text style={modalStyles.statRowLabel}>💖 Acariciado:</Text>
                <Text style={modalStyles.statRowValue}>
                  {pet.stats?.timesPetted || 0}
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={modalStyles.closeModalButton}
            onPress={onClose}
          >
            <Text style={modalStyles.closeModalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
