import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import { LanguageProvider, LanguageContext } from './src/context/LanguageContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import RankingScreen from './src/screens/RankingScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NovelDetailScreen from './src/screens/NovelDetailScreen';
import ReadingScreen from './src/screens/ReadingScreen';

// Phase 5 Screens
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import DownloadedSeriesScreen from './src/screens/DownloadedSeriesScreen';
import ReadingHistoryScreen from './src/screens/ReadingHistoryScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { t } = React.useContext(LanguageContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: '#C5A5FF', // Purple as seen in Library screenshot
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Discovery') iconName = 'compass';
          else if (route.name === 'Ranking') iconName = 'bar-chart-2';
          else if (route.name === 'Library') iconName = 'book';
          else if (route.name === 'Profile') iconName = 'user';
          return <Feather name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home') }} />
      <Tab.Screen name="Discovery" component={DiscoveryScreen} options={{ tabBarLabel: t('discovery') }} />
      <Tab.Screen name="Ranking" component={RankingScreen} options={{ tabBarLabel: t('ranking') }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: t('library') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="NovelDetail" component={NovelDetailScreen} />
        <Stack.Screen name="Reading" component={ReadingScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="DownloadedSeries" component={DownloadedSeriesScreen} />
        <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </LanguageProvider>
  );
}
