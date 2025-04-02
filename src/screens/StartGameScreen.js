// screens/StartGameScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GOLF_API_KEY } from '@env';

console.log("Golf API Key:", GOLF_API_KEY); // test



export default function StartGameScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a course name to search.');
      return;
    }
  
    try {
      setLoading(true);

      console.log("sending key", `KEY ${GOLF_API_KEY}`);
  
      const response = await fetch(
        `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Key ${GOLF_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('✅ API response:', data);
  
      setResults(data.courses || []);
    } catch (error) {
      console.error('❌ API Error:', error);
      alert('There was a problem fetching course data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleCourseSelect = (course) => {
    // In the future, navigate to tee/hole selection or start game
    console.log('Selected course:', course);
    navigation.navigate('GameSetup', { course });
  };

  return (
    <SafeAreaView className="flex-1 bg-looprPurple px-4 pt-8">
      <Text className="text-white text-2xl font-bold mb-4 text-center">Start a Round</Text>

      {/* Search Input */}
      <View className="flex-row items-center mb-4">
        <TextInput
          className="flex-1 bg-white rounded-md px-4 py-3 mr-2"
          placeholder="Search for a course..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleSearch} className="bg-white p-3 rounded-md">
          <Ionicons name="search" size={20} color="#4B2E83" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCourseSelect(item)}
              className="bg-white rounded-md p-4 mb-3"
            >
              <Text className="text-looprPurple font-semibold text-lg">{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ------------------
// FUTURE PLAN (commented)
// ------------------
// - Integrate with real golf course API (based on location or search query)
// - After course is selected:
//     -> Show tee box options (from API or hardcoded)
//     -> Show play mode (Front 9, Back 9, Full 18)
//     -> Select game type (Solo, Friends - future)
//     -> Start game and load overhead view w/ GPS
// - Track shots, scores, and show real-time pin distance using GPS + map
// - Save full round history and analytics
// - Allow voice/caddy interaction during game (if enabled)
