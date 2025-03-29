import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResponsiveImage from '../components/ResponsiveImage';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-looprPurple">
      <View className="flex-1 justify-center items-center px-6">
        <ResponsiveImage
          source={require('../../assets/loopr-logo.png')}
          aspectRatio={1}
        />

<View className="w-full mt-10 space-y-4 items-center">
  {/* Login Button (Primary) */}
  <TouchableOpacity
    onPress={() => navigation.navigate('Login')}
    activeOpacity={0.85}
    className="w-11/12 bg-white py-4 rounded-xl shadow-md"
  >
    <Text className="text-center text-looprPurple font-semibold text-lg">
      Login
    </Text>
  </TouchableOpacity>

  {/* Sign Up Button (Secondary) */}
  <TouchableOpacity
    onPress={() => navigation.navigate('SignUp')}
    activeOpacity={0.85}
    className="w-11/12 bg-transparent py-4 rounded-xl border border-white"
  >
    <Text className="text-center text-white font-semibold text-lg">
      Sign Up
    </Text>
  </TouchableOpacity>
</View>

      </View>
    </SafeAreaView>
  );
}
