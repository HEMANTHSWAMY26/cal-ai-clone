import React from 'react';
import { ScrollView } from 'react-native';
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
      className="flex-1 bg-[#050505]"
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View className="px-6 pt-16 pb-6 flex-row justify-between items-center border-b border-[#1E1E1E]">
        <Pressable 
          onPress={() => router.back()}
          className="flex-row items-center gap-1 p-2.5 rounded-full bg-[#111111] border border-[#1E1E1E]"
        >
          <Feather name="chevron-left" size={16} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-black font-rounded">Streaks</Text>
        <View className="w-10 h-10" /> 
      </View>

      {/* Giant Flame Card */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-[32px] p-8 items-center shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/5 rounded-full blur-[70px]" />

        <View className="w-32 h-32 bg-orange-500/10 border border-orange-500/20 rounded-full justify-center items-center mb-6 relative">
          <Feather name="zap" size={60} color="#FF9F0A" />
          <View className="absolute w-[140%] h-[140%] border border-orange-500/5 border-dashed rounded-full" />
        </View>

        <Text className="text-white text-5xl font-black font-rounded tracking-tight">
          {streak.current_streak}
        </Text>
        <Text className="text-[#FF9F0A] text-xs font-black font-rounded mt-2 uppercase tracking-widest">
          Day Streak
        </Text>
        
        <Text className="text-[#A1A1AA] text-xs text-center mt-5 leading-relaxed max-w-xs font-medium">
          Log breakfast, lunch, or dinner daily to maintain your momentum and build positive nutritional habits!
        </Text>
      </View>

      {/* Streak Level Badge */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 flex-row items-center gap-4 shadow">
        <View className="w-12 h-12 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl justify-center items-center">
          <Feather name={badge.icon as any} size={22} color="#22C55E" />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary text-[9px] uppercase font-black tracking-wider">Current Achievement</Text>
          <Text className="text-white text-base font-black font-rounded mt-0.5">
            {badge.title}
          </Text>
        </View>
      </View>

      {/* Calendar Grid View (Past 7 Days Compliance) */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-6 shadow-lg">
        <Text className="text-white text-xs font-black font-rounded uppercase tracking-wider mb-5">
          Activity Tracker
        </Text>
        
        <View className="flex-row justify-between">
          {complianceDays.map((day, idx) => (
            <View key={idx} className="items-center gap-2">
              <Text className="text-text-secondary text-[9px] font-black uppercase tracking-wider font-rounded">
                {day.label}
              </Text>
              
              <View 
                className={`w-10 h-10 rounded-full justify-center items-center border ${
                  day.logged
                    ? 'bg-[#22C55E]/10 border-[#22C55E]'
                    : day.isToday
                      ? 'border-white/40 border-dashed bg-black/40'
                      : 'border-[#1E1E1E] bg-[#050505]'
                }`}
              >
                {day.logged ? (
                  <Feather name="check" size={14} color="#22C55E" />
                ) : (
                  <Text className={`text-xs font-black font-rounded ${day.isToday ? 'text-white' : 'text-[#71717A]'}`}>
                    {day.date}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Goal Completion Stats */}
      <View className="mx-6 mt-6 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-6 shadow-lg gap-4">
        <Text className="text-white text-xs font-black font-rounded uppercase tracking-wider">
          Streak Metrics
        </Text>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-[#A1A1AA] text-sm font-semibold">Longest Streak</Text>
          <Text className="text-white font-black text-sm font-rounded">
            {streak.longest_streak} days
          </Text>
        </View>

        <View className="h-[1px] bg-[#1E1E1E]" />

        <View className="flex-row justify-between items-center">
          <Text className="text-[#A1A1AA] text-sm font-semibold">Total Meals Logged</Text>
          <Text className="text-[#22C55E] font-black text-sm font-rounded">
            {meals.length} meals
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
