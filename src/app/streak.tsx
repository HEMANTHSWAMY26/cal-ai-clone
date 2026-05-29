import React from 'react';
import { ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable } from '@/tw';

export default function StreakScreen() {
  const router = useRouter();
  const streak = useAppStore((state) => state.streak);
  const meals = useAppStore((state) => state.meals);

  // Generate status for the last 7 calendar days
  const getWeeklyCompliance = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const hasLogged = meals.some(m => m.created_at.split('T')[0] === dateStr);
      
      return {
        label: days[d.getDay()],
        date: d.getDate(),
        logged: hasLogged,
        isToday: dateStr === today.toISOString().split('T')[0]
      };
    });
  };

  const complianceDays = getWeeklyCompliance();

  // Streak badge determination based on streak length
  const getStreakLevel = (count: number) => {
    if (count >= 30) return { title: 'Nutrition Overlord', icon: 'award' };
    if (count >= 15) return { title: 'Consistent Champion', icon: 'zap' };
    if (count >= 7) return { title: 'Healthy Habit Master', icon: 'activity' };
    if (count >= 3) return { title: 'Consistent Eater', icon: 'smile' };
    return { title: 'Streak Rookie', icon: 'shield' };
  };

  const badge = getStreakLevel(streak.current_streak);

  return (
    <ScrollView 
      className="flex-1 bg-black"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View className="px-6 pt-16 pb-4 flex-row justify-between items-center border-b border-card-secondary/20">
        <Pressable 
          onPress={() => router.back()}
          className="flex-row items-center gap-1 p-2 rounded-full bg-card-primary"
        >
          <Feather name="chevron-left" size={20} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-bold font-rounded">Streaks</Text>
        <View className="w-10 h-10" /> {/* Spacer */}
      </View>

      {/* Giant Flame Card */}
      <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-[32px] p-8 items-center shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-orange/15 rounded-full blur-[60px]" />

        <View className="w-32 h-32 bg-accent-orange/10 border border-accent-orange/30 rounded-full justify-center items-center mb-6 relative">
          <Feather name="zap" size={68} color="#FF9F0A" />
          {/* Flame animation circle */}
          <View className="absolute w-[140%] h-[140%] border border-accent-orange/10 border-dashed rounded-full" />
        </View>

        <Text className="text-white text-5xl font-black font-rounded tracking-tight">
          {streak.current_streak}
        </Text>
        <Text className="text-accent-orange text-sm font-extrabold font-rounded mt-1 uppercase tracking-widest">
          Day Streak
        </Text>
        
        <Text className="text-text-secondary text-xs text-center mt-4 leading-relaxed max-w-xs">
          Log your breakfast, lunch, or dinner daily to maintain your momentum and build positive nutritional habits!
        </Text>
      </View>

      {/* Streak Level Badge */}
      <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-2xl p-5 flex-row items-center gap-4 shadow">
        <View className="w-12 h-12 bg-accent-green/10 border border-accent-green/20 rounded-2xl justify-center items-center">
          <Feather name={badge.icon as any} size={24} color="#30D158" />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary text-[10px] uppercase font-bold tracking-wider">Current Badge</Text>
          <Text className="text-white text-base font-extrabold font-rounded mt-0.5">
            {badge.title}
          </Text>
        </View>
      </View>

      {/* Calendar Grid View (Past 7 Days Compliance) */}
      <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-3xl p-6 shadow-lg">
        <Text className="text-white text-sm font-extrabold font-rounded uppercase tracking-wider mb-5">
          Activity Tracker
        </Text>
        
        <View className="flex-row justify-between">
          {complianceDays.map((day, idx) => (
            <View key={idx} className="items-center gap-2">
              <Text className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-rounded">
                {day.label}
              </Text>
              
              <View 
                className={`w-10 h-10 rounded-full justify-center items-center border ${
                  day.logged
                    ? 'bg-accent-green/20 border-accent-green'
                    : day.isToday
                      ? 'border-white/40 border-dashed'
                      : 'border-card-secondary bg-black'
                }`}
              >
                {day.logged ? (
                  <Feather name="check" size={16} color="#30D158" />
                ) : (
                  <Text className={`text-xs font-bold font-rounded ${day.isToday ? 'text-white' : 'text-text-muted'}`}>
                    {day.date}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Goal Completion Stats */}
      <View className="mx-6 mt-6 bg-card-primary border border-card-secondary rounded-3xl p-6 shadow-lg gap-4">
        <Text className="text-white text-sm font-extrabold font-rounded uppercase tracking-wider">
          Streak Metrics
        </Text>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-text-secondary text-sm">Longest Streak</Text>
          <Text className="text-white font-extrabold text-sm font-rounded">
            {streak.longest_streak} days
          </Text>
        </View>

        <View className="h-[1px] bg-card-secondary/20" />

        <View className="flex-row justify-between items-center">
          <Text className="text-text-secondary text-sm">Total Meals Logged</Text>
          <Text className="text-accent-green font-extrabold text-sm font-rounded">
            {meals.length} meals
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
