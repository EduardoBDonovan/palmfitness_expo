import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MuscleGroup } from '../lib/muscleMapping';

interface MuscleMapProps {
  intensities: Record<string, number>;
  width?: number;
  height?: number;
}

const ASSETS = {
  base_front: require('../../assets/images/muscle_map/body_front_base.png'),
  base_back: require('../../assets/images/muscle_map/body_back_base.png'),
  mask_front_chest: require('../../assets/images/muscle_map/mask_front_chest.png'),
  mask_front_shoulders: require('../../assets/images/muscle_map/mask_front_shoulders.png'),
  mask_front_biceps: require('../../assets/images/muscle_map/mask_front_biceps.png'),
  mask_front_triceps: require('../../assets/images/muscle_map/mask_front_triceps.png'),
  mask_front_forearms: require('../../assets/images/muscle_map/mask_front_forearms.png'),
  mask_front_abs: require('../../assets/images/muscle_map/mask_front_abs.png'),
  mask_front_obliques: require('../../assets/images/muscle_map/mask_front_obliques.png'),
  mask_front_quads: require('../../assets/images/muscle_map/mask_front_quads.png'),
  mask_front_adductors: require('../../assets/images/muscle_map/mask_front_adductors.png'),
  mask_front_calves: require('../../assets/images/muscle_map/mask_front_calves.png'),
  mask_back_traps: require('../../assets/images/muscle_map/mask_back_traps.png'),
  mask_back_rearDelts: require('../../assets/images/muscle_map/mask_back_rearDelts.png'),
  mask_back_lats: require('../../assets/images/muscle_map/mask_back_lats.png'),
  mask_back_lowerBack: require('../../assets/images/muscle_map/mask_back_lowerBack.png'),
  mask_back_glutes: require('../../assets/images/muscle_map/mask_back_glutes.png'),
  mask_back_hamstrings: require('../../assets/images/muscle_map/mask_back_hamstrings.png'),
  mask_back_calves: require('../../assets/images/muscle_map/mask_back_calves.png'),
  mask_back_triceps: require('../../assets/images/muscle_map/mask_back_triceps.png'),
  mask_back_forearms: require('../../assets/images/muscle_map/mask_back_forearms.png'),
};

const MUSCLE_TO_MASK = {
  front: {
    [MuscleGroup.chest]: ASSETS.mask_front_chest,
    [MuscleGroup.shoulders]: ASSETS.mask_front_shoulders,
    [MuscleGroup.biceps]: ASSETS.mask_front_biceps,
    [MuscleGroup.triceps]: ASSETS.mask_front_triceps,
    [MuscleGroup.forearms]: ASSETS.mask_front_forearms,
    [MuscleGroup.abs]: ASSETS.mask_front_abs,
    [MuscleGroup.obliques]: ASSETS.mask_front_obliques,
    [MuscleGroup.quads]: ASSETS.mask_front_quads,
    [MuscleGroup.adductors]: ASSETS.mask_front_adductors,
    [MuscleGroup.calves]: ASSETS.mask_front_calves,
  },
  back: {
    [MuscleGroup.traps]: ASSETS.mask_back_traps,
    [MuscleGroup.rearDelts]: ASSETS.mask_back_rearDelts,
    [MuscleGroup.lats]: ASSETS.mask_back_lats,
    [MuscleGroup.lowerBack]: ASSETS.mask_back_lowerBack,
    [MuscleGroup.glutes]: ASSETS.mask_back_glutes,
    [MuscleGroup.hamstrings]: ASSETS.mask_back_hamstrings,
    [MuscleGroup.calves]: ASSETS.mask_back_calves,
    [MuscleGroup.triceps]: ASSETS.mask_back_triceps,
    [MuscleGroup.forearms]: ASSETS.mask_back_forearms,
  }
};

export const MuscleMap: React.FC<MuscleMapProps> = ({ intensities, width = 300, height = 200 }) => {
  const sideWidth = width / 2;

  const renderSide = (side: 'front' | 'back') => {
    const baseImage = side === 'front' ? ASSETS.base_front : ASSETS.base_back;
    const masks = MUSCLE_TO_MASK[side];

    return (
      <View style={[styles.sideContainer, { width: sideWidth, height }]}>
        <Image source={baseImage} style={styles.baseImage} resizeMode="contain" />
        {Object.entries(masks).map(([muscle, asset]) => {
          const intensity = intensities[muscle as MuscleGroup] || 0;
          if (intensity <= 0) return null;

          return (
            <Image
              key={muscle}
              source={asset}
              style={[
                styles.maskImage,
                { 
                  tintColor: '#ff3b30', 
                  opacity: 0.5 + 0.5 * intensity 
                }
              ]}
              resizeMode="contain"
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { width, height }]}>
      {renderSide('front')}
      {renderSide('back')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 8,
  },
  sideContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  maskImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  }
});
