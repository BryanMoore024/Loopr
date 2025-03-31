import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen'; // this will be the *real* login screen
import SignUpScreen from '../screens/SignUpScreen'; // coming soon!
import ProfileSetupScreen from '../screens/ProfileSetupScreen'; // make sure this exists
import DashboardScreen from '../screens/DashboardScreen'; // make sure this exists
import { SafeAreaView } from 'react-native-safe-area-context';
import MainTabs from './MainTabs.js';




const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  return (
<Stack.Navigator initialRouteName="Welcome">
  <Stack.Screen
    name="Welcome"
    component={WelcomeScreen}
    options={{ headerShown: false }}
  />
  <Stack.Screen
    name="Login"
    component={LoginScreen}
    options={{ headerShown: false }}
  />
  <Stack.Screen
    name="SignUp"
    component={SignUpScreen}
    options={{ headerShown: false }}
  />
  <Stack.Screen
    name="ProfileSetup"
    component={ProfileSetupScreen}
    options={{ headerShown: true }}
  />
  <Stack.Screen
    name="MainTabs"
    component={MainTabs}
    options={{ headerShown: false }}
  />
</Stack.Navigator>
  );
}
