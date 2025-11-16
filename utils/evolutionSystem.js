// utils/evolutionSystem.js - Sin imágenes específicas por etapa
export const EVOLUTION_STAGES = {
  BABY: {
    name: 'Bebé',
    emoji: '🐶',
    minDays: 0,
    maxDays: 6,
    maxStats: 100,
    decayMultiplier: 1.2, // Más rápido
    description: 'Un cachorro adorable que necesita mucho cuidado',
  },
  YOUNG: {
    name: 'Joven',
    emoji: '🐕',
    minDays: 7,
    maxDays: 20,
    maxStats: 120,
    decayMultiplier: 1.0, // Normal
    description: 'Un poodle joven lleno de energía',
  },
  ADULT: {
    name: 'Adulto',
    emoji: '🦮',
    minDays: 21,
    maxDays: 40,
    maxStats: 150,
    decayMultiplier: 0.8, // Más resistente
    description: 'Un poodle adulto sabio y equilibrado',
  },
  ELDER: {
    name: 'Anciano',
    emoji: '🐕‍🦺',
    minDays: 41,
    maxDays: Infinity,
    maxStats: 200,
    decayMultiplier: 0.6, // Muy resistente
    description: 'Un poodle anciano lleno de experiencia y sabiduría',
  },
};

// Obtener etapa de evolución según días de vida
export const getEvolutionStage = (daysAlive) => {
  // Asegurarse de que daysAlive sea un número, si no, tratar como 0
  const validDays = typeof daysAlive === 'number' ? daysAlive : 0;

  for (const [key, stage] of Object.entries(EVOLUTION_STAGES)) {
    if (validDays >= stage.minDays && validDays <= stage.maxDays) {
      return { key, ...stage };
    }
  }
  // Si no se encuentra una etapa, devolver 'BABY' por defecto
  return { key: 'BABY', ...EVOLUTION_STAGES.BABY };
};

// Verificar si debe evolucionar
export const shouldEvolve = (currentStage, daysAlive) => {
  const newStage = getEvolutionStage(daysAlive);
  return currentStage !== newStage.key;
};

// Calcular stats máximas según etapa
export const getMaxStat = (stage, baseStat) => {
  const stageData = EVOLUTION_STAGES[stage];
  return Math.min(baseStat, stageData?.maxStats || 100);
};

// Aplicar multiplicador de decaimiento
export const applyDecayMultiplier = (stage, decayAmount) => {
  const stageData = EVOLUTION_STAGES[stage];
  return decayAmount * (stageData?.decayMultiplier || 1.0);
};

// Obtener bonus de evolución
export const getEvolutionBonus = (newStage) => {
  const bonuses = {
    BABY: { hunger: 20, energy: 20, happiness: 20, cleanliness: 20 },
    YOUNG: { hunger: 30, energy: 30, happiness: 30, cleanliness: 30 },
    ADULT: { hunger: 50, energy: 50, happiness: 50, cleanliness: 50 },
    ELDER: { hunger: 100, energy: 100, happiness: 100, cleanliness: 100 },
  };

  return bonuses[newStage] || bonuses.YOUNG;
};

// Obtener mensaje de evolución
export const getEvolutionMessage = (newStage) => {
  const messages = {
    BABY: '👶 Doki nació! Es un bebé adorable',
    YOUNG: '🎉 ¡Doki creció! Ahora es un joven poodle',
    ADULT: '🌟 ¡Doki evolucionó! Es un adulto sabio',
    ELDER: '👴 ¡Doki alcanzó la sabiduría! Es un anciano respetado',
  };

  return messages[newStage] || 'Doki evolucionó!';
};

// Obtener habilidades especiales según etapa
export const getSpecialAbilities = (stage) => {
  const abilities = {
    BABY: ['Más lindo', 'Necesita más cuidado', 'Stats decaen 20% más rápido'],
    YOUNG: ['Energético', 'Aprende rápido', 'Stats máximas: 120'],
    ADULT: [
      'Resistente',
      'Equilibrado',
      'Stats máximas: 150',
      'Decae 20% más lento',
    ],
    ELDER: [
      'Sabio',
      'Muy resistente',
      'Stats máximas: 200',
      'Decae 40% más lento',
    ],
  };

  return abilities[stage] || [];
};
