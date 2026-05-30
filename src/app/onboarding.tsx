import React, { useState } from 'react';
import { StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput } from '@/tw';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const updateGoals = useAppStore((state) => state.updateGoals);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Goals configuration state
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [proteinGoal, setProteinGoal] = useState('150');
  const [carbGoal, setCarbGoal] = useState('200');
  const [fatGoal, setFatGoal] = useState('65');

  const handleNext = async () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Save goals to store
      await updateGoals({
        calorie_goal: parseInt(calorieGoal) || 2000,
        protein_goal: parseInt(proteinGoal) || 150,
        carb_goal: parseInt(carbGoal) || 200,
        fat_goal: parseInt(fatGoal) || 65,
      });
      
      // Save onboarding complete flag
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      
      // Go to Auth
      router.replace('/auth');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <View className="flex-1 bg-[#050505] justify-between p-6">
      {/* Top Header Bar */}
      <View className="flex-row justify-between items-center mt-12">
        {currentSlide > 0 ? (
          <Pressable 
            onPress={handleBack}
            className="flex-row items-center p-2.5 rounded-full bg-[#111111] border border-[#1E1E1E]"
          >
            <Feather name="arrow-left" size={16} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View className="w-9 h-9" />
        )}
        
        <Text className="text-white text-lg font-black font-rounded tracking-[2px]">
          CAL<Text className="text-[#22C55E]">.AI</Text>
        </Text>

        <Pressable 
          onPress={async () => {
            await AsyncStorage.setItem('@onboarding_completed', 'true');
            router.replace('/auth');
          }}
          className="p-2"
        >
          <Text className="text-[#A1A1AA] text-xs font-bold">Skip</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 justify-center items-center py-6 w-full">
        {currentSlide === 0 && (
          <View className="items-center w-full px-4">
            <View className="w-44 h-44 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-full justify-center items-center mb-8 relative shadow-lg shadow-[#22C55E]/5">
              <View className="absolute inset-2 border border-[#22C55E]/10 border-dashed rounded-full" />
              <Feather name="camera" size={54} color="#22C55E" />
              <View className="absolute w-[80%] h-0.5 bg-[#22C55E] top-1/2 left-[10%] shadow-md shadow-[#22C55E]" />
            </View>
            <Text className="text-white text-2xl font-black font-rounded text-center tracking-tight">
              AI Food Recognition
            </Text>
            <Text className="text-[#A1A1AA] text-sm text-center mt-4 leading-relaxed max-w-sm">
              Snap a photo of your meal to get instant, accurate calorie and macronutrient breakdowns using Gemini 2.5 Flash Vision.
            </Text>
          </View>
        )}

        {currentSlide === 1 && (
          <View className="items-center w-full px-4">
            <View className="w-52 h-44 bg-[#111111] border border-[#1E1E1E] rounded-[24px] p-5 justify-between mb-8 shadow-xl">
              <View className="flex-row justify-between items-center">
                <Text className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-wider">Macros Tracking</Text>
                <Feather name="award" size={16} color="#22C55E" />
              </View>
              <View className="h-2 w-full bg-[#181818] rounded-full overflow-hidden border border-[#1E1E1E]">
                <View className="h-full w-4/5 bg-[#22C55E] rounded-full" />
              </View>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-white text-xs font-black font-rounded">150g</Text>
                  <Text className="text-[#A1A1AA] text-[8px] uppercase font-bold mt-0.5">Protein</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xs font-black font-rounded">200g</Text>
                  <Text className="text-[#A1A1AA] text-[8px] uppercase font-bold mt-0.5">Carbs</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xs font-black font-rounded">65g</Text>
                  <Text className="text-[#A1A1AA] text-[8px] uppercase font-bold mt-0.5">Fat</Text>
                </View>
              </View>
            </View>
            <Text className="text-white text-2xl font-black font-rounded text-center tracking-tight">
              Calorie & Macro Tracker
            </Text>
            <Text className="text-[#A1A1AA] text-sm text-center mt-4 leading-relaxed max-w-sm">
              Set customized daily goals, log breakfast, lunch, and dinner, check your weekly graphs, and maintain your streak!
            </Text>
          </View>
        )}

        {currentSlide === 2 && (
          <ScrollView className="w-full px-4" contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <Text className="text-white text-2xl font-black font-rounded text-center tracking-tight">
              Set Your Daily Goals
            </Text>
            <Text className="text-[#A1A1AA] text-xs text-center mt-2 mb-6">
              Establish your targets. You can modify these anytime.
            </Text>

            {/* Inputs Panel */}
            <View className="w-full bg-[#111111] border border-[#1E1E1E] rounded-3xl p-5 gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-sm font-extrabold">Calories (kcal)</Text>
                <TextInput
                  value={calorieGoal}
                  onChangeText={setCalorieGoal}
                  keyboardType="numeric"
                  placeholderTextColor="#71717A"
                  className="bg-black border border-[#1E1E1E] text-white font-bold text-center px-4 py-2 rounded-xl w-24 text-sm"
                />
              </View>

              <View className="h-[1px] bg-[#1E1E1E]" />

              <View className="flex-row justify-between items-center">
                <Text className="text-white text-sm font-extrabold">Protein (g)</Text>
                <TextInput
                  value={proteinGoal}
                  onChangeText={setProteinGoal}
                  keyboardType="numeric"
                  placeholderTextColor="#71717A"
                  className="bg-black border border-[#1E1E1E] text-white font-bold text-center px-4 py-2 rounded-xl w-24 text-sm"
                />
              </View>

              <View className="h-[1px] bg-[#1E1E1E]" />

              <View className="flex-row justify-between items-center">
                <Text className="text-white text-sm font-extrabold">Carbs (g)</Text>
                <TextInput
                  value={carbGoal}
                  onChangeText={setCarbGoal}
                  keyboardType="numeric"
                  placeholderTextColor="#71717A"
                  className="bg-black border border-[#1E1E1E] text-white font-bold text-center px-4 py-2 rounded-xl w-24 text-sm"
                />
              </View>

              <View className="h-[1px] bg-[#1E1E1E]" />

              <View className="flex-row justify-between items-center">
                <Text className="text-white text-sm font-extrabold">Fat (g)</Text>
                <TextInput
                  value={fatGoal}
                  onChangeText={setFatGoal}
                  keyboardType="numeric"
                  placeholderTextColor="#71717A"
                  className="bg-black border border-[#1E1E1E] text-white font-bold text-center px-4 py-2 rounded-xl w-24 text-sm"
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Footer Indicator & Button */}
      <View className="mb-10 items-center gap-6 w-full">
        {/* Indicators */}
        <View className="flex-row gap-2">
          {[0, 1, 2].map((idx) => (
            <View 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-[#22C55E]' : 'w-1.5 bg-[#1E1E1E]'
              }`}
            />
          ))}
        </View>

        {/* Action Button */}
        <Pressable 
          onPress={handleNext}
          className="w-full bg-[#22C55E] py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg shadow-[#22C55E]/10"
        >
          <Text className="text-black font-black text-base font-rounded">
            {currentSlide === 2 ? "Let's Go" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={16} color="black" />
        </Pressable>
      </View>
    </View>
  );
}
