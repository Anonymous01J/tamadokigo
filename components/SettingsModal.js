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
import { toggleMusic } from '../utils/soundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsModal({ visible, onClose }) {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Cargar preferencias al abrir el modal
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const musicPref = await AsyncStorage.getItem('musicEnabled');
      const notifPref = await AsyncStorage.getItem('notificationsEnabled');
      
      if (musicPref !== null) {
        setMusicEnabled(musicPref === 'true');
      }
      if (notifPref !== null) {
        setNotificationsEnabled(notifPref === 'true');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleMusicToggle = async (value) => {
    setMusicEnabled(value);
    await toggleMusic();
    try {
      await AsyncStorage.setItem('musicEnabled', value.toString());
    } catch (error) {
      console.error('Error guardando preferencia de música:', error);
    }
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
      // Aquí puedes agregar lógica adicional para activar/desactivar notificaciones
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
                    Recibe alertas cuando tu Poodle necesite atención
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: colors.lightGrey, true: colors.primaryLight }}
                  thumbColor={notificationsEnabled ? colors.primary : colors.textPrimary}
                />
              </View>
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