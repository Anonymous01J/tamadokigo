// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const savePetState = async (state) => {
  try {
    await AsyncStorage.setItem('petState', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving pet state:', e);
  }
};

export const loadPetState = async () => {
  try {
    const state = await AsyncStorage.getItem('petState');
    return state ? JSON.parse(state) : null;
  } catch (e) {
    console.error('Error loading pet state:', e);
    return null;
  }
};
