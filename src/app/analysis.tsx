import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput, Image } from '@/tw';

const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const router = useRouter();
  const activeAnalysis = useAppStore((state) => state.activeAnalysis);
  const addMeal = useAppStore((state) => state.addMeal);
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);

  // Form states initialized with AI results or defaults
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [confidence, setConfidence] = useState(100);

  useEffect(() => {
    if (activeAnalysis && activeAnalysis.result) {
      const { result } = activeAnalysis;
      setFoodName(result.food_name || '');
      setCalories(String(result.calories || 0));
      setProtein(String(result.protein || 0));
      setCarbs(String(result.carbs || 0));
      setFat(String(result.fat || 0));
      setConfidence(Math.round((result.confidence || 0.85) * 100));
    } else {
      // Manual input mode default setup
      setFoodName('');
      setCalories('250');
      setProtein('15');
      setCarbs('30');
      setFat('8');
      setConfidence(100); // 100% confidence for manual logging
    }
  }, [activeAnalysis]);

  const handleSave = async () => {
    if (!foodName) {
      alert("Please enter a name for the food.");
      return;
    }

    try {
      await addMeal({
        food_name: foodName,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        image_url: activeAnalysis?.imageUri || undefined,
      });

      // Clear analysis state
      setActiveAnalysis(null);

      // Return back
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (err) {
      console.error("Save meal error:", err);
      alert("Failed to save meal. Please try again.");
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-accent-green';
    if (score >= 70) return 'text-accent-orange';
    return 'text-danger';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header bar */}
        <View className="px-6 pt-16 pb-4 flex-row justify-between items-center border-b border-card-secondary/20">
          <Pressable 
            onPress={() => {
              setActiveAnalysis(null);
              router.back();
            }}
            className="flex-row items-center gap-1 p-2 rounded-full bg-card-primary"
          >
            <Feather name="chevron-left" size={20} color="white" />
          </Pressable>
          <Text className="text-white text-lg font-bold font-rounded">
            {activeAnalysis?.result ? "AI Analysis" : "Manual Log"}
          </Text>
          <Pressable 
            onPress={handleSave}
            className="bg-accent-green/20 px-4 py-2 rounded-full border border-accent-green/30"
          >
            <Text className="text-accent-green font-bold text-xs">Save</Text>
          </Pressable>
        </View>

        {/* Food Image Preview */}
        {activeAnalysis?.imageUri ? (
          <View className="mx-6 mt-6 rounded-3xl overflow-hidden border border-card-secondary shadow-lg relative h-48 bg-card-primary">
            <Image 
              source={{ uri: activeAnalysis.imageUri }}
              className="w-full h-full object-cover"
            />
            {/* Visual scanned overlay lines */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent justify-end p-4">
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 bg-accent-green rounded-full animate-ping" />
                <Text className="text-white text-xs font-semibold font-rounded">
                  AI Scanned Food Item
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-3xl p-6 items-center justify-center gap-2">
            <Feather name="edit" size={32} color="#8E8E93" />
            <Text className="text-white font-bold text-sm">Manual Logging Mode</Text>
            <Text className="text-text-secondary text-xs text-center max-w-xs">
              Enter your food details and customize macros manually.
            </Text>
          </View>
        )}

        {/* AI Confidence Badge */}
        {activeAnalysis?.result && (
          <View className="mx-6 mt-4 bg-card-primary border border-card-secondary rounded-2xl p-4 flex-row justify-between items-center">
            <View className="flex-row items-center gap-2.5">
              <Feather name="cpu" size={18} color="#30D158" />
              <Text className="text-white text-sm font-semibold">Gemini Vision Match</Text>
            </View>
            <Text className={`font-black text-sm font-rounded ${getConfidenceColor(confidence)}`}>
              {confidence}% Confidence
            </Text>
          </View>
        )}

        {/* Nutritional Data Form */}
        <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-3xl p-5 gap-5 shadow-xl">
          <View className="gap-2">
            <Text className="text-text-secondary text-xs uppercase font-extrabold tracking-wider font-rounded">
              Food Item Name
            </Text>
            <View className="flex-row items-center bg-black border border-card-secondary rounded-xl px-3 py-3.5">
              <TextInput
                value={foodName}
                onChangeText={setFoodName}
                placeholder="e.g. Avocado Salad"
                placeholderTextColor="#48484A"
                className="text-white text-sm font-semibold flex-1"
              />
            </View>
          </View>

          {/* Calories Row */}
          <View className="gap-2">
            <Text className="text-text-secondary text-xs uppercase font-extrabold tracking-wider font-rounded">
              Calories (kcal)
            </Text>
            <View className="flex-row items-center bg-black border border-card-secondary rounded-xl px-3 py-3.5">
              <TextInput
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                className="text-accent-green text-lg font-black font-rounded flex-1"
              />
            </View>
          </View>

          <View className="h-[1px] bg-card-secondary/20" />

          {/* Macros Row inputs */}
          <Text className="text-white text-xs font-bold uppercase tracking-wider">Macronutrients</Text>
          
          <View className="flex-row gap-3">
            {/* Protein */}
            <View className="flex-1 gap-2">
              <Text className="text-text-secondary text-[10px] uppercase font-bold text-center">Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                className="bg-black border border-card-secondary text-white text-center py-3.5 rounded-xl font-bold font-rounded"
              />
            </View>

            {/* Carbs */}
            <View className="flex-1 gap-2">
              <Text className="text-text-secondary text-[10px] uppercase font-bold text-center">Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                className="bg-black border border-card-secondary text-white text-center py-3.5 rounded-xl font-bold font-rounded"
              />
            </View>

            {/* Fat */}
            <View className="flex-1 gap-2">
              <Text className="text-text-secondary text-[10px] uppercase font-bold text-center">Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                className="bg-black border border-card-secondary text-white text-center py-3.5 rounded-xl font-bold font-rounded"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6 mt-8">
          <Pressable 
            onPress={handleSave}
            className="w-full bg-accent-green py-4 rounded-2xl items-center justify-center shadow-lg shadow-accent-green/10"
          >
            <Text className="text-black font-extrabold text-lg font-rounded">
              Log to Diary
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
