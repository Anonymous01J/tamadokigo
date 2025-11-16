// utils/notifications.js - Compatible con Expo Go
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function initNotifications() {
  if (Platform.OS === 'web') return;

  // ⚠️ EN EXPO GO: Las notificaciones programadas no funcionan completamente
  // Solo funcionan notificaciones básicas
  console.log('⚠️ Notificaciones en modo desarrollo (Expo Go)');

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('No se concedieron permisos para notificaciones!');
    return;
  }

  // ✅ Esto funciona en Expo Go
  if (Device.isDevice) {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
    } catch (error) {
      console.warn('No se pudo obtener push token en Expo Go:', error);
    }
  }

  // Android config
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export function sendPoodleNotification(title, body) {
  // ⚠️ EN EXPO GO: Las notificaciones locales tienen limitaciones
  // Solo mostrar en consola en desarrollo
  if (__DEV__) {
    console.log('📢 Notificación:', title, '-', body);
  }

  // Intentar enviar notificación (puede no funcionar en Expo Go)
  try {
    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('No se pudo enviar notificación en Expo Go:', error);
  }
}