// components/GameSelector.js - Selector de mini-juegos
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../styles/appStyles';

export default function GameSelector({ visible, onClose, onSelectGame }) {
  const games = [
    {
      id: 'hearts',
      name: 'Atrapa Corazones',
      emoji: '💖',
      description: 'Toca 10 corazones en 10 segundos',
    },
    {
      id: 'memory',
      name: 'Memoria',
      emoji: '🧠',
      description: 'Encuentra las parejas',
    },
    {
      id: 'catch',
      name: 'Atrapa Comida',
      emoji: '🍖',
      description: 'Atrapa la comida que cae',
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>🎮 Selecciona un Juego</Text>

          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => {
                onSelectGame(game.id);
                onClose();
              }}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <View style={styles.gameInfo}>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '85%',
  },
  gameCard: {
    alignItems: 'center',
    backgroundColor: colors.statRowBorder,
    borderColor: colors.primaryLight,
    borderRadius: 15,
    borderWidth: 2,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 15,
    width: '100%',
  },
  gameDescription: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  gameEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
