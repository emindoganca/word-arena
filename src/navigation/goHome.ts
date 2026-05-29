import { CommonActions, NavigationProp, ParamListBase } from '@react-navigation/native';

/** Kampanya/VS gibi modlardan ana menüye temiz dönüş */
export function goHome(navigation: NavigationProp<ParamListBase>) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    }),
  );
}
