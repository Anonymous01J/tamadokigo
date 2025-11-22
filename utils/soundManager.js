// utils/soundManager.js
import { Platform } from 'react-native';
import * as ExpoAV from 'expo-av';

const { Audio } = ExpoAV || {};
const isWeb = Platform.OS === 'web';

let soundEnabled = true;
let musicEnabled = false;
let musicInterval = null;

const sounds = {};
const backgroundMusic = {
  sound: null,
  currentFile: null,
};

const getBackgroundMusicFile = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return require('../assets/music/morning.mp3'); // Mañana
  } else if (hour >= 12 && hour < 18) {
    return require('../assets/music/day.mp3'); // Tarde
  } else if (hour >= 18 && hour < 21) {
    return require('../assets/music/sunset.mp3'); // Atardecer
  } else {
    return require('../assets/music/night.mp3'); // Noche
  }
};

const soundFiles = {
  eat: require('../assets/sounds/eat.mp3'),
  play: require('../assets/sounds/play.mp3'),
  sleep: require('../assets/sounds/sleep.mp3'),
  pet: require('../assets/sounds/pet.mp3'),
  bath: require('../assets/sounds/bath.mp3'),
  achievement: require('../assets/sounds/achievement.mp3'),
  levelUp: require('../assets/sounds/levelup.mp3'),
  gameWin: require('../assets/sounds/win.mp3'),
  gameLose: require('../assets/sounds/lose.mp3'),
};

export const initAudio = async () => {
  if (isWeb || !Audio || !Audio.Sound) {
    console.warn(
      '🎧 Audio no disponible en Snack Web, se usará fallback silencioso.'
    );
    return;
  }
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    // Cargar preferencias guardadas
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const soundPref = await AsyncStorage.getItem('soundEnabled');
    const musicPref = await AsyncStorage.getItem('musicEnabled');
    
    if (soundPref !== null) {
      soundEnabled = soundPref === 'true';
    }
    if (musicPref !== null) {
      musicEnabled = musicPref === 'true';
      if (musicEnabled) {
        await playBackgroundMusic();
        startMusicWatcher();
      }
    }
    
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

export const toggleSound = async () => {
  soundEnabled = !soundEnabled;
  console.log(`🔊 Sonidos: ${soundEnabled ? 'Activados' : 'Desactivados'}`);
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.setItem('soundEnabled', soundEnabled.toString());
  return soundEnabled;
};

export const isSoundEnabled = () => soundEnabled;
export const isMusicEnabled = () => musicEnabled;

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
    const musicFile = getBackgroundMusicFile();
    const { sound } = await Audio.Sound.createAsync(musicFile, {
      isLooping: true,
      volume: 0.5,
    });
    backgroundMusic.sound = sound;
    backgroundMusic.currentFile = musicFile;
    await sound.playAsync();
    console.log('🎵 Música de fondo iniciada según franja horaria.');
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
    backgroundMusic.currentFile = null;
    console.log('🎵 Música de fondo detenida.');
  } catch (error) {
    console.error('Error al detener música de fondo:', error);
  }
};

export const toggleMusic = async () => {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    await playBackgroundMusic();
    startMusicWatcher();
  } else {
    await stopBackgroundMusic();
    stopMusicWatcher();
  }
  
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.setItem('musicEnabled', musicEnabled.toString());
  
  return musicEnabled;
};

// --- Watcher para cambios en vivo ---
export const startMusicWatcher = () => {
  if (musicInterval) return; // evitar duplicados
  musicInterval = setInterval(async () => {
    if (!musicEnabled) return;

    const newFile = getBackgroundMusicFile();
    const currentFile = backgroundMusic.currentFile;

    if (newFile !== currentFile) {
      console.log('⏰ Cambio de franja detectado, actualizando música...');
      // Fade out
      try {
        await backgroundMusic.sound.setVolumeAsync(0.0);
        await stopBackgroundMusic();
      } catch (error) {
        console.error('Error en fade out:', error);
      }
      // Fade in nueva pista
      try {
        const { sound } = await Audio.Sound.createAsync(newFile, {
          isLooping: true,
          volume: 0.0,
        });
        backgroundMusic.sound = sound;
        backgroundMusic.currentFile = newFile;
        await sound.playAsync();
        // subir volumen progresivamente
        let vol = 0.0;
        const fade = setInterval(async () => {
          vol += 0.1;
          if (vol >= 0.5) {
            vol = 0.5;
            clearInterval(fade);
          }
          await sound.setVolumeAsync(vol);
        }, 300);
        console.log('🎵 Música de fondo cambiada con fade.');
      } catch (error) {
        console.error('Error al iniciar nueva música:', error);
      }
    }
  }, 60 * 1000); // cada minuto
};

export const stopMusicWatcher = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
};