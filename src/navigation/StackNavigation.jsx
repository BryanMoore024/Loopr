import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen'; // this will be the *real* login screen
import SignUpScreen from '../screens/SignUpScreen'; // coming soon!
import ProfileSetupScreen from '../screens/ProfileSetupScreen'; // make sure this exists


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
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
  name="ProfileSetup"
  component={ProfileSetupScreen}
  options={{ headerShown: true }}
      />

    </Stack.Navigator>
  );
}
