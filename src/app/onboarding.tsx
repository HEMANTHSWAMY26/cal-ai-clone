import React, { useState } from 'react';
import { StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput } from '@/tw';

const { width, height } = Dimensions.get('window');

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
    <View className="flex-1 bg-black justify-between p-6">
      {/* Top Header Bar */}
      <View className="flex-row justify-between items-center mt-12">
        {currentSlide > 0 ? (
          <Pressable 
            onPress={handleBack}
            className="flex-row items-center p-2 rounded-full bg-card-primary border border-accent-green/20"
          >
            <Feather name="arrow-left" size={18} color="#30D158" />
          </Pressable>
        ) : (
          <View className="w-9 h-9" /> // placeholder
        )}
        
        <Text className="text-white text-lg font-bold font-rounded">
          CAL<Text className="text-accent-green">.AI</Text>
        </Text>

        <Pressable 
          onPress={async () => {
            await AsyncStorage.setItem('@onboarding_completed', 'true');
            router.replace('/auth');
          }}
          className="p-2"
        >
          <Text className="text-text-secondary text-sm font-semibold">Skip</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 justify-center items-center py-6">
        {currentSlide === 0 && (
          <View className="items-center w-full px-4">
            <View className="w-48 h-48 bg-accent-green/10 border-2 border-accent-green/30 rounded-full justify-center items-center mb-8 relative">
              <View className="absolute inset-2 border border-accent-green/20 border-dashed rounded-full" />
              <Feather name="camera" size={64} color="#30D158" />
              <View className="absolute w-full h-1 bg-accent-green top-1/2 left-0 shadow-[0_0_15px_#30D158]" />
            </View>
            <Text className="text-white text-2xl font-bold font-rounded text-center">
              AI Food Recognition
            </Text>
            <Text className="text-text-secondary text-base text-center mt-4 leading-relaxed">
              Snap a photo of your meal to get instant, accurate calorie and macronutrient breakdowns using Gemini 2.5 Flash Vision.
            </Text>
          </View>
        )}

        {currentSlide === 1 && (
          <View className="items-center w-full px-4">
            <View className="w-48 h-48 bg-card-primary border border-card-secondary rounded-3xl p-4 justify-between mb-8 shadow-xl">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider">Macros</Text>
                <Feather name="award" size={16} color="#30D158" />
              </View>
              <View className="h-2 w-full bg-card-secondary rounded-full overflow-hidden">
                <View className="h-full w-4/5 bg-accent-green" />
              </View>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-white text-xs font-bold">150g</Text>
                  <Text className="text-text-secondary text-[9px] uppercase">Protein</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xs font-bold">200g</Text>
                  <Text className="text-text-secondary text-[9px] uppercase">Carbs</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xs font-bold">65g</Text>
                  <Text className="text-text-secondary text-[9px] uppercase">Fat</Text>
                </View>
              </View>
            </View>
            <Text className="text-white text-2xl font-bold font-rounded text-center">
              Calorie & Macro Tracker
            </Text>
            <Text className="text-text-secondary text-base text-center mt-4 leading-relaxed">
              Set customized daily goals, log breakfast, lunch, and dinner, check your weekly graphs, and maintain your streak!
            </Text>
          </View>
        )}

        {currentSlide === 2 && (
          <ScrollView className="w-full px-4" contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <Text className="text-white text-2xl font-bold font-rounded text-center mb-2">
              Set Your Daily Goals
            </Text>
            <Text className="text-text-secondary text-sm text-center mb-6">
              Establish your targets. You can modify these anytime.
            </Text>

            {/* Inputs Panel */}
            <View className="w-full bg-card-primary border border-card-secondary rounded-3xl p-5 gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-base font-semibold">Calories (kcal)</Text>
                <TextInput
                  value={calorieGoal}
                  onChangeText={setCalorieGoal}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white font-bold text-center px-4 py-2 rounded-xl w-24"
                />
              </View>

              <View className="h-[1px] bg-card-secondary" />

              <View className="flex-row justify-between items-center">
                <Text className="text-white text-base font-semibold">Protein (g)</Text>
                <TextInput
                  value={proteinGoal}
                  onChangeText={setProteinGoal}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white font-bold text-center px-4 py-2 rounded-xl w-24"
                />
              </View>

              <View className="h-[1px] bg-card-secondary" />

              <View className="flex-row justify-between items-center">
                <Text className="text-white text-base font-semibold">Carbs (g)</Text>
                <TextInput
                  value={carbGoal}
                  onChangeText={setCarbGoal}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white font-bold text-center px-4 py-2 rounded-xl w-24"
                />
              </View>

              <View className="h-[1px] bg-card-secondary" />

              <View className="flex-row justify-between items-center">
                <Text className="text-white text-base font-semibold">Fat (g)</Text>
                <TextInput
                  value={fatGoal}
                  onChangeText={setFatGoal}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white font-bold text-center px-4 py-2 rounded-xl w-24"
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Footer Indicator & Button */}
      <View className="mb-10 items-center gap-6">
        {/* Indicators */}
        <View className="flex-row gap-2">
          {[0, 1, 2].map((idx) => (
            <View 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-accent-green' : 'w-2 bg-text-muted'
              }`}
            />
          ))}
        </View>

        {/* Action Button */}
        <Pressable 
          onPress={handleNext}
          className="w-full bg-accent-green py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-lg shadow-accent-green/20"
        >
          <Text className="text-black font-extrabold text-lg font-rounded">
            {currentSlide === 2 ? "Let's Go" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={18} color="black" />
        </Pressable>
      </View>
    </View>
  );
}
