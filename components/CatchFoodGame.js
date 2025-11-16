import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { playSound } from '../utils/soundManager';
import { colors } from '../styles/appStyles';

const SCREEN_WIDTH = Dimensions.get('window').width * 0.9;
const GAME_WIDTH = SCREEN_WIDTH - 40;
const BASKET_WIDTH = 60;
const FOOD_SIZE = 40;

const FOODS = ['🍖', '🦴', '🥩', '🍗', '🌭', '🥓'];
const BAD_ITEMS = ['💩', '🧨', '☠️'];

export default function CatchFoodGame({ visible, onClose, onWin }) {
  const [basketPosition, setBasketPosition] = useState(
    GAME_WIDTH / 2 - BASKET_WIDTH / 2
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [fallingItems, setFallingItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const gameIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const listenersRef = useRef([]); // ✅ Para rastrear todos los listeners
  const gameEndedRef = useRef(false); // ✅ Prevenir múltiples llamadas a endGame

  // ✅ Limpiar todos los listeners activos
  const cleanupListeners = useCallback(() => {
    listenersRef.current.forEach((listenerId) => {
      try {
        // Remover listener si existe
        if (listenerId && listenerId.remove) {
          listenerId.remove();
        }
      } catch (error) {
        console.warn('Error limpiando listener:', error);
      }
    });
    listenersRef.current = [];
  }, []);

  const endGame = useCallback(
    (won) => {
      // ✅ Prevenir múltiples llamadas
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;

      // Limpiar intervalos
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // ✅ Limpiar listeners
      cleanupListeners();

      // Detener todas las animaciones
      fallingItems.forEach((item) => {
        try {
          item.y.stopAnimation();
          item.y.removeAllListeners();
        } catch (error) {
          console.warn('Error deteniendo animación:', error);
        }
      });

      setGameStarted(false);
      setFallingItems([]);

      if (won || score >= 100) {
        playSound('gameWin');
        onWin();
        setTimeout(() => {
          gameEndedRef.current = false; // Reset para próximo juego
          onClose();
        }, 1500);
      } else {
        playSound('gameLose');
        setTimeout(() => {
          gameEndedRef.current = false; // Reset para próximo juego
          onClose();
        }, 1500);
      }
    },
    [onClose, onWin, score, fallingItems, cleanupListeners]
  );

  const createFallingItem = useCallback(() => {
    const isBad = Math.random() < 0.2;
    const item = isBad
      ? BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)]
      : FOODS[Math.floor(Math.random() * FOODS.length)];

    const newItem = {
      id: Date.now() + Math.random(),
      emoji: item,
      x: Math.random() * (GAME_WIDTH - FOOD_SIZE),
      y: new Animated.Value(-50),
      isBad,
    };

    setFallingItems((prev) => [...prev, newItem]);

    Animated.timing(newItem.y, {
      toValue: 450,
      duration: 3000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      // ✅ Solo si la animación terminó naturalmente
      if (finished) {
        setFallingItems((prev) => prev.filter((i) => i.id !== newItem.id));

        // Perder vida solo si no atrapó comida buena
        if (!newItem.isBad) {
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              endGame(false);
            }
            return newLives;
          });
        }
      }
    });
  }, [endGame]);

  const startGame = useCallback(() => {
    // Reset estado del juego
    gameEndedRef.current = false;
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    setFallingItems([]);
    setBasketPosition(GAME_WIDTH / 2 - BASKET_WIDTH / 2);

    // Limpiar listeners anteriores
    cleanupListeners();

    // Timer del juego
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Crear items cayendo
    gameIntervalRef.current = setInterval(() => {
      createFallingItem();
    }, 800);
  }, [endGame, createFallingItem, cleanupListeners]);

  const checkCollision = useCallback(
    (item, itemY) => {
      const basketY = 400;
      const isYCollision = itemY >= basketY - 20 && itemY <= basketY + 20;
      const isXCollision =
        item.x >= basketPosition - 20 &&
        item.x <= basketPosition + BASKET_WIDTH - 20;

      return isYCollision && isXCollision;
    },
    [basketPosition]
  );

  // ✅ Iniciar juego cuando se abre el modal
  useEffect(() => {
    if (visible && !gameStarted) {
      startGame();
    }

    // Cleanup al desmontar o cerrar modal
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupListeners();
    };
  }, [visible]); // ✅ SOLO 'visible' como dependencia

  // ✅ Sistema de colisión mejorado
  useEffect(() => {
    // Limpiar listeners anteriores antes de agregar nuevos
    const currentListeners = [];

    fallingItems.forEach((item) => {
      const listenerId = item.y.addListener(({ value }) => {
        if (checkCollision(item, value)) {
          // Remover este listener específico
          item.y.removeListener(listenerId);
          item.y.stopAnimation();

          // Remover item
          setFallingItems((prev) => prev.filter((i) => i.id !== item.id));

          if (item.isBad) {
            playSound('gameLose');
            setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                endGame(false);
              }
              return newLives;
            });
          } else {
            playSound('eat');
            setScore((prev) => prev + 10);
          }
        }
      });

      currentListeners.push({ id: listenerId, animValue: item.y });
    });

    // Guardar referencia de listeners
    listenersRef.current = currentListeners.map((l) => ({
      remove: () => l.animValue.removeListener(l.id),
    }));

    // Cleanup al actualizar
    return () => {
      currentListeners.forEach((listener) => {
        try {
          listener.animValue.removeListener(listener.id);
        } catch (error) {
          console.warn('Error removiendo listener:', error);
        }
      });
    };
  }, [fallingItems, checkCollision, endGame]);

  // ✅ Verificar victoria
  useEffect(() => {
    if (score >= 100 && gameStarted && !gameEndedRef.current) {
      endGame(true);
    }
  }, [score, gameStarted, endGame]);

  const moveBasket = (direction) => {
    setBasketPosition((prev) => {
      const newPos = prev + direction * 30;
      return Math.max(0, Math.min(GAME_WIDTH - BASKET_WIDTH, newPos));
    });
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
            <Text style={styles.headerText}>🍖 Atrapa la Comida!</Text>
            <View style={styles.stats}>
              <Text style={styles.statText}>⭐ {score}</Text>
              <Text style={styles.statText}>⏱️ {timeLeft}s</Text>
              <Text style={styles.statText}>❤️ {lives}</Text>
            </View>
          </View>

          <View style={styles.gameArea}>
            {fallingItems.map((item) => (
              <Animated.Text
                key={item.id}
                style={[
                  styles.fallingItem,
                  {
                    left: item.x,
                    transform: [{ translateY: item.y }],
                  },
                ]}
              >
                {item.emoji}
              </Animated.Text>
            ))}

            <View style={[styles.basket, { left: basketPosition }]}>
              <Text style={styles.basketEmoji}>🧺</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => moveBasket(-1)}
            >
              <Text style={styles.controlText}>⬅️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => moveBasket(1)}
            >
              <Text style={styles.controlText}>➡️</Text>
            </TouchableOpacity>
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
  basket: {
    alignItems: 'center',
    bottom: 20,
    height: BASKET_WIDTH,
    justifyContent: 'center',
    position: 'absolute',
    width: BASKET_WIDTH,
  },
  basketEmoji: {
    fontSize: 50,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderRadius: 35,
    borderWidth: 3,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  controlText: {
    fontSize: 32,
  },
  controls: {
    flexDirection: 'row',
    gap: 80,
    marginTop: 15,
  },
  fallingItem: {
    fontSize: FOOD_SIZE,
    position: 'absolute',
  },
  gameArea: {
    backgroundColor: colors.statRowBorder,
    borderColor: colors.primaryLight,
    borderRadius: 15,
    borderWidth: 3,
    height: 450,
    overflow: 'hidden',
    position: 'relative',
    width: GAME_WIDTH,
  },
  gameContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    height: '75%',
    padding: 20,
    width: SCREEN_WIDTH,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  headerText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
  },
});
