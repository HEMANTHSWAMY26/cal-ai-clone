import React, { useState } from 'react';
import { ScrollView, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore, Meal } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput } from '@/tw';

export default function DiaryScreen() {
  const router = useRouter();
  const meals = useAppStore((state) => state.meals);
  const deleteMeal = useAppStore((state) => state.deleteMeal);
  const editMeal = useAppStore((state) => state.editMeal);

  // Active filter category: 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  const [activeTab, setActiveTab] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('All');
  
  // Edit Modal States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('0');
  const [editProtein, setEditProtein] = useState('0');
  const [editCarbs, setEditCarbs] = useState('0');
  const [editFat, setEditFat] = useState('0');

  // Helper to categorize a meal by its hour
  const getMealCategory = (isoString: string): 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' => {
    const date = new Date(isoString);
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Snacks';
  };

  // Filter meals for TODAY only (standard diary view matches today's diary)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(
    (m) => m.created_at.split('T')[0] === todayStr
  );

  // Filtered list based on active tab
  const filteredMeals = todayMeals.filter((m) => {
    if (activeTab === 'All') return true;
    return getMealCategory(m.created_at) === activeTab;
  });

  // Calculate totals for today
  const totalCalories = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = todayMeals.reduce((acc, curr) => acc + curr.protein, 0);
  const totalCarbs = todayMeals.reduce((acc, curr) => acc + curr.carbs, 0);
  const totalFat = todayMeals.reduce((acc, curr) => acc + curr.fat, 0);

  // Handle Delete Confirmation
  const handleDeleteConfirm = (id: string) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to remove this meal from your diary?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await deleteMeal(id);
          } 
        }
      ]
    );
  };

  // Handle Edit Action
  const handleEditPress = (meal: Meal) => {
    setEditingMeal(meal);
    setEditName(meal.food_name);
    setEditCalories(String(meal.calories));
    setEditProtein(String(meal.protein));
    setEditCarbs(String(meal.carbs));
    setEditFat(String(meal.fat));
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMeal) return;
    if (!editName) {
      alert("Meal name cannot be empty.");
      return;
    }

    await editMeal(editingMeal.id, {
      food_name: editName,
      calories: parseInt(editCalories) || 0,
      protein: parseInt(editProtein) || 0,
      carbs: parseInt(editCarbs) || 0,
      fat: parseInt(editFat) || 0,
    });

    setIsEditModalVisible(false);
    setEditingMeal(null);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Top Header */}
      <View className="px-6 pt-16 pb-4 flex-row justify-between items-center border-b border-card-secondary/20">
        <View>
          <Text className="text-text-secondary text-xs uppercase font-extrabold tracking-widest font-rounded">
            Daily Logger
          </Text>
          <Text className="text-white text-2xl font-black mt-0.5 font-rounded">
            Food Diary
          </Text>
        </View>
        <Pressable 
          onPress={() => router.push('/(tabs)/camera')}
          className="w-10 h-10 rounded-full bg-accent-green/10 border border-accent-green/30 justify-center items-center"
        >
          <Feather name="plus" size={20} color="#30D158" />
        </Pressable>
      </View>

      {/* Summary Box */}
      <View className="mx-6 mt-4 bg-card-primary border border-card-secondary rounded-3xl p-5 shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider">Today's Summary</Text>
          <Text className="text-white text-sm font-bold font-rounded">{totalCalories} kcal</Text>
        </View>
        
        {/* Progress Bar */}
        <View className="h-1.5 w-full bg-card-secondary rounded-full overflow-hidden mb-4">
          <View 
            style={{ width: `${Math.min((totalCalories / 2000) * 100, 100)}%` }} 
            className="h-full bg-accent-green" 
          />
        </View>

        {/* Mini Macros display */}
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-semibold">Protein</Text>
            <Text className="text-white text-sm font-bold mt-0.5">{totalProtein}g</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-semibold">Carbs</Text>
            <Text className="text-white text-sm font-bold mt-0.5">{totalCarbs}g</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary text-[10px] uppercase font-semibold">Fat</Text>
            <Text className="text-white text-sm font-bold mt-0.5">{totalFat}g</Text>
          </View>
        </View>
      </View>

      {/* Categories Tabs Selector */}
      <View className="mt-4 px-6">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 10 }}
        >
          {(['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full border ${
                activeTab === tab 
                  ? 'bg-accent-green border-accent-green' 
                  : 'bg-card-primary border-card-secondary'
              }`}
            >
              <Text className={`text-xs font-bold font-rounded ${
                activeTab === tab ? 'text-black' : 'text-text-secondary'
              }`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Logged Meals List */}
      <ScrollView 
        className="flex-1 mt-4 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredMeals.length === 0 ? (
          <View className="py-16 items-center justify-center gap-4">
            <View className="w-12 h-12 rounded-full bg-card-primary border border-card-secondary justify-center items-center">
              <Feather name="folder" size={20} color="#8E8E93" />
            </View>
            <View className="items-center">
              <Text className="text-white font-bold">No logs in this category</Text>
              <Text className="text-text-secondary text-xs text-center mt-1">
                Meals logged under "{activeTab}" today will appear here.
              </Text>
            </View>
          </View>
        ) : (
          <View className="gap-3">
            {filteredMeals.map((meal) => {
              const cat = getMealCategory(meal.created_at);
              return (
                <View 
                  key={meal.id}
                  className="bg-card-primary border border-card-secondary rounded-2xl p-4 flex-row justify-between items-center shadow-md relative"
                >
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-extrabold text-sm" numberOfLines={1}>
                        {meal.food_name}
                      </Text>
                      <View className="bg-card-secondary px-2 py-0.5 rounded-full">
                        <Text className="text-text-secondary text-[8px] uppercase font-bold">
                          {cat}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-text-secondary text-[11px] mt-1.5 font-medium">
                      P: {meal.protein}g  •  C: {meal.carbs}g  •  F: {meal.fat}g
                    </Text>
                  </View>
                  
                  {/* Actions buttons */}
                  <View className="flex-row items-center gap-3">
                    <Pressable 
                      onPress={() => handleEditPress(meal)}
                      className="w-8 h-8 rounded-full bg-card-secondary/50 justify-center items-center"
                    >
                      <Feather name="edit" size={14} color="#8E8E93" />
                    </Pressable>
                    
                    <Pressable 
                      onPress={() => handleDeleteConfirm(meal.id)}
                      className="w-8 h-8 rounded-full bg-danger/10 justify-center items-center"
                    >
                      <Feather name="trash-2" size={14} color="#FF453A" />
                    </Pressable>

                    <View className="items-end pl-2">
                      <Text className="text-accent-green font-black text-sm font-rounded">
                        {meal.calories}
                      </Text>
                      <Text className="text-text-muted text-[9px] uppercase mt-0.5">
                        kcal
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Editing Dialog Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-card-primary border-t border-card-secondary rounded-t-[32px] p-6 gap-5 shadow-2xl">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-bold font-rounded">Edit Logged Meal</Text>
              <Pressable 
                onPress={() => setIsEditModalVisible(false)}
                className="p-1 rounded-full bg-card-secondary"
              >
                <Feather name="x" size={16} color="white" />
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">Meal Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="bg-black border border-card-secondary text-white px-3 py-3 rounded-xl text-sm"
              />
            </View>

            <View className="gap-2">
              <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">Calories (kcal)</Text>
              <TextInput
                value={editCalories}
                onChangeText={setEditCalories}
                keyboardType="numeric"
                className="bg-black border border-card-secondary text-accent-green px-3 py-3 rounded-xl text-sm font-bold"
              />
            </View>

            {/* Macros row */}
            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-text-secondary text-[10px] uppercase font-semibold text-center">Protein (g)</Text>
                <TextInput
                  value={editProtein}
                  onChangeText={setEditProtein}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white text-center py-2.5 rounded-xl text-sm font-bold"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-text-secondary text-[10px] uppercase font-semibold text-center">Carbs (g)</Text>
                <TextInput
                  value={editCarbs}
                  onChangeText={setEditCarbs}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white text-center py-2.5 rounded-xl text-sm font-bold"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-text-secondary text-[10px] uppercase font-semibold text-center">Fat (g)</Text>
                <TextInput
                  value={editFat}
                  onChangeText={setEditFat}
                  keyboardType="numeric"
                  className="bg-black border border-card-secondary text-white text-center py-2.5 rounded-xl text-sm font-bold"
                />
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSaveEdit}
              className="bg-accent-green py-4 rounded-xl items-center mt-2 shadow shadow-accent-green/10"
            >
              <Text className="text-black font-extrabold text-base font-rounded">
                Save Changes
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
