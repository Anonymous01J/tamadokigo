// components/PoodleDisplay.js
import React from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { appStyles } from '../styles/appStyles';

const getMoodEmoji = (mood) => {
  switch (mood) {
    case 'Feliz':
      return '😊';
    case 'Normal':
      return '😐';
    case 'Triste':
      return '😢';
    case 'Malhumorado':
      return '😠';
    case 'Cansado':
      return '🥱';
    case 'Hambriento':
      return '🍽️';
    case 'Sucio':
      return '🧽';
    default:
      return '😐';
  }
};

export default function PoodleDisplay({
  poodleImage,
  mood,
  floatTranslate,
  particles,
}) {
  return (
    <View style={appStyles.petContainer}>
      <Animated.View
        style={[
          appStyles.petImageContainer,
          { transform: [{ translateY: floatTranslate }] },
        ]}
      >
        <Image source={poodleImage} style={appStyles.petImage} />
        {particles.map((particle) => (
          <Animated.Text
            key={particle.id}
            style={[appStyles.particle, { left: particle.x + 70 }]}
          >
            ✨
          </Animated.Text>
        ))}
      </Animated.View>
      <View style={appStyles.moodContainer}>
        <Text style={appStyles.moodEmoji}>{getMoodEmoji(mood)}</Text>
        <Text style={appStyles.mood}>{mood}</Text>
      </View>
    </View>
  );
}
