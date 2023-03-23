import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useCategory } from '../context/CategoryContext';

const useShowAddTab = () => {
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const { personalCommunityTab } = useCategory();

  useEffect(() => {
    if (personalCommunityTab === 'personal') {
      setTimeout(() => {
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 200);
    } else {
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [personalCommunityTab]);

  return { animatedOpacity };
};

export default useShowAddTab;
