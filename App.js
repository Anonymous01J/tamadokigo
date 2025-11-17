// App.js - Con música de fondo
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Utils
import { initAudio, cleanupAudio, toggleMusic } from './utils/soundManager';
import { getEvolutionStage, getMaxStat } from './utils/evolutionSystem';

// Hooks
import usePoodlePet from './hooks/usePoodlePet';
import useAnimations from './hooks/useAnimations';

// Components
import Header from './components/Header';
import PoodleDisplay from './components/PoodleDisplay';
import StatBar from './components/StatBar';
import ActionButtons from './components/ActionButtons';
import StatsModal from './components/StatsModal';
import MiniGame from './components/MiniGame';
import MemoryGame from './components/MemoryGame';
import CatchFoodGame from './components/CatchFoodGame';
import GameSelector from './components/GameSelector';
import EvolutionBadge from './components/EvolutionBadge';
import SettingsModal from './components/SettingsModal';

// Styles
import { appStyles } from './styles/appStyles';

const getBackgroundGradient = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return ['#FFE5B4', '#FFF8DC', '#FFEFD5'];
  } else if (hour >= 12 && hour < 18) {
    return ['#87CEEB', '#ADD8E6', '#E0F6FF'];
  } else if (hour >= 18 && hour < 21) {
    return ['#FFB6C1', '#FFA07A', '#FFD700'];
  } else {
    return ['#191970', '#000033', '#0a0a2e'];
  }
};

const moodImages = {
  Feliz: require('./assets/img/poodle_happy.png'),
  Normal: require('./assets/img/poodle_normal.png'),
  Triste: require('./assets/img/poodle_sad.png'),
  Malhumorado: require('./assets/img/poodle_angry.png'),
  Cansado: require('./assets/img/poodle_normal.png'),
  Hambriento: require('./assets/img/poodle_sad.png'),
  Sucio: require('./assets/img/poodle_angry.png'),
};

const actionImages = {
  eat: require('./assets/img/poodle_eating.png'),
  play: require('./assets/img/poodle_playing.png'),
  bath: require('./assets/img/poodle_bathing.png'),
  sleep: require('./assets/img/poodle_sleeping.png'),
  pet: require('./assets/img/poodle_happy.png'),
};

export default function App() {
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showMemoryGame, setShowMemoryGame] = useState(false);
  const [showCatchGame, setShowCatchGame] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const setupAudio = async () => {
      await initAudio();
      // Activar música de fondo automáticamente
      await toggleMusic();
    };
    
    setupAudio();
    
    return () => {
      cleanupAudio();
    };
  }, []);

  const showToast = (message, type = 'success') => {
    Toast.show({
      type,
      position: 'center',
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const {
    pet,
    feedPoodle,
    playWithPoodle,
    bathePoodle,
    petPoodle,
    sleepPoodle,
    wakeUpPoodle,
    addMiniGameBonus,
    actionImage,
    reset,
  } = usePoodlePet(showToast);

  const { floatTranslate, particles } = useAnimations(pet.mood);

  // Obtener etapa y stat máximo de evolución
  const evolutionStage = getEvolutionStage(pet.daysAlive || 0);
  const maxStat = getMaxStat(evolutionStage.key, 100);

  const poodleImage =
    pet.lastAction === 'sleep'
      ? actionImages.sleep
      : actionImage
        ? actionImages[actionImage]
        : moodImages[pet.mood] || moodImages.Normal;

  const handleAction = (action, successMessage) => {
    const success = action();
    if (success) showToast(successMessage);
  };

  const handleMiniGameWin = () => {
    addMiniGameBonus();
    showToast('🎉 ¡Ganaste! +20 Felicidad', 'success');
  };

  const handleGameSelect = (gameId) => {
    setShowGameSelector(false);
    switch (gameId) {
      case 'hearts':
        setShowMiniGame(true);
        break;
      case 'memory':
        setShowMemoryGame(true);
        break;
      case 'catch':
        setShowCatchGame(true);
        break;
      default:
        break;
    }
  };

  return (
    <LinearGradient
      colors={getBackgroundGradient()}
      style={appStyles.container}
    >
      <SafeAreaView
        edges={['top', 'left', 'right', 'bottom']}
        style={appStyles.safeArea}
      >
        <Header
          daysAlive={pet.daysAlive || 0}
          onStatsPress={() => setShowStatsModal(true)}
          onSettingsPress={() => setShowSettingsModal(true)}
        />

        <View style={appStyles.mainContent}>
          <PoodleDisplay
            poodleImage={poodleImage}
            mood={pet.mood}
            floatTranslate={floatTranslate}
            particles={particles}
          />
          <View style={appStyles.statsContainer}>
            <StatBar label="Hambre" value={pet.hunger} max={maxStat} emoji="🍖" />
            <StatBar label="Energía" value={pet.energy} max={maxStat} emoji="⚡" />
            <StatBar label="Felicidad" value={pet.happiness} max={maxStat} emoji="💖" />
            <StatBar label="Limpieza" value={pet.cleanliness} max={maxStat} emoji="✨" />
          </View>

          <ActionButtons
            onFeed={() => handleAction(feedPoodle, '¡Comida servida!')}
            onPlay={() => handleAction(playWithPoodle, '¡Diviértete!')}
            onBathe={() => handleAction(bathePoodle, '¡Bañado!')}
            onPet={() => handleAction(petPoodle, '¡Sobaita!')}
            onSleep={() =>
              pet.lastAction === 'sleep'
                ? handleAction(wakeUpPoodle, '¡Despertó!')
                : handleAction(sleepPoodle, '¡A dormir!')
            }
            onGame={() => setShowGameSelector(true)}
            onReset={() => {
              reset();
              showToast('¡Poodle reiniciado!');
            }}
            isSleeping={pet.lastAction === 'sleep'}
          />
        </View>

        <StatsModal
          visible={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          pet={pet}
        />

        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />

        <GameSelector
          visible={showGameSelector}
          onClose={() => setShowGameSelector(false)}
          onSelectGame={handleGameSelect}
        />

        <MiniGame
          visible={showMiniGame}
          onClose={() => setShowMiniGame(false)}
          onWin={handleMiniGameWin}
        />

        <MemoryGame
          visible={showMemoryGame}
          onClose={() => setShowMemoryGame(false)}
          onWin={handleMiniGameWin}
        />

        <CatchFoodGame
          visible={showCatchGame}
          onClose={() => setShowCatchGame(false)}
          onWin={handleMiniGameWin}
        />

        <Toast />
      </SafeAreaView>
    </LinearGradient>
  );
}