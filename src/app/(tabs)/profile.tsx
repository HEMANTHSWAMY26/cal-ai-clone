import React, { useState } from 'react';
import { ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput } from '@/tw';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const goals = useAppStore((state) => state.goals);
  const logout = useAppStore((state) => state.logout);
  const updateGoals = useAppStore((state) => state.updateGoals);

  // Local states for goal editing
  const [calorieGoal, setCalorieGoal] = useState(String(goals.calorie_goal));
  const [proteinGoal, setProteinGoal] = useState(String(goals.protein_goal));
  const [carbGoal, setCarbGoal] = useState(String(goals.carb_goal));
  const [fatGoal, setFatGoal] = useState(String(goals.fat_goal));
  const [isEditingGoals, setIsEditingGoals] = useState(false);

  // Settings Mock States
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const handleSaveGoals = async () => {
    const c = parseInt(calorieGoal);
    const p = parseInt(proteinGoal);
    const cb = parseInt(carbGoal);
    const f = parseInt(fatGoal);

    if (isNaN(c) || isNaN(p) || isNaN(cb) || isNaN(f)) {
      alert("Please enter valid numeric goals.");
      return;
    }

    await updateGoals({
      calorie_goal: c,
      protein_goal: p,
      carb_goal: cb,
      fat_goal: f,
    });

    setIsEditingGoals(false);
    Alert.alert("Goals Updated", "Your daily targets have been successfully saved.");
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#050505]"
    >
      <ScrollView 
        className="flex-grow"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6 border-b border-[#1E1E1E]">
          <Text className="text-text-secondary text-[10px] uppercase font-black tracking-[2px] font-rounded">
            Account Management
          </Text>
          <Text className="text-white text-2xl font-black mt-1 font-rounded">
            Profile Settings
          </Text>
        </View>

        {/* User Card */}
        <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-[32px] p-6 flex-row items-center gap-4 shadow-xl">
          <View className="w-14 h-14 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full justify-center items-center">
            <Feather name="user" size={22} color="#22C55E" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-black font-rounded">
              {user?.name || 'User'}
            </Text>
            <Text className="text-[#A1A1AA] text-xs mt-0.5">
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>

        {/* Daily Goals Editor */}
        <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-[32px] p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-xs font-black font-rounded uppercase tracking-wider">
              Daily Nutrition Goals
            </Text>
            {isEditingGoals ? (
              <Pressable onPress={handleSaveGoals} className="bg-[#22C55E]/10 border border-[#22C55E]/20 px-3.5 py-1.5 rounded-full">
                <Text className="text-[#22C55E] font-black text-xs font-rounded">Save</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setIsEditingGoals(true)} className="bg-[#181818] border border-[#1E1E1E] px-3.5 py-1.5 rounded-full">
                <Text className="text-[#A1A1AA] font-black text-xs font-rounded">Edit</Text>
              </Pressable>
            )}
          </View>

          <View className="gap-4">
            {/* Calories */}
            <View className="flex-row justify-between items-center">
              <Text className="text-[#A1A1AA] text-sm font-semibold">Calorie Target</Text>
              {isEditingGoals ? (
                <TextInput
                  value={calorieGoal}
                  onChangeText={setCalorieGoal}
                  keyboardType="numeric"
                  className="bg-black border border-[#1E1E1E] text-[#22C55E] text-center font-black px-3 py-1.5 rounded-lg w-20 text-sm"
                />
              ) : (
                <Text className="text-white font-black text-sm font-rounded">
                  {goals.calorie_goal} <Text className="text-[#A1A1AA] text-xs font-normal">kcal</Text>
                </Text>
              )}
            </View>

            <View className="h-[1px] bg-[#1E1E1E]" />

            {/* Protein */}
            <View className="flex-row justify-between items-center">
              <Text className="text-[#A1A1AA] text-sm font-semibold">Protein Target</Text>
              {isEditingGoals ? (
                <TextInput
                  value={proteinGoal}
                  onChangeText={setProteinGoal}
                  keyboardType="numeric"
                  className="bg-black border border-[#1E1E1E] text-white text-center font-black px-3 py-1.5 rounded-lg w-20 text-sm"
                />
              ) : (
                <Text className="text-white font-black text-sm font-rounded">
                  {goals.protein_goal} <Text className="text-[#A1A1AA] text-xs font-normal">g</Text>
                </Text>
              )}
            </View>

            <View className="h-[1px] bg-[#1E1E1E]" />

            {/* Carbs */}
            <View className="flex-row justify-between items-center">
              <Text className="text-[#A1A1AA] text-sm font-semibold">Carbs Target</Text>
              {isEditingGoals ? (
                <TextInput
                  value={carbGoal}
                  onChangeText={setCarbGoal}
                  keyboardType="numeric"
                  className="bg-black border border-[#1E1E1E] text-white text-center font-black px-3 py-1.5 rounded-lg w-20 text-sm"
                />
              ) : (
                <Text className="text-white font-black text-sm font-rounded">
                  {goals.carb_goal} <Text className="text-[#A1A1AA] text-xs font-normal">g</Text>
                </Text>
              )}
            </View>

            <View className="h-[1px] bg-[#1E1E1E]" />

            {/* Fat */}
            <View className="flex-row justify-between items-center">
              <Text className="text-[#A1A1AA] text-sm font-semibold">Fat Target</Text>
              {isEditingGoals ? (
                <TextInput
                  value={fatGoal}
                  onChangeText={setFatGoal}
                  keyboardType="numeric"
                  className="bg-black border border-[#1E1E1E] text-white text-center font-black px-3 py-1.5 rounded-lg w-20 text-sm"
                />
              ) : (
                <Text className="text-white font-black text-sm font-rounded">
                  {goals.fat_goal} <Text className="text-[#A1A1AA] text-xs font-normal">g</Text>
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Preferences / Units */}
        <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-[32px] p-6 shadow-xl gap-4">
          <Text className="text-white text-xs font-black font-rounded uppercase tracking-wider mb-2">
            App Settings
          </Text>

          <View className="flex-row justify-between items-center">
            <Text className="text-[#A1A1AA] text-sm font-semibold">Weight Units</Text>
            <View className="flex-row bg-black border border-[#1E1E1E] p-1 rounded-full">
              <Pressable 
                onPress={() => setWeightUnit('kg')}
                className={`px-3 py-1 rounded-full ${weightUnit === 'kg' ? 'bg-[#22C55E]' : 'bg-transparent'}`}
              >
                <Text className={`text-[10px] font-black ${weightUnit === 'kg' ? 'text-black' : 'text-text-secondary'}`}>
                  KG
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => setWeightUnit('lbs')}
                className={`px-3 py-1 rounded-full ${weightUnit === 'lbs' ? 'bg-[#22C55E]' : 'bg-transparent'}`}
              >
                <Text className={`text-[10px] font-black ${weightUnit === 'lbs' ? 'text-black' : 'text-text-secondary'}`}>
                  LBS
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="h-[1px] bg-[#1E1E1E]" />

          {/* Version / About */}
          <View className="flex-row justify-between items-center">
            <Text className="text-[#A1A1AA] text-sm font-semibold">App Version</Text>
            <Text className="text-white font-black text-xs font-rounded">1.0.0 (Expo SDK 56)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-10">
          <Pressable 
            onPress={handleLogout}
            className="w-full bg-red-500/10 border border-red-500/20 py-4 rounded-2xl items-center justify-center active:bg-red-500/20"
          >
            <Text className="text-[#FF453A] font-black text-sm uppercase tracking-wider font-rounded">
              Log Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
