// hooks/useAnimations.js
import { useState, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export default function useAnimations(mood) {
  const [particles, setParticles] = useState([]);
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Animación flotante
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  // Crear partículas cuando está feliz
  useEffect(() => {
    if (mood === 'Feliz') {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: Math.random() * 140 - 70,
        };
        setParticles((prev) => [...prev, newParticle]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
        }, 2000);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [mood]);

  return { floatTranslate, particles };
}
