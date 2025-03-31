import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import { Buffer } from 'buffer';
import { supabase } from '../../supabase';
import { useActionSheet } from '@expo/react-native-action-sheet';

if (!global.Buffer) global.Buffer = Buffer;

const defaultProfilePic = require('../../assets/profile-placeholder.png');
const CLUBS = [
  'Driver', '3 Wood', '5 Wood', '2 Iron', '3 Iron', '4 Iron',
  '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron',
  'Pitching Wedge', 'Gap Wedge', 'Sand Wedge', 'Lob Wedge', 'Putter'
];

export default function ProfileSetupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [handedness, setHandedness] = useState('Right');
  const [swingTendency, setSwingTendency] = useState('Straight');
  const [handicap, setHandicap] = useState('');
  const [clubDistances, setClubDistances] = useState({});
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureUri, setProfilePictureUri] = useState(null);
  const { showActionSheetWithOptions } = useActionSheet();

  const handednessOptions = ['Right', 'Left'];
  const swingTendencyOptions = ['Straight', 'Hook', 'Slice', 'Draw', 'Fade'];

  const handleHandednessPress = () => {
    showActionSheetWithOptions(
      {
        options: handednessOptions,
        cancelButtonIndex: 2,
        title: 'Select Handedness',
      },
      (selectedIndex) => {
        if (selectedIndex === 0) setHandedness('Right');
        else if (selectedIndex === 1) setHandedness('Left');
      }
    );
  };

  const handleSwingTendencyPress = () => {
    showActionSheetWithOptions(
      {
        options: swingTendencyOptions,
        cancelButtonIndex: 5,
        title: 'Select Shot Tendency',
      },
      (selectedIndex) => {
        if (selectedIndex >= 0 && selectedIndex < 5) {
          setSwingTendency(swingTendencyOptions[selectedIndex]);
        }
      }
    );
  };

  useEffect(() => {
    const loadData = async () => {
      setIsSessionLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        Alert.alert('Not Authenticated', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }
      const currentUser = session.user;
      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('profile')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setName(profileData.name || '');
        setHandedness(profileData.handedness || 'Right');
        setSwingTendency(profileData.swing_tendency || 'Straight');
        setHandicap(profileData.handicap?.toString() || '');
        setClubDistances(profileData.club_distances || {});
        setProfilePictureUrl(profileData.profile_picture || null);
      }
      setIsSessionLoading(false);
    };
    loadData();
  }, [navigation]);

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setProfilePictureUri(result.assets[0].uri);
    }
  };

  const handleClubDistanceChange = (club, value) => {
    setClubDistances(prev => ({ ...prev, [club]: value }));
  };

  const handleProfileSetup = async () => {
    if (!user?.id || !name.trim()) {
      Alert.alert('Error', 'Missing required fields.');
      return;
    }

    setLoading(true);
    let uploadedImageUrl = profilePictureUrl;

    try {
      const {
        data: { session: refreshedSession },
        error,
      } = await supabase.auth.refreshSession();
      const currentUserId = refreshedSession.user.id;

      if (profilePictureUri) {
        const fileExt = profilePictureUri.split('.').pop().split('?')[0];
        const fileName = `${currentUserId}_${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;
        const fileMimeType = mime.getType(profilePictureUri);
        const fileContent = await FileSystem.readAsStringAsync(profilePictureUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, Buffer.from(fileContent, 'base64'), {
            contentType: fileMimeType || 'image/jpeg',
            upsert: true,
          });

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        uploadedImageUrl = urlData.publicUrl;
      }

      const profileDataForUpsert = {
        id: currentUserId,
        name: name.trim(),
        handedness,
        swing_tendency: swingTendency,
        handicap: parseFloat(handicap) || null,
        profile_picture: uploadedImageUrl,
        club_distances: clubDistances,
        updated_at: new Date(),
      };

      const { error: profileError } = await supabase
        .from('profile')
        .upsert(profileDataForUpsert, { returning: 'minimal' })
        .eq('id', currentUserId);

      if (profileError) throw profileError;

      Alert.alert('Success', 'Profile saved!');
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const textInputClass =
    'bg-white/10 border border-white/20 rounded-md px-4 py-3 mb-4 text-white h-[50px]';

  if (isSessionLoading) {
    return (
      <SafeAreaView className="flex-1 bg-looprPurple justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-looprPurple" edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="items-center mb-6">
            <TouchableOpacity onPress={handleImageUpload} className="mb-4">
              <Image
                source={
                  profilePictureUri
                    ? { uri: profilePictureUri }
                    : profilePictureUrl
                    ? { uri: profilePictureUrl }
                    : defaultProfilePic
                }
                className="w-32 h-32 rounded-full border-2 border-white"
                resizeMode="cover"
                />
              </TouchableOpacity>
            
              <Text className="text-white/80 text-sm">Tap to change picture</Text>
            </View>

          <Text className="text-white mb-1 ml-1">Full Name</Text>
          <TextInput
            className={textInputClass}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#aaa"
          />

          <View className="mb-4">
            <Text className="text-white mb-2 text-base font-medium">Handedness</Text>
            <TouchableOpacity
              onPress={handleHandednessPress}
              className="bg-white/10 border border-white/30 rounded-xl px-4 py-3"
      >
           <Text className="text-white text-lg">
          {handedness || 'Select Handedness'}
        </Text>
      </TouchableOpacity>
    </View>

          <View className="mb-4">
            <Text className="text-white mb-2 text-base font-medium">Shot Tendency</Text>
            <TouchableOpacity
              onPress={handleSwingTendencyPress}
              className="bg-white/10 border border-white/30 rounded-xl px-4 py-3"
  >
            <Text className="text-white text-lg">
               {swingTendency || 'Select Shot Tendency'}
             </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white mb-1 ml-1">Handicap</Text>
          <TextInput
            className={textInputClass}
            value={handicap}
            onChangeText={setHandicap}
            keyboardType="numeric"
            placeholder="Enter your handicap"
            placeholderTextColor="#aaa"
          />

          <Text className="text-white text-lg mb-2">Club Distances (yards)</Text>
          {CLUBS.map(club => (
            <View key={club} className="mb-4">
              <Text className="text-white mb-1">{club}</Text>
              <TextInput
                value={clubDistances[club]?.toString() || ''}
                onChangeText={value => handleClubDistanceChange(club, value)}
                keyboardType="numeric"
                className={textInputClass}
                placeholder="0"
                placeholderTextColor="#aaa"
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleProfileSetup}
            disabled={loading}
            className={`bg-white py-4 rounded-xl shadow-md mt-8 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#27084e" />
            ) : (
              <Text className="text-center text-looprPurple font-semibold text-lg">Save Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}