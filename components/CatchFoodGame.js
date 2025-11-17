import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { playSound } from '../utils/soundManager';
import { colors } from '../styles/appStyles';

const WINDOW = Dimensions.get('window');
const SCREEN_WIDTH = WINDOW.width;
const SCREEN_HEIGHT = WINDOW.height * 0.95;
const GAME_WIDTH = SCREEN_WIDTH * 1; // ✅ Cambiar de 0.9 a 1 (100% del ancho)
const BASKET_WIDTH = 60;
const FOOD_SIZE = 40;

const FOODS = ['🍖', '🦴', '🥩', '🍗', '🌭', '🥓'];
const BAD_ITEMS = ['💩', '🧨', '☠️'];

export default function CatchFoodGame({ visible, onClose, onWin }) {
  const [basketPosition, setBasketPosition] = useState(
    (SCREEN_WIDTH * 0.9) / 2 - BASKET_WIDTH / 2
  );
  const basketPanRef = useRef(basketPosition);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        basketPanRef.current = basketPosition;
      },

      onPanResponderMove: (_, gestureState) => {
        const newPos = basketPanRef.current + gestureState.dx;
        const clampedPos = Math.max(
          0,
          Math.min(GAME_WIDTH - BASKET_WIDTH, newPos)
        );
        setBasketPosition(clampedPos);
      },

      onPanResponderRelease: () => {
        basketPanRef.current = basketPosition;
      },
    })
  ).current;

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [fallingItems, setFallingItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const gameIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const listenersRef = useRef([]);
  const gameEndedRef = useRef(false);
  const createItemFuncRef = useRef(null); // ✅ Nueva ref para la función

  const cleanupListeners = useCallback(() => {
    listenersRef.current.forEach((listenerId) => {
      try {
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
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;

      console.log('🏁 Finalizando juego...');

      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      cleanupListeners();

      setFallingItems((items) => {
        items.forEach((item) => {
          try {
            item.y.stopAnimation();
            item.y.removeAllListeners();
          } catch (error) {
            console.warn('Error deteniendo animación:', error);
          }
        });
        return [];
      });

      setGameStarted(false);

      if (won) {
        playSound('gameWin');
        onWin();
      } else {
        playSound('gameLose');
      }
      gameEndedRef.current = false;
      onClose();
    },
    [onClose, onWin, cleanupListeners]
  ); // ✅ Eliminamos score y fallingItems

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

    console.log('🍖 Creando item:', newItem.emoji, 'en x:', newItem.x);
    setFallingItems((prev) => {
      console.log('📦 Items actuales:', prev.length);
      return [...prev, newItem];
    });

    Animated.timing(newItem.y, {
      toValue: SCREEN_HEIGHT * 0.55,
      duration: 3000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      console.log('🎯 Animación terminó:', finished, 'Item:', newItem.emoji);
      if (finished) {
        setFallingItems((prev) => prev.filter((i) => i.id !== newItem.id));

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
  }, []); // ✅ SIN dependencias

  const startGame = useCallback(() => {
    gameEndedRef.current = false;
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    setFallingItems([]);
    const initialPos = GAME_WIDTH / 2 - BASKET_WIDTH / 2;
    setBasketPosition(initialPos);
    basketPanRef.current = initialPos;

    cleanupListeners();

    console.log('🎮 Juego iniciado!');

    // Timer del juego
    const timer = setInterval(() => {
      console.log('⏱️ Timer tick');
      setTimeLeft((prev) => {
        console.log('⏱️ Tiempo:', prev);
        if (prev <= 1) {
          console.log('⏰ Tiempo agotado!');
          clearInterval(timer);
          if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
          gameEndedRef.current = true;
          setTimeout(() => {
            setGameStarted(false);
            playSound('gameLose');
            onClose();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = timer;

    // Crear items cayendo usando la ref
    const gameInterval = setInterval(() => {
      console.log('⏰ Intervalo ejecutándose...');
      if (createItemFuncRef.current) {
        createItemFuncRef.current();
      }
    }, 800);
    gameIntervalRef.current = gameInterval;

    console.log('✅ Intervalos creados:', { timer, gameInterval });
  }, [cleanupListeners, onClose]);

  const checkCollision = useCallback(
    (item, itemY) => {
      const basketY = SCREEN_HEIGHT * 0.55 - 80;
      const isYCollision = itemY >= basketY - 20 && itemY <= basketY + 20;
      const isXCollision =
        item.x >= basketPosition - 20 &&
        item.x <= basketPosition + BASKET_WIDTH - 20;

      return isYCollision && isXCollision;
    },
    [basketPosition]
  );

  useEffect(() => {
    if (visible && !gameStarted) {
      // Pequeño delay para asegurar que el componente está montado
      const timeout = setTimeout(() => {
        startGame();
      }, 100);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (gameIntervalRef.current) {
        console.log('🧹 Limpiando intervalo de items');
        clearInterval(gameIntervalRef.current);
      }
      if (timerRef.current) {
        console.log('🧹 Limpiando timer');
        clearInterval(timerRef.current);
      }
      cleanupListeners();
    };
  }, [visible, gameStarted, startGame, cleanupListeners]);

  // ✅ NUEVO: Manejar intervalos directamente con useEffect
  useEffect(() => {
    if (!gameStarted) return;

    console.log('🔄 Iniciando intervalos desde useEffect');

    // Timer
    const timer = setInterval(() => {
      console.log('⏱️ Timer tick desde useEffect');
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Game items
    const gameInterval = setInterval(() => {
      console.log('⏰ Creando item desde useEffect');
      createFallingItem();
    }, 800);

    return () => {
      console.log('🧹 Cleanup de intervalos useEffect');
      clearInterval(timer);
      clearInterval(gameInterval);
    };
  }, [gameStarted, createFallingItem]);

  useEffect(() => {
    const currentListeners = [];

    fallingItems.forEach((item) => {
      const listenerId = item.y.addListener(({ value }) => {
        if (checkCollision(item, value)) {
          item.y.removeListener(listenerId);
          item.y.stopAnimation();

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

    listenersRef.current = currentListeners.map((l) => ({
      remove: () => l.animValue.removeListener(l.id),
    }));

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

  // ✅ Verificar victoria usando useEffect
  useEffect(() => {
    if (score >= 100 && gameStarted && !gameEndedRef.current) {
      console.log('🎉 Victoria alcanzada!');
      gameEndedRef.current = true;
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupListeners();
      setGameStarted(false);
      playSound('gameWin');
      onWin();
      onClose();
    }
  }, [score, gameStarted, cleanupListeners, onWin, onClose]);

  // ✅ Verificar game over por vidas
  useEffect(() => {
    if (lives <= 0 && gameStarted && !gameEndedRef.current) {
      console.log('💀 Game Over - Sin vidas!');
      endGame(false);
    }
  }, [lives, gameStarted, endGame]);

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
      onRequestClose={onClose}>
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
                ]}>
                {item.emoji}
              </Animated.Text>
            ))}

            <View
              {...panResponder.panHandlers}
              style={[styles.basket, { left: basketPosition }]}>
              <Text style={styles.basketEmoji}>🧺</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => moveBasket(-1)}>
              <Text style={styles.controlText}>⬅️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => moveBasket(1)}>
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
    bottom: 10,
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
    height: SCREEN_HEIGHT * 0.55,
    overflow: 'hidden',
    position: 'relative',
    width: '100%', // ✅ Cambiar GAME_WIDTH por '100%'
  },
  gameContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: SCREEN_WIDTH * 1,
    maxHeight: SCREEN_HEIGHT * 0.9,
    alignSelf: 'center',
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
