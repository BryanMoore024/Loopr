import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../supabase'; // Make sure this is correct

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
  const [loading, setLoading] = useState(false);

  // Handle Profile Setup
  const handleProfileSetup = async () => {
    setLoading(true);

    // Upload the image to Supabase Storage
    let imageUrl = profilePicture;

    if (profilePicture.uri) {
      const response = await fetch(profilePicture.uri);
      const blob = await response.blob();
      const fileName = `profile_pictures/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('avatars') // Your Supabase Storage bucket name
        .upload(fileName, blob, { cacheControl: '3600', upsert: true });

      if (error) {
        Alert.alert('Error uploading image', error.message);
        setLoading(false);
        return;
      }

      // Get the public URL of the uploaded image
      const { publicURL, error: urlError } = supabase.storage
        .from('avatars') // Your Supabase Storage bucket name
        .getPublicUrl(fileName);

      if (urlError) {
        Alert.alert('Error getting image URL', urlError.message);
        setLoading(false);
        return;
      }

      imageUrl = publicURL; // Store the public URL
    }

    // Save profile information to Supabase users table
    const { data, error } = await supabase.from('users').upsert({
      swing_tendency: swingTendency,
      tee_preference: handedness,
      units: units,
      club_distances: clubDistances,
      profile_picture: imageUrl, // Save the public image URL
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.navigate('Dashboard'); // Move to Dashboard or next screen
    }
  };

  // Handle Image Upload (Image Picker)
  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Keep it square for profile pic
      quality: 1,
    });

    if (!result.cancelled) {
      setProfilePicture(result); // Update state with the image URI
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-looprPurple px-6">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold mb-6 text-white text-center">Profile Setup</Text>

        {/* Profile Picture */}
        <TouchableOpacity onPress={handleImageUpload} className="mb-4">
          <Image
            source={profilePicture.uri ? { uri: profilePicture.uri } : defaultProfilePic}
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
          {loading ? (
            <Text className="text-center text-looprPurple font-semibold text-lg">Saving...</Text>
          ) : (
            <Text className="text-center text-looprPurple font-semibold text-lg">Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
