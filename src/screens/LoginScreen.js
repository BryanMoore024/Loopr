import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabase'; // adjust path if needed
import { KeyboardAvoidingView, Platform } from 'react-native';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const logo = require('../../assets/loopr-logo.png'); // adjust path as needed


  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      navigation.navigate('ProfileSetup'); // or Home, etc.
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return Alert.alert('Enter Email', 'Please enter your email first.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
    }
  };


  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // or try "position" for bigger shift
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // 👈 boosts the shift upward
    className="flex-1 bg-looprPurple"
  >
    <SafeAreaView className="flex-1 bg-looprPurple px-6">
      <View className="flex-1 justify-center">
      <Image
        source={logo}
        className="w-72 h-72 self-center mb-5"
/>

        <Text className="text-2xl font-bold mb-6 text-white text-center">Login</Text>

        <TextInput
          className="bg-white border border-white/20 rounded-md px-4 py-3 mb-4 text-black"
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="bg-white border border-white/20 rounded-md px-4 py-3 mb-2 text-black"
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot password link */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text className="text-sm text-white text-right mb-6">Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          className="bg-white py-4 rounded-xl shadow-md"
        >
          {loading ? (
            <ActivityIndicator color="#4B2E83" />
          ) : (
            <Text className="text-center text-looprPurple font-semibold text-lg">Log In</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
  onPress={() => navigation.navigate('Welcome')}
    className="bg-transparent py-4 rounded-xl border border-white"
  >
    <Text className="text-center text-white font-semibold text-lg"> Back </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
