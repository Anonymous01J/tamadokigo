// components/ActionButtons.js
import React from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { appStyles } from '../styles/appStyles';

export default function ActionButtons({
  onFeed,
  onPlay,
  onBathe,
  onPet,
  onSleep,
  onGame,
  onReset,
  isSleeping,
}) {
  return (
    <View style={appStyles.actionsContainer}>
      <Button
        icon="food"
        mode="contained"
        onPress={onFeed}
        style={appStyles.button}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>Comer</Text>
      </Button>

      <Button
        icon="tennis"
        mode="contained"
        onPress={onPlay}
        style={appStyles.button}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>Jugar</Text>
      </Button>

      <Button
        icon="bathtub"
        mode="contained"
        onPress={onBathe}
        style={appStyles.button}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>Bañar</Text>
      </Button>

      <Button
        icon="hand-heart"
        mode="contained"
        onPress={onPet}
        style={appStyles.button}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>Mimar</Text>
      </Button>

      <Button
        icon="bed"
        mode="contained"
        onPress={onSleep}
        style={[appStyles.button, appStyles.sleepButton]}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>{isSleeping ? 'Despertar' : 'Dormir'}</Text>
      </Button>

      <Button
        icon="gamepad-variant"
        mode="contained"
        onPress={onGame}
        style={[appStyles.button, appStyles.gameButton]}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>Juego</Text>
      </Button>

      <Button
        icon="refresh"
        mode="contained"
        onPress={onReset}
        style={[appStyles.button, appStyles.resetButton]}
        labelStyle={appStyles.buttonLabel}
        compact
      >
        <Text>Reset</Text>
      </Button>
    </View>
  );
}
