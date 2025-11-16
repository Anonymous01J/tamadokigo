// components/MemoryGame.js - Juego de memoria con emojis
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { playSound } from '../utils/soundManager';
import { colors } from '../styles/appStyles';

const EMOJIS = ['🐕', '🦴', '🎾', '🍖', '🛁', '💖', '⚡', '✨'];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function MemoryGame({ visible, onClose, onWin }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [canFlip, setCanFlip] = useState(true);

  useEffect(() => {
    if (visible) {
      initGame();
    }
  }, [visible]);

  const initGame = () => {
    const gameEmojis = EMOJIS.slice(0, 6); // 6 pares
    const duplicated = [...gameEmojis, ...gameEmojis];
    const shuffled = shuffleArray(duplicated);

    setCards(
      shuffled.map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
    );

    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCanFlip(true);
  };

  const handleCardPress = (index) => {
    if (!canFlip || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    playSound('pet');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      setMoves(moves + 1);

      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        // Match!
        playSound('achievement');
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setFlipped([]);
        setCanFlip(true);

        // Verificar si ganó
        if (newMatched.length === cards.length) {
          setTimeout(() => {
            playSound('gameWin');
            onWin();
            setTimeout(() => {
              onClose();
            }, 1500);
          }, 500);
        }
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.gameContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>🧠 Juego de Memoria</Text>
            <Text style={styles.movesText}>Movimientos: {moves}</Text>
          </View>

          <View style={styles.grid}>
            {cards.map((card, index) => {
              const isFlipped =
                flipped.includes(index) || matched.includes(index);

              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.card,
                    isFlipped && styles.cardFlipped,
                    matched.includes(index) && styles.cardMatched,
                  ]}
                  onPress={() => handleCardPress(index)}
                  disabled={!canFlip || isFlipped}
                >
                  <Text style={styles.cardEmoji}>
                    {isFlipped ? card.emoji : '❓'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 3,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardFlipped: {
    backgroundColor: colors.white,
    borderColor: colors.lightGreen,
  },
  cardMatched: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.darkGreen,
    opacity: 0.7,
  },
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
  gameContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  headerText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
  },
  movesText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
