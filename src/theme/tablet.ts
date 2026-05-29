import { useWindowDimensions } from 'react-native';

export const TABLET_MIN_WIDTH = 600;

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_MIN_WIDTH;
}

export function useContentMaxWidth(): number {
  const { width } = useWindowDimensions();
  if (width >= 900) return 720;
  if (width >= TABLET_MIN_WIDTH) return 600;
  return width - 32;
}
