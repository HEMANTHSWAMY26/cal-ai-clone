import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable } from '@/tw';
import ProgressRing from '@/components/ProgressRing';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const meals = useAppStore((state) => state.meals);
  const goals = useAppStore((state) => state.goals);
  const streak = useAppStore((state) => state.streak);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(
    (m) => m.created_at.split('T')[0] === todayStr
  );

  // Totals calculations
  const consumedCalories = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const consumedProtein = todayMeals.reduce((acc, curr) => acc + curr.protein, 0);
  const consumedCarbs = todayMeals.reduce((acc, curr) => acc + curr.carbs, 0);
  const consumedFat = todayMeals.reduce((acc, curr) => acc + curr.fat, 0);

  const remainingCalories = Math.max(goals.calorie_goal - consumedCalories, 0);

  const calorieProgress = goals.calorie_goal > 0 ? consumedCalories / goals.calorie_goal : 0;
  const proteinProgress = goals.protein_goal > 0 ? consumedProtein / goals.protein_goal : 0;
  const carbsProgress = goals.carb_goal > 0 ? consumedCarbs / goals.carb_goal : 0;
  const fatProgress = goals.fat_goal > 0 ? consumedFat / goals.fat_goal : 0;

  // Render recent meals (limit to 3)
  const recentMealsToShow = todayMeals.slice(0, 3);

  return (
    <ScrollView 
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header section */}
      <View className="px-6 pt-16 pb-4 flex-row justify-between items-center">
        <View>
          <Text className="text-text-secondary text-xs uppercase font-extrabold tracking-widest font-rounded">
            Dashboard
          </Text>
          <Text className="text-white text-2xl font-black mt-0.5 font-rounded">
            Hey, {user?.name || 'User'} 👋
          </Text>
        </View>
        <Pressable 
          onPress={() => router.push('/(tabs)/profile')}
          className="w-10 h-10 rounded-full bg-card-primary border border-card-secondary justify-center items-center"
        >
          <Feather name="settings" size={18} color="#8E8E93" />
        </Pressable>
      </View>

      {/* Main Calorie Ring Card */}
      <View className="mx-6 mt-2 bg-card-primary border border-card-secondary rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <View className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl" />
        
        <View className="flex-row justify-between items-center">
          {/* Calorie Stats */}
          <View className="flex-1 gap-4">
            <View>
              <Text className="text-text-secondary text-[10px] uppercase font-bold tracking-wider">Remaining</Text>
              <Text className="text-white text-3xl font-black font-rounded mt-1">
                {remainingCalories} <Text className="text-text-secondary text-sm font-medium">kcal</Text>
              </Text>
            </View>

            <View className="flex-row gap-6 mt-1">
              <View>
                <Text className="text-text-secondary text-[9px] uppercase font-semibold">Goal</Text>
                <Text className="text-white text-sm font-extrabold mt-0.5">
                  {goals.calorie_goal} <Text className="text-text-muted text-[10px]">kcal</Text>
                </Text>
              </View>
              <View>
                <Text className="text-text-secondary text-[9px] uppercase font-semibold">Logged</Text>
                <Text className="text-accent-green text-sm font-extrabold mt-0.5">
                  {consumedCalories} <Text className="text-accent-green/60 text-[10px]">kcal</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Calorie Circular Progress */}
          <View className="items-center justify-center">
            <ProgressRing
              progress={calorieProgress}
              size={90}
              strokeWidth={8}
              color="#30D158"
              label="Intake"
              value={`${consumedCalories} kcal`}
            />
          </View>
        </View>
      </View>

      {/* Macronutrient Breakdowns */}
      <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-3xl p-6 shadow-xl">
        <Text className="text-white text-sm font-extrabold font-rounded uppercase tracking-wider mb-5">
          Daily Macros
        </Text>
        
        <View className="flex-row justify-around items-center">
          <ProgressRing
            progress={proteinProgress}
            size={68}
            strokeWidth={6}
            color="#30D158"
            label="Protein"
            value={`${consumedProtein}g/${goals.protein_goal}g`}
          />
          <ProgressRing
            progress={carbsProgress}
            size={68}
            strokeWidth={6}
            color="#FF9F0A"
            label="Carbs"
            value={`${consumedCarbs}g/${goals.carb_goal}g`}
          />
          <ProgressRing
            progress={fatProgress}
            size={68}
            strokeWidth={6}
            color="#FF453A"
            label="Fat"
            value={`${consumedFat}g/${goals.fat_goal}g`}
          />
        </View>
      </View>

      {/* Streak Panel */}
      <Pressable 
        onPress={() => router.push('/streak')}
        className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-3xl p-5 shadow-xl flex-row items-center gap-4 active:opacity-90"
      >
        <View className="w-12 h-12 bg-accent-orange/10 border border-accent-orange/20 rounded-2xl justify-center items-center">
          <Feather name="zap" size={24} color="#FF9F0A" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-extrabold font-rounded">
            {streak.current_streak} Day Streak
          </Text>
          <Text className="text-text-secondary text-xs mt-0.5">
            {streak.current_streak > 0 
              ? "Awesome! Log a meal tomorrow to keep it going."
              : "Start logging your meals to build your daily streak!"}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color="#48484A" />
      </Pressable>

      {/* Today's Logged Meals */}
      <View className="mx-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-sm font-extrabold font-rounded uppercase tracking-wider">
            Today's Diary
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/diary')}>
            <Text className="text-accent-green text-xs font-semibold">View Diary</Text>
          </Pressable>
        </View>

        {todayMeals.length === 0 ? (
          <View className="bg-card-primary border border-card-secondary border-dashed rounded-3xl p-8 items-center justify-center gap-4">
            <View className="w-12 h-12 rounded-full bg-card-secondary justify-center items-center">
              <Feather name="coffee" size={20} color="#8E8E93" />
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-center">No meals logged today</Text>
              <Text className="text-text-secondary text-xs text-center mt-1">
                Scan a photo or add food manually to fill your log.
              </Text>
            </View>
            <Pressable 
              onPress={() => router.push('/(tabs)/camera')}
              className="bg-accent-green/10 border border-accent-green/20 px-5 py-2.5 rounded-xl"
            >
              <Text className="text-accent-green font-bold text-xs">Scan Food Photo</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3">
            {recentMealsToShow.map((meal) => (
              <View 
                key={meal.id} 
                className="bg-card-primary border border-card-secondary rounded-2xl p-4 flex-row justify-between items-center shadow"
              >
                <View className="flex-1 pr-4">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {meal.food_name}
                  </Text>
                  <Text className="text-text-secondary text-xs mt-1">
                    P: {meal.protein}g  •  C: {meal.carbs}g  •  F: {meal.fat}g
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-accent-green font-extrabold text-sm font-rounded">
                    +{meal.calories}
                  </Text>
                  <Text className="text-text-muted text-[10px] mt-0.5">
                    kcal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
