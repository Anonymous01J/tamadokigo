// hooks/usePoodlePet.js - Con notificaciones programadas
import { useState, useEffect, useRef } from 'react';
import { loadPetState, savePetState } from '../utils/storage';
import {
  sendPoodleNotification,
  initNotifications,
  scheduleStatNotifications,
  scheduleDailyReminder,
  cancelAllScheduledNotifications,
} from '../utils/notifications';
import { playSound } from '../utils/soundManager';
import {
  getEvolutionStage,
  shouldEvolve,
  getMaxStat,
  applyDecayMultiplier,
  getEvolutionBonus,
  getEvolutionMessage,
} from '../utils/evolutionSystem';

const defaultState = {
  hunger: 100,
  energy: 100,
  happiness: 100,
  cleanliness: 100,
  mood: 'Feliz',
  lastUpdate: Date.now(),
  lastAction: null,
  daysAlive: 0,
  birthDate: Date.now(),
  totalDaysAlive: 0,
  deaths: 0,
  achievements: [],
  evolutionStage: 'BABY',
  stats: {
    timesPlayed: 0,
    timesFed: 0,
    timesBathed: 0,
    timesPetted: 0,
  },
  lastNotificationTime: 0,
};

export default function usePoodlePet(showToast) {
  const [pet, setPet] = useState(defaultState);
  const sleepIntervalRef = useRef(null);
  const [actionImage, setActionImage] = useState(null);
  const actionTimeoutRef = useRef(null);

  const calculateDaysAlive = (birthDate) => {
    const now = Date.now();
    const diff = now - birthDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchState = async () => {
      const stored = await loadPetState();
      if (stored) {
        setPet({
          ...stored,
          daysAlive: calculateDaysAlive(stored.birthDate),
          evolutionStage: stored.evolutionStage || 'BABY',
        });
      }
    };
    fetchState();
    
    // Inicializar notificaciones
    initNotifications().then((granted) => {
      if (granted) {
        scheduleDailyReminder(); // Programar recordatorio diario
      }
    });
  }, []);

  useEffect(() => {
    savePetState(pet);
    
    // Actualizar notificaciones programadas cuando cambien los stats
    scheduleStatNotifications({
      hunger: pet.hunger,
      energy: pet.energy,
      happiness: pet.happiness,
      cleanliness: pet.cleanliness,
    });
  }, [pet]);

  const getMood = (state) => {
    if (state.lastAction === 'sleep') return state.mood;
    if (state.hunger < 25) return 'Hambriento';
    if (state.cleanliness < 30) return 'Sucio';
    if (state.energy < 30) return 'Cansado';
    const avg = (state.hunger + state.energy + state.happiness + state.cleanliness) / 4;
    if (avg > 75) return 'Feliz';
    if (avg > 50) return 'Normal';
    if (avg > 25) return 'Triste';
    return 'Malhumorado';
  };

  const checkAchievements = (newPet) => {
    const newAchievements = [];
    if (newPet.daysAlive >= 7 && !newPet.achievements.includes('week_survivor')) {
      newAchievements.push('week_survivor');
      showToast('🏆 Logro: ¡Sobrevivió 7 días!', 'success');
      playSound('achievement');
      sendPoodleNotification('🏆 Logro desbloqueado', '¡Doki sobrevivió 7 días!');
    }
    if (newPet.stats.timesFed >= 50 && !newPet.achievements.includes('master_chef')) {
      newAchievements.push('master_chef');
      showToast('🏆 Logro: ¡Chef Maestro!', 'success');
      playSound('achievement');
      sendPoodleNotification('🏆 Logro desbloqueado', '¡Chef Maestro alcanzado!');
    }
    if (newPet.stats.timesPlayed >= 30 && !newPet.achievements.includes('playmate')) {
      newAchievements.push('playmate');
      showToast('🏆 Logro: ¡Compañero de juegos!', 'success');
      playSound('achievement');
      sendPoodleNotification('🏆 Logro desbloqueado', '¡Compañero de juegos!');
    }
    const maxStat = getMaxStat(newPet.evolutionStage, 100);
    const allStatsMax = newPet.hunger === maxStat && newPet.energy === maxStat && newPet.happiness === maxStat && newPet.cleanliness === maxStat;
    if (allStatsMax && !newPet.achievements.includes('perfect_care')) {
      newAchievements.push('perfect_care');
      showToast('🏆 Logro: ¡Cuidado Perfecto!', 'success');
      playSound('achievement');
      sendPoodleNotification('🏆 Logro desbloqueado', '¡Cuidado Perfecto!');
    }
    return newAchievements;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prev) => {
        const now = Date.now();
        const elapsedMinutes = Math.floor((now - prev.lastUpdate) / 60000);
        if (elapsedMinutes < 1) return prev;

        const stage = prev.evolutionStage || 'BABY';
        const energyDecrement = prev.lastAction === 'sleep' ? 0 : applyDecayMultiplier(stage, elapsedMinutes * 2);

        const newState = {
          ...prev,
          hunger: Math.max(prev.hunger - applyDecayMultiplier(stage, elapsedMinutes * 3), 0),
          energy: Math.max(prev.energy - energyDecrement, 0),
          happiness: Math.max(prev.happiness - applyDecayMultiplier(stage, elapsedMinutes * 2), 0),
          cleanliness: Math.max(prev.cleanliness - applyDecayMultiplier(stage, elapsedMinutes * 1), 0),
          lastUpdate: now,
          daysAlive: calculateDaysAlive(prev.birthDate),
        };

        if (shouldEvolve(prev.evolutionStage, newState.daysAlive)) {
          const newStageData = getEvolutionStage(newState.daysAlive);
          const bonus = getEvolutionBonus(newStageData.key);

          playSound('levelUp');
          const evolutionMsg = getEvolutionMessage(newStageData.key);
          showToast(evolutionMsg, 'success');
          sendPoodleNotification('🌟 ¡Evolución!', evolutionMsg);

          newState.evolutionStage = newStageData.key;
          const maxStat = getMaxStat(newStageData.key, 100);
          newState.hunger = Math.min(newState.hunger + bonus.hunger, maxStat);
          newState.energy = Math.min(newState.energy + bonus.energy, maxStat);
          newState.happiness = Math.min(newState.happiness + bonus.happiness, maxStat);
          newState.cleanliness = Math.min(newState.cleanliness + bonus.cleanliness, maxStat);
        }

        newState.mood = getMood(newState);

        const isDead = newState.hunger === 0 && newState.energy === 0 && newState.happiness === 0 && newState.cleanliness === 0;

        if (isDead && prev.hunger > 0) {
          showToast('💀 Doki ha muerto... RIP', 'error');
          sendPoodleNotification('😢 Doki murió', 'Cuida mejor a tu próxima mascota');
          cancelAllScheduledNotifications(); // Limpiar notificaciones del Poodle anterior
          return {
            ...defaultState,
            totalDaysAlive: prev.totalDaysAlive + prev.daysAlive,
            deaths: prev.deaths + 1,
            birthDate: Date.now(),
            achievements: prev.achievements,
            stats: prev.stats,
            lastNotificationTime: 0,
            evolutionStage: 'BABY',
          };
        }

        return newState;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [showToast]);

  // Este useEffect ya no es necesario, las notificaciones se programan automáticamente
  // pero lo dejo comentado por si quieres mantener notificaciones inmediatas adicionales
  /*
  useEffect(() => {
    const notificationInterval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastNotification = now - pet.lastNotificationTime;
        const NOTIFICATION_COOLDOWN = 15 * 60 * 1000;

        if (pet.lastAction === 'sleep' || timeSinceLastNotification < NOTIFICATION_COOLDOWN) {
          return;
        }

        if (pet.hunger < 15) {
          sendPoodleNotification('🚨 ¡URGENTE!', 'Doki se está muriendo de hambre');
          setPet((prev) => ({ ...prev, lastNotificationTime: now }));
        } else if (pet.energy < 15 && pet.lastAction !== 'sleep') {
          sendPoodleNotification('😴 Muy cansado', 'Doki necesita dormir YA');
          setPet((prev) => ({ ...prev, lastNotificationTime: now }));
        } else if (pet.cleanliness < 15) {
          sendPoodleNotification('🤢 Muy sucio', 'Doki necesita un baño urgente');
          setPet((prev) => ({ ...prev, lastNotificationTime: now }));
        } else if (pet.happiness < 15) {
          sendPoodleNotification('😭 Muy triste', 'Doki necesita atención');
          setPet((prev) => ({ ...prev, lastNotificationTime: now }));
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(notificationInterval);
  }, [pet.hunger, pet.energy, pet.cleanliness, pet.happiness, pet.lastAction, pet.lastNotificationTime]);
  */

  const showActionImage = (imageKey) => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    setActionImage(imageKey);
    actionTimeoutRef.current = setTimeout(() => {
      setActionImage(null);
    }, 2100);
  };

  const updatePet = (modifier) => {
    setPet((prev) => {
      const modified = modifier(prev);
      const updated = { ...prev, ...modified, lastUpdate: Date.now(), lastAction: modified.lastAction ?? prev.lastAction };
      updated.mood = getMood(updated);

      const newAchievements = checkAchievements(updated);
      if (newAchievements.length > 0) {
        updated.achievements = [...updated.achievements, ...newAchievements];
      }

      return updated;
    });
  };

  const feedPoodle = () => {
    if (pet.lastAction === 'sleep') {
      showToast('Zzz... Déjalo dormir vale.', 'error');
      return false;
    }
    const maxStat = getMaxStat(pet.evolutionStage, 100);
    if (pet.hunger >= maxStat - 5) {
      showToast('Está jarto. Guárdaselo para más tarde.', 'error');
      return false;
    }
    playSound('eat');
    showActionImage('eat');
    updatePet((p) => ({
      hunger: Math.min(p.hunger + 20, getMaxStat(p.evolutionStage, 100)),
      happiness: Math.min(p.happiness + 10, getMaxStat(p.evolutionStage, 100)),
      cleanliness: Math.max(p.cleanliness - 5, 0),
      lastAction: 'eat',
      stats: { ...p.stats, timesFed: p.stats.timesFed + 1 },
    }));
    return true;
  };

  const playWithPoodle = () => {
    if (pet.lastAction === 'sleep') {
      showToast('Zzz... Déjalo dormir vale.', 'error');
      return false;
    }
    if (pet.energy < 20) {
      showToast('Anda es mamado. Ponlo a echarse un camaroncito.', 'error');
      return false;
    }
    if (pet.hunger < 20) {
      showToast('Carga es hambre. Prepárale alguito antes.', 'error');
      return false;
    }
    playSound('play');
    showActionImage('play');
    updatePet((p) => ({
      energy: Math.max(p.energy - 20, 0),
      happiness: Math.min(p.happiness + 20, getMaxStat(p.evolutionStage, 100)),
      cleanliness: Math.max(p.cleanliness - 10, 0),
      hunger: Math.max(p.hunger - 15, 0),
      lastAction: 'play',
      stats: { ...p.stats, timesPlayed: p.stats.timesPlayed + 1 },
    }));
    return true;
  };

  const bathePoodle = () => {
    if (pet.lastAction === 'sleep') {
      showToast('¿Lo quieres bañar mientras duerme? ¿Te pica el culo?','error');
      return false;
    }
    const maxStat = getMaxStat(pet.evolutionStage, 100);
    if (pet.cleanliness > maxStat - 5) {
      showToast('¿Más baño? Un poco más y le echas cloro.', 'error');
      return false;
    }
    playSound('bath');
    showActionImage('bath');
    updatePet((p) => ({
      cleanliness: getMaxStat(p.evolutionStage, 100),
      happiness: Math.max(p.happiness - 5, 0),
      lastAction: 'bath',
      stats: { ...p.stats, timesBathed: p.stats.timesBathed + 1 },
    }));
    return true;
  };

  const petPoodle = () => {
    if (pet.lastAction === 'sleep') {
      showToast('Si lo jodes mientras duerme, se va a arrechar.', 'error');
      return false;
    }
    if (pet.happiness < 10) {
      showToast('Anda arrecho. Te puede es morder.', 'error');
      return false;
    }
    playSound('pet');
    showActionImage('pet');
    updatePet((p) => ({
      happiness: Math.min(p.happiness + 15, getMaxStat(p.evolutionStage, 100)),
      lastAction: 'pet',
      stats: { ...p.stats, timesPetted: p.stats.timesPetted + 1 },
    }));
    return true;
  };

  const sleepPoodle = () => {
    if (pet.lastAction === 'sleep') {
      showToast('Ya está dormido.', 'error');
      return false;
    }
    if (pet.energy > 80) {
      showToast('Ese anda es activo. Ponte a jugar con él para mamarlo.','error');
      return false;
    }
    if (pet.cleanliness < 30) {
      showToast('Está percudido. Debes bañarlo, cochina.', 'error');
      return false;
    }
    if (pet.hunger < 30) {
      showToast('¿Lo vas a acostar con hambre? Dale algo, floja.', 'error');
      return false;
    }
    playSound('sleep');
    showActionImage('sleep');
    updatePet(() => ({ lastAction: 'sleep', sleepStartTime: Date.now() }));

    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    sleepIntervalRef.current = setInterval(() => {
      setPet((prev) => {
        if (prev.lastAction !== 'sleep') {
          clearInterval(sleepIntervalRef.current);
          return prev;
        }
        const maxEnergy = getMaxStat(prev.evolutionStage, 100);
        const newEnergy = Math.min(prev.energy + 10, maxEnergy);
        const hasFullyRecovered = newEnergy >= maxEnergy;
        if (hasFullyRecovered) {
          playSound('pet');
          showToast('😊 Doki se despertó descansado', 'success');
        }
        return {
          ...prev,
          energy: newEnergy,
          lastUpdate: Date.now(),
          ...(hasFullyRecovered && { lastAction: null, sleepStartTime: null }),
          mood: getMood({ ...prev, energy: newEnergy, lastAction: hasFullyRecovered ? null : 'sleep' }),
        };
      });
    }, 60000);
    return true;
  };

  const wakeUpPoodle = () => {
    if (pet.lastAction !== 'sleep') {
      showToast('Ya está despierto.', 'error');
      return false;
    }
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
    playSound('pet');
    setPet((prev) => ({
      ...prev,
      lastAction: null,
      sleepStartTime: null,
      mood: getMood({ ...prev, lastAction: null }),
    }));
    return true;
  };

  const addMiniGameBonus = () => {
    playSound('gameWin');
    updatePet((p) => ({
      happiness: Math.min(p.happiness + 20, getMaxStat(p.evolutionStage, 100)),
    }));
  };

  const reset = () => {
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
    }
    cancelAllScheduledNotifications(); // Limpiar notificaciones al resetear
    setPet({
      ...defaultState,
      birthDate: Date.now(),
      evolutionStage: 'BABY',
    });
  };

  useEffect(() => {
    return () => {
      if (sleepIntervalRef.current) {
        clearInterval(sleepIntervalRef.current);
      }
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
    };
  }, []);

  return {
    pet,
    feedPoodle,
    playWithPoodle,
    bathePoodle,
    petPoodle,
    sleepPoodle,
    wakeUpPoodle,
    addMiniGameBonus,
    reset,
    actionImage,
  };
}