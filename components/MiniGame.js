import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../styles/appStyles';

export default function MiniGame({ visible, onClose, onWin }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [positions, setPositions] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  
  const timerRef = useRef(null);
  const spawnerRef = useRef(null);
  const gameEndedRef = useRef(false);

  // ✅ Limpiar intervalos
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (spawnerRef.current) {
      clearInterval(spawnerRef.current);
      spawnerRef.current = null;
    }
  };

  // ✅ Iniciar juego
  useEffect(() => {
    if (visible && !gameStarted) {
      // Reset estado
      gameEndedRef.current = false;
      setGameStarted(true);
      setScore(0);
      setTimeLeft(10);
      setPositions([]);

      // Limpiar intervalos anteriores
      cleanup();

      // Timer del juego
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Spawner de corazones
      spawnerRef.current = setInterval(() => {
        const newPos = {
          id: Date.now() + Math.random(),
          x: Math.random() * 250,
          y: Math.random() * 350,
        };
        setPositions((prev) => [...prev, newPos]);

        // Remover después de 1.5 segundos
        setTimeout(() => {
          setPositions((prev) => prev.filter((p) => p.id !== newPos.id));
        }, 1500);
      }, 800);
    }

    // Cleanup cuando se cierra el modal
    if (!visible && gameStarted) {
      cleanup();
      setGameStarted(false);
      setPositions([]);
    }

    // Cleanup al desmontar
    return () => {
      cleanup();
    };
  }, [visible]); // ✅ Solo 'visible' como dependencia

  // ✅ Detectar fin del juego por tiempo
  useEffect(() => {
    if (timeLeft === 0 && gameStarted && !gameEndedRef.current) {
      gameEndedRef.current = true;
      cleanup();
      
      // Verificar si ganó
      if (score >= 10) {
        onWin();
      }
      
      // Cerrar después de mostrar resultado
      setTimeout(() => {
        setGameStarted(false);
        setPositions([]);
        gameEndedRef.current = false;
        onClose();
      }, 1500);
    }
  }, [timeLeft, gameStarted, score, onWin, onClose]);

  const handleTap = (id) => {
    setScore((prev) => prev + 1);
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClose = () => {
    cleanup();
    setGameStarted(false);
    setPositions([]);
    gameEndedRef.current = false;
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.gameContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>🎯 ¡Atrapa los corazones!</Text>
            <Text style={styles.scoreText}>Puntos: {score}</Text>
            <Text style={styles.timerText}>Tiempo: {timeLeft}s</Text>
          </View>

          <View style={styles.gameArea}>
            {positions.map((pos) => (
              <TouchableOpacity
                key={pos.id}
                style={[styles.target, { left: pos.x, top: pos.y }]}
                onPress={() => handleTap(pos.id)}
              >
                <Text style={styles.targetEmoji}>💖</Text>
              </TouchableOpacity>
            ))}
          </View>

          {timeLeft === 0 && (
            <View style={styles.resultOverlay}>
              <Text style={styles.resultText}>
                {score >= 10 ? '🎉 ¡Ganaste!' : '😅 Intenta de nuevo'}
              </Text>
              <Text style={styles.resultScore}>Puntos: {score}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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
    marginTop: 15,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameArea: {
    backgroundColor: colors.statRowBorder,
    borderRadius: 15,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  gameContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    height: '70%',
    padding: 15,
    width: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  headerText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
  },
  resultOverlay: {
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderColor: colors.primaryLight,
    borderRadius: 20,
    borderWidth: 3,
    padding: 30,
    position: 'absolute',
    top: '40%',
  },
  resultScore: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  resultText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  target: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    width: 50,
  },
  targetEmoji: {
    fontSize: 40,
  },
  timerText: {
    color: colors.primaryDark,
    fontSize: 16,
    marginTop: 5,
  },
});