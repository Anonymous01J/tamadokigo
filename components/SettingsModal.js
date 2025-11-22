import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { colors, modalStyles } from '../styles/appStyles';
import { toggleMusic, toggleSound, isMusicEnabled, isSoundEnabled } from '../utils/soundManager';
import { cancelAllScheduledNotifications, scheduleStatNotifications, scheduleDailyReminder } from '../utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsModal({ visible, onClose, pet }) {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Cargar preferencias al abrir el modal
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      // Obtener estado real desde soundManager
      setMusicEnabled(isMusicEnabled());
      setSoundEnabled(isSoundEnabled());
      
      const notifPref = await AsyncStorage.getItem('notificationsEnabled');
      if (notifPref !== null) {
        setNotificationsEnabled(notifPref === 'true');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleMusicToggle = async (value) => {
    const newValue = await toggleMusic();
    setMusicEnabled(newValue);
  };

  const handleSoundToggle = async (value) => {
    const newValue = await toggleSound();
    setSoundEnabled(newValue);
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      
      if (value) {
        // Activar notificaciones: programar recordatorios
        if (pet) {
          await scheduleStatNotifications({
            hunger: pet.hunger,
            energy: pet.energy,
            happiness: pet.happiness,
            cleanliness: pet.cleanliness,
          });
        }
        await scheduleDailyReminder();
        console.log('✅ Notificaciones activadas');
      } else {
        // Desactivar notificaciones: cancelar todas
        await cancelAllScheduledNotifications();
        console.log('🔕 Notificaciones desactivadas');
      }
    } catch (error) {
      console.error('Error guardando preferencia de notificaciones:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>⚙️ Ajustes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalScroll}>
            {/* Sección de Audio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎵 Audio</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Efectos de sonido</Text>
                  <Text style={styles.settingDescription}>
                    Reproduce sonidos al interactuar (comer, jugar, etc.)
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={handleSoundToggle}
                  trackColor={{ false: colors.lightGrey, true: colors.primaryLight }}
                  thumbColor={soundEnabled ? colors.primary : colors.textPrimary}
                />
              </View>

              <View style={[styles.settingRow, { marginTop: 12 }]}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Música de fondo</Text>
                  <Text style={styles.settingDescription}>
                    Reproduce música ambiental según la hora del día
                  </Text>
                </View>
                <Switch
                  value={musicEnabled}
                  onValueChange={handleMusicToggle}
                  trackColor={{ false: colors.lightGrey, true: colors.primaryLight }}
                  thumbColor={musicEnabled ? colors.primary : colors.textPrimary}
                />
              </View>
            </View>

            {/* Sección de Notificaciones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Notificaciones push</Text>
                  <Text style={styles.settingDescription}>
                    Recibe alertas cuando tu Poodle necesite atención (incluso con la app cerrada)
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: colors.lightGrey, true: colors.primaryLight }}
                  thumbColor={notificationsEnabled ? colors.primary : colors.textPrimary}
                />
              </View>

              {notificationsEnabled && (
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationInfoTitle}>📱 Tipos de notificaciones:</Text>
                  <Text style={styles.notificationInfoText}>• Recordatorios de hambre (cada 2h)</Text>
                  <Text style={styles.notificationInfoText}>• Recordatorios de energía (cada 3h)</Text>
                  <Text style={styles.notificationInfoText}>• Recordatorios de felicidad (cada 4h)</Text>
                  <Text style={styles.notificationInfoText}>• Recordatorios de limpieza (cada 6h)</Text>
                  <Text style={styles.notificationInfoText}>• Recordatorio diario (8 PM)</Text>
                </View>
              )}
            </View>

            {/* Información */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                💡 Los cambios se guardan automáticamente
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={modalStyles.closeModalButton} 
            onPress={onClose}
          >
            <Text style={modalStyles.closeModalButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.modalBackground,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.statsContainerBackground,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  notificationInfo: {
    backgroundColor: colors.detailedStatsBackground,
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  notificationInfoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  notificationInfoText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoSection: {
    backgroundColor: colors.detailedStatsBackground,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  infoText: {
    fontSize: 13,
    color: colors.primaryDark,
    textAlign: 'center',
    fontWeight: '500',
  },
});