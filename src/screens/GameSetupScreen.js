import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameSetupScreen({ route, navigation }) {
  const { course } = route.params;
  const [selectedTee, setSelectedTee] = useState(null);
  const [holeOption, setHoleOption] = useState('Full 18');

  const maleTees = course.tees?.male || [];
  const femaleTees = course.tees?.female || [];

  const handleStart = () => {
    console.log('Course:', course.course_name);
    console.log('Tee:', selectedTee);
    console.log('Hole Option:', holeOption);
    // navigation.navigate('GamePlay', { course, selectedTee, holeOption });
  };

  return (
    <SafeAreaView className="flex-1 bg-looprPurple px-4 pt-6">
      <ScrollView>
        <Text className="text-white text-2xl font-bold mb-4 text-center">Game Setup</Text>
        <Text className="text-white text-xl mb-2">{course.club_name} - {course.course_name}</Text>

        <Text className="text-white text-lg mt-4 mb-2">Select Tee Box</Text>
        <View className="flex-row flex-wrap">
          {maleTees.map((tee, index) => (
            <TouchableOpacity
              key={`male-${index}`}
              className={`px-4 py-2 rounded-full mr-2 mb-2 ${selectedTee?.tee_name === tee.tee_name ? 'bg-white' : 'bg-white/20'}`}
              onPress={() => setSelectedTee(tee)}
            >
              <Text className={`font-semibold ${selectedTee?.tee_name === tee.tee_name ? 'text-looprPurple' : 'text-white'}`}>
                {tee.tee_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-white text-lg mt-6 mb-2">Play Mode</Text>
        <View className="flex-row">
          {['Front 9', 'Back 9', 'Full 18'].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setHoleOption(option)}
              className={`px-4 py-2 rounded-full mr-3 ${holeOption === option ? 'bg-white' : 'bg-white/20'}`}
            >
              <Text className={`font-semibold ${holeOption === option ? 'text-looprPurple' : 'text-white'}`}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleStart}
          className="bg-green-500 py-4 rounded-xl mt-8"
        >
          <Text className="text-center text-white text-lg font-bold">Start Round</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
