import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabase'; // make sure path is correct

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Missing Fields', 'Please fill in all fields.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match.');
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      navigation.navigate('ProfileSetup'); // move to next step
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-looprPurple px-6">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold mb-6 text-white text-center">Create Account</Text>

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
          className="bg-white border border-white/20 rounded-md px-4 py-3 mb-4 text-black"
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          className="bg-white border border-white/20 rounded-md px-4 py-3 mb-6 text-black"
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          disabled={loading}
          onPress={handleSignUp}
          className="bg-white py-4 rounded-xl shadow-md"
        >
          {loading ? (
            <ActivityIndicator color="#4B2E83" />
          ) : (
            <Text className="text-center text-looprPurple font-semibold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
