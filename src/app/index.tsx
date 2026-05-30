import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence, 
  withRepeat,
  Easing
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import { View, Text } from '@/tw';
import { Animated as TWAnimated } from '@/tw/animated';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  
  // Shared values for animations
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Run entry animations
    logoScale.value = withTiming(1.0, {
      duration: 1000,
      easing: Easing.out(Easing.back(1.5)),
    });
    
    logoOpacity.value = withTiming(1, { duration: 1000 });
    
    textOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 800 })
    );

    // 2. Continuous scanner-like pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true
    );

    // 3. Routing logic
    const performRouting = async () => {
      // Wait for animations to be visible
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        if (onboardingCompleted === 'true') {
          router.replace('/auth');
        } else {
          router.replace('/onboarding');
        }
      }
    };

    performRouting();
  }, [user]);

  // Animated styles
  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: logoOpacity.value * 0.15,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View className="flex-1 bg-[#050505] justify-center items-center">
      {/* Background radial-like glow effect */}
      <View className="absolute w-[350px] h-[350px] bg-[#22C55E]/5 rounded-full blur-[100px]" />

      <View className="items-center justify-center relative">
        {/* Pulsing Scan Ring */}
        <TWAnimated.View 
          style={[styles.pulseRing, animatedPulseStyle]}
          className="absolute border border-[#22C55E]/40 rounded-full"
        />
        
        {/* Main Glowing Circle */}
        <TWAnimated.View 
          style={[styles.logoCircle, animatedLogoStyle]}
          className="bg-[#111111] border border-[#1E1E1E] justify-center items-center shadow-2xl"
        >
          {/* Inner Scan Line/Eye */}
          <View className="w-12 h-12 rounded-full border-4 border-[#22C55E] justify-center items-center shadow-lg shadow-[#22C55E]/30">
            <View className="w-4 h-4 bg-[#22C55E] rounded-full" />
          </View>
        </TWAnimated.View>
      </View>

      {/* Brand Label */}
      <TWAnimated.View style={[animatedTextStyle]} className="mt-10 items-center">
        <Text className="text-white text-4xl font-black tracking-[8px] font-rounded">
          CAL<Text className="text-[#22C55E]">.AI</Text>
        </Text>
        <Text className="text-[#A1A1AA] text-[10px] mt-3 uppercase tracking-[4px] font-bold">
          Smart Food Intelligence
        </Text>
      </TWAnimated.View>

      {/* Footer disclaimer */}
      <View className="absolute bottom-16 items-center">
        <Text className="text-[#71717A] text-[9px] uppercase tracking-[2px] font-bold">
          Powered by Gemini 2.5 Flash
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  pulseRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
  }
});
