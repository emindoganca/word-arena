import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlayerProvider, usePlayer } from './src/context/PlayerContext';
import { RootStackParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlacementScreen } from './src/screens/PlacementScreen';
import { CampaignScreen } from './src/screens/CampaignScreen';
import { CampaignLessonScreen } from './src/screens/CampaignLessonScreen';
import { VsScreen } from './src/screens/VsScreen';
import { LeaguesScreen } from './src/screens/LeaguesScreen';
import { CreditsScreen } from './src/screens/CreditsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0F172A',
    card: '#0F172A',
    text: '#F8FAFC',
    border: '#1E293B',
    primary: '#6366F1',
  },
};

function AppNavigator() {
  const { loading } = usePlayer();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Placement" component={PlacementScreen} />
      <Stack.Screen
        name="Campaign"
        component={CampaignScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="CampaignLesson"
        component={CampaignLessonScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen name="Vs" component={VsScreen} />
      <Stack.Screen name="Leagues" component={LeaguesScreen} />
      <Stack.Screen name="Credits" component={CreditsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
