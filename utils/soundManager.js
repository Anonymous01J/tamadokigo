// utils/soundManager.js
import { Platform } from 'react-native';
import * as ExpoAV from 'expo-av';

const { Audio } = ExpoAV || {};
const isWeb = Platform.OS === 'web';

let soundEnabled = true;
let musicEnabled = false;

const sounds = {};
const backgroundMusic = { sound: null };

const soundFiles = {
  eat: require('../assets/sounds/eat.mp3'),
  play: require('../assets/sounds/play.mp3'),
  sleep: require('../assets/sounds/sleep.mp3'),
  pet: require('../assets/sounds/pet.mp3'),
  achievement: require('../assets/sounds/achievement.mp3'),
  levelUp: require('../assets/sounds/levelup.mp3'),
  gameWin: require('../assets/sounds/win.mp3'),
  gameLose: require('../assets/sounds/lose.mp3'),
  bgMusic: require('../assets/music/night.mp3'), // ejemplo
};

export const initAudio = async () => {
  if (isWeb || !Audio || !Audio.Sound) {
    console.warn('🎧 Audio no disponible en Snack Web, se usará fallback silencioso.');
    return;
  }
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    console.log('🎧 Modo de audio configurado.');
  } catch (error) {
    console.error('Error inicializando audio:', error);
  }
};

export const playSound = async (soundName) => {
  if (!soundEnabled) return;
  if (isWeb || !Audio || !Audio.Sound) {
    console.log(`🔊 Fallback: simulando sonido '${soundName}' en Snack Web.`);
    return;
  }

  const file = soundFiles[soundName];
  if (!file) {
    console.warn(`Sonido '${soundName}' no existe.`);
    return;
  }

  try {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
    sounds[soundName] = sound;
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
        delete sounds[soundName];
      }
    });
  } catch (error) {
    console.error(`Error al reproducir '${soundName}':`, error);
  }
};

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  console.log(`🔊 Sonidos: ${soundEnabled ? 'Activados' : 'Desactivados'}`);
  return soundEnabled;
};

export const cleanupAudio = async () => {
  if (isWeb) return;
  console.log('🧹 Liberando recursos...');
  for (const sound of Object.values(sounds)) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error al liberar sonido:', error);
    }
  }
};

// --- Música de fondo ---
export const playBackgroundMusic = async () => {
  if (!musicEnabled || isWeb || !Audio || !Audio.Sound) return;
  if (backgroundMusic.sound) return;

  try {
    const { sound } = await Audio.Sound.createAsync(soundFiles.bgMusic, {
      isLooping: true,
      volume: 0.5,
    });
    backgroundMusic.sound = sound;
    await sound.playAsync();
    console.log('🎵 Música de fondo iniciada.');
  } catch (error) {
    console.error('Error al iniciar música de fondo:', error);
  }
};

export const stopBackgroundMusic = async () => {
  if (isWeb || !backgroundMusic.sound) return;
  try {
    await backgroundMusic.sound.stopAsync();
    await backgroundMusic.sound.unloadAsync();
    backgroundMusic.sound = null;
    console.log('🎵 Música de fondo detenida.');
  } catch (error) {
    console.error('Error al detener música de fondo:', error);
  }
};

export const toggleMusic = async () => {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    await playBackgroundMusic();
  } else {
    await stopBackgroundMusic();
  }
  return musicEnabled;
};
