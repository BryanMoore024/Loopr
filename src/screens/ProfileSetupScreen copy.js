import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabase'; // correct path

// Default Profile Picture (placeholder)
const defaultProfilePic = require('../../assets/profile-placeholder.png'); // Adjust the path as needed

export default function ProfileSetupScreen({ navigation }) {
  const [swingTendency, setSwingTendency] = useState('none');
  const [handedness, setHandedness] = useState('right');
  const [units, setUnits] = useState('yards');
  const [clubDistances, setClubDistances] = useState({
    driver: '',
    threeWood: '',
    fiveWood: '',
  });
  const [profilePicture, setProfilePicture] = useState(defaultProfilePic);

  const handleProfileSetup = async () => {
    const { data, error } = await supabase.from('users').upsert({
      swing_tendency: swingTendency,
      tee_preference: handedness,
      units: units,
      club_distances: clubDistances,
      profile_picture: profilePicture.uri || '', // Save the profile picture URL (if any)
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.navigate('Dashboard'); // Move to Dashboard or next screen
    }
  };

  const handleImageUpload = () => {
    // Use a library like 'react-native-image-picker' or 'expo-image-picker' to allow the user to upload a profile picture
    // Once selected, store the image URL in 'profilePicture' state
  };

  return (
    <SafeAreaView className="flex-1 bg-looprPurple px-6">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold mb-6 text-white text-center">Profile Setup</Text>

        {/* Profile Picture */}
        <TouchableOpacity onPress={handleImageUpload} className="mb-4">
          <Image
            source={profilePicture || defaultProfilePic}
            className="w-32 h-32 rounded-full mb-6"
            resizeMode="cover"
          />
        </TouchableOpacity>

        <TextInput
          className="bg-white border border-white/20 rounded-md px-4 py-3 mb-4 text-black"
          placeholder="Enter Full Name"
          placeholderTextColor="#888"
        />

        {/* Other inputs for swing_tendency, handedness, etc. */}
        <Text className="text-white mb-2">Swing Tendency</Text>
        {/* Dropdown for swing tendency */}

        <TouchableOpacity
          onPress={handleProfileSetup}
          className="bg-white py-4 rounded-xl shadow-md mt-6"
        >
          <Text className="text-center text-looprPurple font-semibold text-lg">Save Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
