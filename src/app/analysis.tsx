import React, { useState, useEffect } from 'react';
import { ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput, Image } from '@/tw';

export default function AnalysisScreen() {
  const router = useRouter();
  const activeAnalysis = useAppStore((state) => state.activeAnalysis);
  const addMeal = useAppStore((state) => state.addMeal);
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);

  // Form states
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
      setFoodName('');
      setCalories('250');
      setProtein('15');
      setCarbs('30');
      setFat('8');
      setConfidence(100);
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

      setActiveAnalysis(null);

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
    if (score >= 90) return 'text-[#22C55E]';
    if (score >= 70) return 'text-[#FF9F0A]';
    return 'text-[#FF453A]';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#050505]"
    >
      <ScrollView 
        className="flex-grow"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header bar */}
        <View className="px-6 pt-16 pb-6 flex-row justify-between items-center border-b border-[#1E1E1E]">
          <Pressable 
            onPress={() => {
              setActiveAnalysis(null);
              router.back();
            }}
            className="flex-row items-center gap-1 p-2.5 rounded-full bg-[#111111] border border-[#1E1E1E]"
          >
            <Feather name="chevron-left" size={16} color="white" />
          </Pressable>
          <Text className="text-white text-lg font-black font-rounded">
            {activeAnalysis?.result ? "AI Analysis" : "Manual Log"}
          </Text>
          <Pressable 
            onPress={handleSave}
            className="bg-[#22C55E]/10 border border-[#22C55E]/20 px-4 py-2 rounded-full"
          >
            <Text className="text-[#22C55E] font-black text-xs font-rounded">Save</Text>
          </Pressable>
        </View>

        {/* Food Image Preview */}
        {activeAnalysis?.imageUri ? (
          <View className="mx-6 mt-6 rounded-[24px] overflow-hidden border border-[#1E1E1E] shadow-xl relative h-48 bg-[#111111]">
            <Image 
              source={{ uri: activeAnalysis.imageUri }}
              className="w-full h-full object-cover"
            />
            {/* Visual scanned overlay lines */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent justify-end p-4">
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 bg-[#22C55E] rounded-full" />
                <Text className="text-white text-xs font-black font-rounded">
                  AI Scanned Food Photograph
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-6 items-center justify-center gap-2">
            <Feather name="edit" size={24} color="#A1A1AA" />
            <Text className="text-white font-black text-sm font-rounded">Manual Logging Mode</Text>
            <Text className="text-[#A1A1AA] text-xs text-center max-w-[260px] leading-relaxed">
              Enter your food details and customize macros manually.
            </Text>
          </View>
        )}

        {/* AI Confidence Badge */}
        {activeAnalysis?.result && (
          <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4 flex-row justify-between items-center shadow">
            <View className="flex-row items-center gap-2.5">
              <Feather name="cpu" size={16} color="#22C55E" />
              <Text className="text-[#A1A1AA] text-xs font-bold uppercase tracking-wider">Gemini Match Rate</Text>
            </View>
            <Text className={`font-black text-sm font-rounded ${getConfidenceColor(confidence)}`}>
              {confidence}% Confidence
            </Text>
          </View>
        )}

        {/* Nutritional Data Form */}
        <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-5 gap-5 shadow-xl">
          <View className="gap-1.5">
            <Text className="text-[#A1A1AA] text-[10px] uppercase font-black tracking-wider">
              Food Item Name
            </Text>
            <View className="flex-row items-center bg-black border border-[#1E1E1E] rounded-xl px-3 py-3">
              <TextInput
                value={foodName}
                onChangeText={setFoodName}
                placeholder="e.g. Grilled Salmon Salad"
                placeholderTextColor="#71717A"
                className="text-white text-sm font-bold flex-1"
              />
            </View>
          </View>

          {/* Calories Row */}
          <View className="gap-1.5">
            <Text className="text-[#A1A1AA] text-[10px] uppercase font-black tracking-wider">
              Calories (kcal)
            </Text>
            <View className="flex-row items-center bg-black border border-[#1E1E1E] rounded-xl px-3 py-3">
              <TextInput
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                className="text-[#22C55E] text-base font-black font-rounded flex-1"
              />
            </View>
          </View>

          <View className="h-[1px] bg-[#1E1E1E]" />

          {/* Macros Row inputs */}
          <Text className="text-white text-xs font-black uppercase tracking-wider">Macronutrients</Text>
          
          <View className="flex-row gap-3">
            {/* Protein */}
            <View className="flex-1 gap-1.5">
              <Text className="text-[#A1A1AA] text-[9px] uppercase font-black text-center">Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                className="bg-black border border-[#1E1E1E] text-white text-center py-2.5 rounded-xl font-black font-rounded"
              />
            </View>

            {/* Carbs */}
            <View className="flex-1 gap-1.5">
              <Text className="text-[#A1A1AA] text-[9px] uppercase font-black text-center">Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                className="bg-black border border-[#1E1E1E] text-white text-center py-2.5 rounded-xl font-black font-rounded"
              />
            </View>

            {/* Fat */}
            <View className="flex-1 gap-1.5">
              <Text className="text-[#A1A1AA] text-[9px] uppercase font-black text-center">Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                className="bg-black border border-[#1E1E1E] text-white text-center py-2.5 rounded-xl font-black font-rounded"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6 mt-8">
          <Pressable 
            onPress={handleSave}
            className="w-full bg-[#22C55E] py-4 rounded-2xl items-center justify-center shadow-lg shadow-[#22C55E]/10"
          >
            <Text className="text-black font-black text-base font-rounded">
              Log to Diary
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
