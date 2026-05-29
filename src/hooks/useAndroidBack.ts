import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export function useAndroidBack(handler: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handler);
      return () => sub.remove();
    }, [handler]),
  );
}
