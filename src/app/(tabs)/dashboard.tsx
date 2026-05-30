import React from 'react';
import { ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable } from '@/tw';
import ProgressRing from '@/components/ProgressRing';

const { width } = Dimensions.get('window');

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
      className="flex-1 bg-[#050505]"
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header section */}
      <View className="px-6 pt-16 pb-6 flex-row justify-between items-center border-b border-[#1E1E1E]">
        <View>
          <Text className="text-text-secondary text-[10px] uppercase font-black tracking-[2px] font-rounded">
            Dashboard
          </Text>
          <Text className="text-white text-2xl font-black mt-1 font-rounded">
            Hey, {user?.name || 'User'} 👋
          </Text>
        </View>
        <Pressable 
          onPress={() => router.push('/(tabs)/profile')}
          className="w-10 h-10 rounded-full bg-[#111111] border border-[#1E1E1E] justify-center items-center"
        >
          <Feather name="settings" size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Main Calorie Ring Card */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <View className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-3xl" />
        
        <View className="flex-row justify-between items-center">
          {/* Calorie Stats */}
          <View className="flex-1 gap-4">
            <View>
              <Text className="text-text-secondary text-[10px] uppercase font-black tracking-wider">Remaining</Text>
              <Text className="text-white text-3xl font-black font-rounded mt-1.5">
                {remainingCalories} <Text className="text-text-secondary text-xs font-normal">kcal</Text>
              </Text>
            </View>

            <View className="flex-row gap-6 mt-1">
              <View>
                <Text className="text-[#A1A1AA] text-[9px] uppercase font-bold tracking-wider">Goal</Text>
                <Text className="text-white text-sm font-black mt-0.5 font-rounded">
                  {goals.calorie_goal} <Text className="text-text-muted text-[9px] font-normal">kcal</Text>
                </Text>
              </View>
              <View>
                <Text className="text-[#A1A1AA] text-[9px] uppercase font-bold tracking-wider">Logged</Text>
                <Text className="text-[#22C55E] text-sm font-black mt-0.5 font-rounded">
                  {consumedCalories} <Text className="text-[#22C55E]/60 text-[9px] font-normal">kcal</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Calorie Circular Progress */}
          <View className="items-center justify-center">
            <ProgressRing
              progress={calorieProgress}
              size={90}
              strokeWidth={7}
              color="#22C55E"
              label="Intake"
              value={`${consumedCalories} kcal`}
            />
          </View>
        </View>
      </View>

      {/* Macronutrient Breakdowns */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-6 shadow-xl">
        <Text className="text-white text-xs font-black font-rounded uppercase tracking-wider mb-5">
          Daily Macronutrients
        </Text>
        
        <View className="flex-row justify-around items-center">
          <ProgressRing
            progress={proteinProgress}
            size={70}
            strokeWidth={5}
            color="#22C55E"
            label="Protein"
            value={`${consumedProtein}g/${goals.protein_goal}g`}
          />
          <ProgressRing
            progress={carbsProgress}
            size={70}
            strokeWidth={5}
            color="#3B82F6"
            label="Carbs"
            value={`${consumedCarbs}g/${goals.carb_goal}g`}
          />
          <ProgressRing
            progress={fatProgress}
            size={70}
            strokeWidth={5}
            color="#FF453A"
            label="Fat"
            value={`${consumedFat}g/${goals.fat_goal}g`}
          />
        </View>
      </View>

      {/* Streak Panel */}
      <Pressable 
        onPress={() => router.push('/streak')}
        className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-5 shadow-xl flex-row items-center gap-4 active:opacity-90"
      >
        <View className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl justify-center items-center">
          <Feather name="zap" size={22} color="#FF9F0A" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-base font-black font-rounded">
            {streak.current_streak} Day Streak
          </Text>
          <Text className="text-text-secondary text-[11px] mt-0.5">
            {streak.current_streak > 0 
              ? "Keep logging daily to lock in your habits!"
              : "Log a meal today to begin your streak tracking."}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color="#71717A" />
      </Pressable>

      {/* AI Insights Card */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-5 flex-row items-start gap-4">
        <View className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl">
          <Feather name="activity" size={18} color="#22C55E" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-extrabold text-sm font-rounded">AI Health Coach</Text>
          <Text className="text-text-secondary text-[11px] leading-relaxed mt-1">
            {consumedCalories > 0 
              ? "Your protein-to-calorie ratio is optimal today. Consistent protein logs aid muscle protein synthesis and boost metabolism."
              : "Welcome back! Scan your first meal of the day to get instant macro calculations and health insights."}
          </Text>
        </View>
      </View>

      {/* Today's Logged Meals */}
      <View className="mx-6 mt-6">
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-white text-xs font-black font-rounded uppercase tracking-wider">
            Today's Logs
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/diary')}>
            <Text className="text-[#22C55E] text-xs font-bold font-rounded">View Diary</Text>
          </Pressable>
        </View>

        {todayMeals.length === 0 ? (
          <View className="bg-[#111111] border border-[#1E1E1E] border-dashed rounded-3xl p-8 items-center justify-center gap-4">
            <View className="w-12 h-12 rounded-full bg-[#181818] justify-center items-center">
              <Feather name="coffee" size={18} color="#A1A1AA" />
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-center">No meals logged today</Text>
              <Text className="text-text-secondary text-xs text-center mt-1">
                Scan a photo or add food manually to fill your log.
              </Text>
            </View>
            <Pressable 
              onPress={() => router.push('/(tabs)/camera')}
              className="bg-[#22C55E]/10 border border-[#22C55E]/20 px-5 py-2.5 rounded-xl"
            >
              <Text className="text-[#22C55E] font-bold text-xs">Scan Food Photo</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3">
            {recentMealsToShow.map((meal) => (
              <View 
                key={meal.id} 
                className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-4 flex-row justify-between items-center shadow"
              >
                <View className="flex-1 pr-4">
                  <Text className="text-white font-extrabold text-sm" numberOfLines={1}>
                    {meal.food_name}
                  </Text>
                  <Text className="text-text-secondary text-[11px] mt-1">
                    P: {meal.protein}g  •  C: {meal.carbs}g  •  F: {meal.fat}g
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#22C55E] font-black text-sm font-rounded">
                    +{meal.calories}
                  </Text>
                  <Text className="text-text-muted text-[9px] uppercase mt-0.5">
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
