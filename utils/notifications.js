// utils/notifications.js - Con notificaciones programadas
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar cómo se muestran las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// IDs de notificaciones programadas
const NOTIFICATION_IDS = {
  HUNGER: 'hunger-reminder',
  ENERGY: 'energy-reminder',
  HAPPINESS: 'happiness-reminder',
  CLEANLINESS: 'cleanliness-reminder',
};

export async function initNotifications() {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('⚠️ No se concedieron permisos para notificaciones');
    return false;
  }

  console.log('✅ Permisos de notificaciones concedidos');

  // Configurar canal de Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios de Doki',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e91e63',
    });
  }

  // Obtener push token (opcional, para notificaciones remotas futuras)
  if (Device.isDevice) {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Push token:', token);
    } catch (error) {
      console.warn('No se pudo obtener push token:', error);
    }
  }

  return true;
}

// Enviar notificación inmediata
export async function sendPoodleNotification(title, body) {
  try {
    const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
    
    if (notificationsEnabled === 'false') {
      console.log('🔕 Notificaciones desactivadas por el usuario');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'immediate' },
      },
      trigger: null, // Inmediata
    });
    
    console.log('📢 Notificación enviada:', title);
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}

// Programar notificaciones recurrentes según el estado del Poodle
export async function scheduleStatNotifications(petStats) {
  try {
    const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
    
    if (notificationsEnabled === 'false') {
      console.log('🔕 Notificaciones desactivadas, cancelando programadas');
      await cancelAllScheduledNotifications();
      return;
    }

    // Cancelar notificaciones anteriores
    await cancelAllScheduledNotifications();

    const { hunger, energy, happiness, cleanliness } = petStats;

    // Notificación de hambre (cada 2 horas si está bajo)
    if (hunger < 50) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.HUNGER,
        content: {
          title: '🍖 Doki tiene hambre',
          body: hunger < 25 ? '¡Está MUY hambriento! Aliméntalo pronto.' : 'Dale algo de comer.',
          sound: true,
          data: { type: 'hunger' },
        },
        trigger: {
          seconds: 60 * 60 * 2, // 2 horas
          repeats: true,
        },
      });
    }

    // Notificación de energía (cada 3 horas si está bajo)
    if (energy < 50) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.ENERGY,
        content: {
          title: '😴 Doki está cansado',
          body: energy < 25 ? '¡Está agotado! Ponlo a dormir.' : 'Necesita descansar un poco.',
          sound: true,
          data: { type: 'energy' },
        },
        trigger: {
          seconds: 60 * 60 * 3, // 3 horas
          repeats: true,
        },
      });
    }

    // Notificación de felicidad (cada 4 horas si está bajo)
    if (happiness < 50) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.HAPPINESS,
        content: {
          title: '😢 Doki está triste',
          body: happiness < 25 ? '¡Está muy triste! Juega con él.' : 'Dale atención y cariño.',
          sound: true,
          data: { type: 'happiness' },
        },
        trigger: {
          seconds: 60 * 60 * 4, // 4 horas
          repeats: true,
        },
      });
    }

    // Notificación de limpieza (cada 6 horas si está bajo)
    if (cleanliness < 50) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.CLEANLINESS,
        content: {
          title: '🛁 Doki está sucio',
          body: cleanliness < 25 ? '¡Está muy sucio! Bañalo ya.' : 'Necesita un baño.',
          sound: true,
          data: { type: 'cleanliness' },
        },
        trigger: {
          seconds: 60 * 60 * 6, // 6 horas
          repeats: true,
        },
      });
    }

    console.log('⏰ Notificaciones programadas actualizadas');
  } catch (error) {
    console.error('Error programando notificaciones:', error);
  }
}

// Programar notificación diaria de recordatorio
export async function scheduleDailyReminder() {
  try {
    const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
    
    if (notificationsEnabled === 'false') {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-reminder',
      content: {
        title: '🐾 ¡No olvides a Doki!',
        body: 'Hace tiempo que no lo visitas. ¡Te está esperando!',
        sound: true,
        data: { type: 'daily' },
      },
      trigger: {
        hour: 20, // 8 PM
        minute: 0,
        repeats: true,
      },
    });

    console.log('⏰ Recordatorio diario programado para las 8 PM');
  } catch (error) {
    console.error('Error programando recordatorio diario:', error);
  }
}

// Cancelar todas las notificaciones programadas
export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Todas las notificaciones programadas canceladas');
  } catch (error) {
    console.error('Error cancelando notificaciones:', error);
  }
}

// Obtener notificaciones programadas (para debug)
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Notificaciones programadas:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return [];
  }
}

// Listener para cuando el usuario toca una notificación
export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Listener para cuando llega una notificación (app en foreground)
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}