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
  StyleSheet // Keep StyleSheet import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../supabase'; // Ensure this path is correct
import ModalDropdown from 'react-native-modal-dropdown'; // Use ModalDropdown

// Default Profile Picture (placeholder)
const defaultProfilePic = require('../../assets/profile-placeholder.png');

// Component Definition
export default function ProfileSetupScreen({ navigation }) {
  // --- State Variables ---
  const [loading, setLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [handedness, setHandedness] = useState('Right');
  const [units, setUnits] = useState('Yards');
  const [swingTendency, setSwingTendency] = useState('Straight'); // Default matches updated DB Enum
  const [clubDistances, setClubDistances] = useState({
    Driver: '', '3 Wood': '', '5 Wood': '', '3 Hybrid': '', '4 Iron': '',
    '5 Iron': '', '6 Iron': '', '7 Iron': '', '8 Iron': '', '9 Iron': '',
    PW: '', GW: '', SW: '', LW: '',
  });
  const [profilePictureUri, setProfilePictureUri] = useState(null);

  // --- Data for Dropdowns ---
  const handednessOptions = ['Right', 'Left'];
  const unitsOptions = ['Yards', 'Meters'];
  const swingTendencyOptions = ['Straight', 'Hook', 'Slice', 'Draw', 'Fade']; // Matches updated DB Enum

  // --- Effects ---
   // Fetch user session
  useEffect(() => {
    setIsSessionLoading(true);
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { Alert.alert('Error fetching session', error.message); }
      else if (session?.user) { setUser(session.user); console.log("Session loaded:", session.user.id)}
      else { Alert.alert('Not Authenticated', 'Please log in again.'); navigation.navigate('Login'); }
    }).catch(error => { Alert.alert('Error', `Session fetch failed: ${error.message}`); })
      .finally(() => { setIsSessionLoading(false); });
  }, [navigation]);

  // Request permissions
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => {
        if (status !== 'granted') { Alert.alert('Permission Required', 'Camera roll access is needed.'); }
      });
    }
  }, []);


  // --- Event Handlers ---
  const handleClubDistanceChange = (club, value) => {
     if (/^\d*$/.test(value)) { setClubDistances(prev => ({ ...prev, [club]: value })); }
  };

  const handleImageUpload = async () => {
    console.log("handleImageUpload triggered");
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Corrected
        allowsEditing: true, aspect: [1, 1], quality: 0.6,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePictureUri(result.assets[0].uri);
      }
    } catch (error) {
         console.error("ImagePicker Error: ", error);
         Alert.alert('Image Picker Error', `Could not select image: ${error?.message || ''}`);
    }
  };

  // --- handleProfileSetup (Simplified UPDATE for RLS Debug) ---
  const handleProfileSetup = async () => {
    if (!user || !user.id) { Alert.alert('Error', 'User session not ready.'); return; }
    if (!name.trim()) { Alert.alert('Input Required', 'Please enter full name.'); return; }

    console.log("[Before Save] Attempting save for user:", user.id);
    setLoading(true);
    let profilePictureUrl = null; // Keep this for potential future use

    try {
        // Re-add session refresh for robustness
        console.log("Refreshing session before save...");
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession?.user) {
             throw new Error(`Session invalid or refresh failed: ${refreshError?.message}`);
        }
        const currentUserId = refreshedSession.user.id;
        console.log("[After Refresh] User ID confirmed:", currentUserId);

        // *** Prepare minimal data - ONLY UPDATE NAME for RLS test ***
        // (You would normally include all fields here)
        const profileDataMinimal = {
            name: name.trim() + " Updated", // Append to see change
            // Include other fields ONLY IF your NOT NULL constraints require them
            // handedness: handedness,
            // preferred_units: units,
            // swing_tendency: swingTendency,
            // club_distances: clubDistances,
            updated_at: new Date(), // Good practice to update this
        };
         // Add profile picture if it was uploaded in this session
        // For this minimal test, we might skip uploading/saving the picture
        // if (profilePictureUri) {
        //    ... upload logic ...
        //    profileDataMinimal.profile_picture = profilePictureUrl;
        // }
        console.log("Minimal data to update:", JSON.stringify(profileDataMinimal, null, 2));

        // *** Use UPDATE with minimal data ***
        // Ensure RLS policy for UPDATE is temporarily USING true / WITH CHECK true
        // Ensure profile row exists in Supabase for currentUserId
        const { error: profileError } = await supabase
            .from('profile')
            .update(profileDataMinimal)
            .eq('id', currentUserId);

        if (profileError) throw profileError;

        // 4. Success
        Alert.alert('Success', 'Profile NAME updated!');
        // navigation.replace('Dashboard'); // Don't navigate away during debug

    } catch (error) {
        console.error("Profile Setup Error:", error);
        if (error.message && error.message.includes('violates row-level security policy')) {
           Alert.alert('Save Error', 'RLS Permission Denied. Check Supabase policy (should be TRUE/TRUE) & ensure profile row exists.');
        } else if (error.code === '22P02') { // Enum error check
           Alert.alert('Save Error', `Invalid value selected. Check dropdown options match DB exactly. Error: ${error.message}`);
        } else {
           Alert.alert('Error', `Failed to save profile: ${error.message || 'Unknown error'}`);
        }
    } finally { setLoading(false); }
  };


  // --- UI Rendering ---
  const textInputClass = "bg-white/10 border border-white/20 rounded-md px-4 py-3 mb-4 text-white h-[50px]";

  if (isSessionLoading) {
    return (
      <SafeAreaView className="flex-1 bg-looprPurple justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-looprPurple" edges={['bottom', 'left', 'right']}>
      <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          scrollIndicatorInsets={{ right: 1 }}
      >
        <Text className="text-3xl font-bold my-6 text-white text-center">Profile Setup</Text>

        {/* Profile Picture */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={handleImageUpload} className="mb-2">
            <Image
              source={profilePictureUri ? { uri: profilePictureUri } : (profilePictureUrl ? { uri: profilePictureUrl } : defaultProfilePic)}
              className="w-32 h-32 rounded-full border-2 border-white/50"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 right-0 bg-looprLightPurple p-2 rounded-full">
              <Text className="text-white text-xs">Edit</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-white/80 text-sm">Tap to upload picture</Text>
        </View>

        {/* Full Name */}
        <Text className="text-white mb-1 ml-1">Full Name</Text>
        <TextInput
          className={textInputClass}
          placeholder="Enter your full name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Handedness Dropdown */}
        <Text className="text-white mb-1 ml-1 mt-4">Handedness</Text>
        <View style={styles.dropdownWrapper}>
            <ModalDropdown
                options={handednessOptions}
                style={styles.dropdownButton}
                dropdownStyle={styles.modalDropdownMenu}
                dropdownTextStyle={styles.modalDropdownRowText}
                dropdownTextHighlightStyle={styles.modalDropdownRowTextHighlight}
                onSelect={(index, value) => { setHandedness(value); console.log(`Handedness: ${value}`); }}
                renderSeparator={() => <View style={styles.separatorStyle} />}
            >
                <View style={styles.dropdownButtonInternalView}>
                    <Text style={styles.dropdownButtonText}>{handedness || 'Select...'}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </View>
            </ModalDropdown>
        </View>

        {/* Units Dropdown */}
        <Text className="text-white mb-1 ml-1 mt-4">Preferred Units</Text>
         <View style={styles.dropdownWrapper}>
            <ModalDropdown
                options={unitsOptions}
                style={styles.dropdownButton}
                dropdownStyle={styles.modalDropdownMenu}
                dropdownTextStyle={styles.modalDropdownRowText}
                dropdownTextHighlightStyle={styles.modalDropdownRowTextHighlight}
                onSelect={(index, value) => { setUnits(value); console.log(`Units: ${value}`); }}
                 renderSeparator={() => <View style={styles.separatorStyle} />}
            >
                 <View style={styles.dropdownButtonInternalView}>
                    <Text style={styles.dropdownButtonText}>{units || 'Select...'}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </View>
            </ModalDropdown>
        </View>

        {/* Swing Tendency Dropdown */}
        <Text className="text-white mb-1 ml-1 mt-4">Typical Shot Shape</Text>
         <View style={styles.dropdownWrapper}>
            <ModalDropdown
                options={swingTendencyOptions} // Ensure these match DB Enum casing
                style={styles.dropdownButton}
                dropdownStyle={styles.modalDropdownMenu}
                dropdownTextStyle={styles.modalDropdownRowText}
                dropdownTextHighlightStyle={styles.modalDropdownRowTextHighlight}
                onSelect={(index, value) => { setSwingTendency(value); console.log(`Swing Tendency: ${value}`); }}
                 renderSeparator={() => <View style={styles.separatorStyle} />}
            >
                 <View style={styles.dropdownButtonInternalView}>
                    <Text style={styles.dropdownButtonText}>{swingTendency || 'Select...'}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </View>
            </ModalDropdown>
        </View>

        {/* Club Distances */}
        <Text className="text-xl font-semibold mb-3 text-white mt-4">Club Distances ({units})</Text>
        {Object.keys(clubDistances).map((club) => (
          <View key={club} className="flex-row items-center justify-between mb-3">
            <Text className="text-white w-1/3">{club}</Text>
            <TextInput
              className={`${textInputClass} py-2 w-2/3 text-center mb-0`}
              placeholder={`Avg. ${units}`}
              placeholderTextColor="#aaa"
              value={clubDistances[club]}
              onChangeText={(value) => handleClubDistanceChange(club, value)}
              keyboardType="numeric"
            />
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleProfileSetup}
          disabled={loading || isSessionLoading}
          className={`bg-white py-4 rounded-xl shadow-md mt-8 ${ (loading || isSessionLoading) ? 'opacity-50' : ''}`}
        >
         {loading ? <ActivityIndicator size="small" color="#27084e" /> : <Text className="text-center text-looprPurple font-semibold text-lg">Save Profile</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} // *** End of ProfileSetupScreen component function ***


// --- Styles Adjusted for ModalDropdown ---
const styles = StyleSheet.create({
  dropdownWrapper: { marginBottom: 16, zIndex: 1, },
  dropdownButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, height: 50, width: '100%', },
  dropdownButtonInternalView: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '100%', paddingHorizontal: 16, },
  dropdownButtonText: { color: 'white', fontSize: 16, },
  dropdownArrow: { color: 'white', fontSize: 12, },
  modalDropdownMenu: { width: '88%', marginTop: -60, // Adjusted marginTop (negative)
                       marginLeft: '6%', backgroundColor: '#1E1E1E', borderRadius: 8, borderColor: 'rgba(255, 255, 255, 0.4)', borderWidth: 1, height: 'auto', maxHeight: 200, zIndex: 1000, elevation: 5, },
  modalDropdownRowText: { color: 'white', fontSize: 16, paddingVertical: 12, paddingHorizontal: 16, },
  modalDropdownRowTextHighlight: { color: 'lightblue', fontWeight: 'bold', },
  separatorStyle: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', }
});