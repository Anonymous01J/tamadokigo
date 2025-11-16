import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface PoodleSpriteProps {
  duration: number; // duración total en segundos
  imageSource: any;
}

const columns = 3;
const rows = 3;
const totalFrames = columns * rows;

const frameWidth = 341; // redondeado
const frameHeight = 512;

const PoodleSprite = ({ duration, imageSource }: PoodleSpriteProps) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, (duration * 1000) / totalFrames);

    return () => clearInterval(interval);
  }, [duration]);

  const col = frameIndex % columns;
  const row = Math.floor(frameIndex / columns);

  const offsetX = -col * frameWidth;
  const offsetY = -row * frameHeight;

  return (
    <View style={{ width: frameWidth, height: frameHeight, overflow: 'hidden' }}>
      <Image
        source={imageSource}
        style={{
          width: frameWidth * columns,
          height: frameHeight * rows,
          transform: [{ translateX: offsetX }, { translateY: offsetY }],
        }}
      />
    </View>
  );
};

export default PoodleSprite;
