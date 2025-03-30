

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import {   View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
  SafeAreaView } from 'react-native';
// ... other imports ...
import ModalDropdown from 'react-native-modal-dropdown';
import { supabase } from '../../supabase'; // 

const defaultProfilePic = require('../../assets/profile-placeholder.png');

export default function ProfileSetupScreen({ navigation }) {
  // --- State ---
  const [loading, setLoading] = useState(false); // For save operation
  const [isSessionLoading, setIsSessionLoading] = useState(true); // For initial data load
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [handedness, setHandedness] = useState('Right'); // Keep defaults
  const [units, setUnits] = useState('Yards');     // Keep defaults
  const [swingTendency, setSwingTendency] = useState('Straight'); // Keep default matching Enum
  const [clubDistances, setClubDistances] = useState({ /* ... empty clubs ... */ });
  const [profilePictureUrl, setProfilePictureUrl] = useState(null); // Store URL from DB
  const [profilePictureUri, setProfilePictureUri] = useState(null); // Store temporary URI from picker

 // --- Data for Dropdowns --- (Ensure matches DB Enum)
  const handednessOptions = ['Right', 'Left'];
  const unitsOptions = ['Yards', 'Meters'];
  const swingTendencyOptions = ['Straight', 'Hook', 'Slice', 'Draw', 'Fade'];

  // --- Effects ---
  // Fetch session AND profile data
  useEffect(() => {
    const loadData = async () => {
      setIsSessionLoading(true);
      try {
        // 1. Get Session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          Alert.alert('Not Authenticated', 'Please log in again.');
          navigation.navigate('Login');
          return; // Exit early if no user
        }
        const currentUser = session.user;
        setUser(currentUser);
        console.log("Session loaded:", currentUser.id);

        // 2. Fetch Existing Profile Data
        console.log("Fetching profile for user:", currentUser.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('*') // Select all columns
          .eq('id', currentUser.id)
          .single(); // Expect only one row or null

        if (profileError && profileError.code !== 'PGRST116') { // Ignore 'PGRST116' (Row not found)
          console.error("Error fetching profile:", profileError);
          Alert.alert('Error', `Could not load profile: ${profileError.message}`);
        } else if (profileData) {
          console.log("Profile data found:", profileData);
          // 3. Populate State with fetched data
          setName(profileData.name || ''); // Use '' if null
          setHandedness(profileData.handedness || 'Right'); // Use default if null
          setUnits(profileData.preferred_units || 'Yards'); // Use default if null
          setSwingTendency(profileData.swing_tendency || 'Straight'); // Use default if null
          setClubDistances(profileData.club_distances || { /* ... empty clubs ... */ }); // Use empty if null
          setProfilePictureUrl(profileData.profile_picture); // Store existing URL
        } else {
           console.log("No existing profile found for user, using defaults.");
           // Keep default state values if no profile exists yet
        }

      } catch (error) {
        Alert.alert('Error', `Failed to load data: ${error.message}`);
      } finally {
        setIsSessionLoading(false);
      }
    };
    loadData();
  }, [navigation]); // Re-run if navigation changes (e.g., navigating back)

  // Request permissions (no change)
  useEffect(() => { /* ... */ }, []);

  // --- Event Handlers ---
  const handleClubDistanceChange = (club, value) => { /* ... */ };
  const handleImageUpload = async () => { /* ... sets profilePictureUri ... */ };

  // --- handleProfileSetup (Using UPSERT and Full Data) ---
  const handleProfileSetup = async () => {
    if (!user || !user.id) { Alert.alert('Error', 'User session not ready.'); return; }
    if (!name.trim()) { Alert.alert('Input Required', 'Please enter full name.'); return; }

    console.log("[Before Save] Attempting upsert for user:", user.id);
    setLoading(true);
    let uploadedImageUrl = profilePictureUrl; // Start with existing URL

    try {
        // Session refresh (keep for robustness)
        console.log("Refreshing session...");
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession?.user) throw new Error(`Session invalid: ${refreshError?.message}`);
        const currentUserId = refreshedSession.user.id; // Use refreshed ID
        console.log("[After Refresh] User ID confirmed:", currentUserId);

        // 1. Upload Image ONLY if a NEW one was selected
        if (profilePictureUri) {
            console.log("New profile picture selected, uploading...");
            const response = await fetch(profilePictureUri);
            const blob = await response.blob();
            const fileExt = profilePictureUri.split('.').pop();
            const fileName = `${currentUserId}_${Date.now()}.${fileExt}`;
            const filePath = `public/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob, { cacheControl: '3600', upsert: true, contentType: blob.type });
            if (uploadError) throw uploadError;

            const { data: urlData, error: urlError } = supabase.storage.from('avatars').getPublicUrl(filePath);
            if (urlError) throw urlError;
            uploadedImageUrl = urlData.publicUrl; // Update with NEW URL
             console.log("Image uploaded, URL:", uploadedImageUrl);
        } else {
            console.log("No new profile picture selected.");
        }

        // 2. Prepare Full Profile Data for Upsert
        const profileDataForUpsert = {
            id: currentUserId, // Include ID for upsert logic
            name: name.trim(),
            handedness: handedness,
            preferred_units: units,
            swing_tendency: swingTendency,
            club_distances: clubDistances,
            profile_picture: uploadedImageUrl, // Use existing or newly uploaded URL
            updated_at: new Date(),
        };
        // Note: created_at is usually handled by DB default on INSERT
        console.log("Data to upsert:", JSON.stringify(profileDataForUpsert, null, 2));

        // 3. *** Use UPSERT with full data and SECURE RLS policy ***
        const { error: profileError } = await supabase
            .from('profile')
            .upsert(profileDataForUpsert, {
                // onConflict: 'id' // Default behavior if PK is present
                returning: 'minimal' // Don't need data back
             })
            .eq('id', currentUserId); // Still good practice to ensure targeting

        if (profileError) throw profileError;

        // 4. Success
        Alert.alert('Success', 'Profile saved!');
        navigation.replace('Dashboard'); // Navigate on success

    } catch (error) {
        console.error("Profile Setup Error Object:", error); // Log full error
        let displayMessage = `Failed to save profile: ${error.message || 'Unknown error'}`;
        if (error.message && error.message.includes('violates row-level security policy')) {
           // This error might happen on INSERT if RLS is wrong
           displayMessage = 'Permission Denied (RLS). Ensure policies allow insert/update for your user.';
        } else if (error.code === '22P02') { // Enum error
           displayMessage = `Invalid value selected. Error: ${error.message}`;
        } else if (error.message) {
            displayMessage = `Save Error: ${error.message}`;
        }
        Alert.alert('Error', displayMessage);
    } finally { setLoading(false); }
  };


  // --- UI Rendering ---
  const textInputClass = "bg-white/10 border border-white/20 rounded-md px-4 py-3 mb-4 text-white h-[50px]";

  if (isSessionLoading) {
    // *** FIX: Correct structure for returning JSX ***
    return (
      <SafeAreaView className="flex-1 bg-looprPurple justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-looprPurple" edges={['bottom', 'left', 'right']}>
      <ScrollView /* ... props ... */ >
        <Text className="text-3xl ...">Profile Setup</Text>

        {/* Profile Picture - Use profilePictureUrl from DB first, then fallback */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={handleImageUpload} className="mb-2">
            <Image
              // Show picker URI if selected, else DB URL, else default
              source={profilePictureUri ? { uri: profilePictureUri } : (profilePictureUrl ? { uri: profilePictureUrl } : defaultProfilePic)}
              className="w-32 h-32 rounded-full border-2 border-white/50"
              resizeMode="cover"
            />
            {/* ... Edit overlay ... */}
          </TouchableOpacity>
          {/* ... Tap text ... */}
        </View>

        {/* Full Name - Populated from state */}
        <Text className="text-white mb-1 ml-1">Full Name</Text>
        <TextInput className={textInputClass} value={name} onChangeText={setName} /* ... other props ... */ />

        {/* --- Dropdowns - Simplify Styling for Interactivity Test --- */}

        {/* Handedness Dropdown */}
        <Text className="text-white mb-1 ml-1 mt-4">Handedness</Text>
        <ModalDropdown
            options={handednessOptions}
            style={styles.dropdownButton} // Basic button style
            textStyle={styles.dropdownButtonText} // Basic text style
            dropdownStyle={styles.modalDropdownMenu} // Basic menu style
            dropdownTextStyle={styles.modalDropdownRowText} // Basic row text style
            dropdownTextHighlightStyle={styles.modalDropdownRowTextHighlight} // Basic highlight
            defaultValue={handedness} // Use state value directly
            onSelect={(index, value) => { setHandedness(value); console.log(`Handedness: ${value}`); }}
        />

        {/* Units Dropdown */}
        <Text className="text-white mb-1 ml-1 mt-4">Preferred Units</Text>
        <ModalDropdown
            options={unitsOptions}
            style={styles.dropdownButton}
            textStyle={styles.dropdownButtonText}
            dropdownStyle={styles.modalDropdownMenu}
            dropdownTextStyle={styles.modalDropdownRowText}
            dropdownTextHighlightStyle={styles.modalDropdownRowTextHighlight}
            defaultValue={units}
            onSelect={(index, value) => { setUnits(value); console.log(`Units: ${value}`); }}
        />

        {/* Swing Tendency Dropdown */}
        <Text className="text-white mb-1 ml-1 mt-4">Typical Shot Shape</Text>
        <ModalDropdown
            options={swingTendencyOptions}
            style={styles.dropdownButton}
            textStyle={styles.dropdownButtonText}
            dropdownStyle={styles.modalDropdownMenu}
            dropdownTextStyle={styles.modalDropdownRowText}
            dropdownTextHighlightStyle={styles.modalDropdownRowTextHighlight}
            defaultValue={swingTendency}
            onSelect={(index, value) => { setSwingTendency(value); console.log(`Swing Tendency: ${value}`); }}
        />

        {/* Club Distances - Populated from state */}
        <Text className="text-xl ...">Club Distances ({units})</Text>
        {Object.keys(clubDistances).map((club) => (
          <View key={club} /* ... */ >
            <Text /* ... */ >{club}</Text>
            <TextInput value={clubDistances[club] || ''} /* Use empty string if value is null/undefined */ /* ... other props ... */ />
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity onPress={handleProfileSetup} /* ... */ >
         {/* ... */}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} // *** End of Component function ***


// --- Styles for ModalDropdown (Simplified for Debugging Interaction) ---
const styles = StyleSheet.create({
  // Basic style for the touchable button area
  dropdownButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    height: 50,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center', // Center text vertically
  },
   // Style for text shown in the button (using textStyle prop)
  dropdownButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // Basic style for the dropdown list container
  modalDropdownMenu: {
    width: '88%',
    marginTop: 5, // Small gap below button
    backgroundColor: '#1E1E1E', // Dark Opaque Background
    borderRadius: 8,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    maxHeight: 200,
    // Removed zIndex/elevation temporarily to test base function
  },
  // Style for text in each dropdown row
  modalDropdownRowText: {
    color: 'white', // Ensure text is visible
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  // Style for highlighted row text
  modalDropdownRowTextHighlight: {
    color: 'lightblue', // Visible highlight
  },
  // Separator not strictly needed for basic function test
  // separatorStyle: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', }
});