// screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import profilePlaceholder from '../../assets/profile-placeholder.png';
import { supabase } from '../../supabase'; // 



export default function DashboardScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) setProfile(data);
        if (error) console.log('Error fetching profile:', error);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-looprPurple">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }


  return (
    <View className="flex-1 bg-looprPurple pt-12 px-5">
      {/* Top Header */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Profile Pic Button */}
        <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')}>
        <Image
source={
  profile?.profile_picture && profile.profile_picture !== ''
    ? { uri: profile.profile_picture }
    : require('../../assets/profile-placeholder.png')
}
  className="w-10 h-10 rounded-full border border-white"
/>

        </TouchableOpacity>

        {/* Centered Title */}
        <Text className="text-white text-xl font-bold absolute left-1/2 -translate-x-1/2">
          Loopr
        </Text>
      </View>

      {/* Dashboard Content Goes Here */}
      <Text className="text-white text-2xl mb-2">Welcome back, {profile?.name || 'Golfer'}!</Text>
      <TouchableOpacity
  className="bg-white py-4 px-6 rounded-xl mb-4"
  onPress={() => navigation.navigate('ProfileSetup')}
>
  <Text className="text-center text-looprPurple font-semibold text-lg">Update My Profile</Text>
</TouchableOpacity>

<TouchableOpacity
  className="bg-red-500 py-4 px-6 rounded-xl mt-4"
  onPress={async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  }}
>
  <Text className="text-center text-white font-semibold text-lg">Log Out</Text>
</TouchableOpacity>

    </View>
  );
}
