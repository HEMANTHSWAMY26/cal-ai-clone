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
    <View className="flex-1 bg-black justify-center items-center">
      {/* Background radial-like glow effect */}
      <View className="absolute w-[300px] h-[300px] bg-accent-green/10 rounded-full blur-[80px]" />

      <View className="items-center justify-center relative">
        {/* Pulsing Scan Ring */}
        <TWAnimated.View 
          style={[styles.pulseRing, animatedPulseStyle]}
          className="absolute border border-accent-green rounded-full"
        />
        
        {/* Main Glowing Circle */}
        <TWAnimated.View 
          style={[styles.logoCircle, animatedLogoStyle]}
          className="bg-card-primary border border-accent-green/30 justify-center items-center shadow-lg"
        >
          {/* Inner Scan Line/Eye */}
          <View className="w-10 h-10 rounded-full border-4 border-accent-green shadow-[0_0_15px_rgba(48,209,89,0.8)] justify-center items-center">
            <View className="w-3 h-3 bg-accent-green rounded-full" />
          </View>
        </TWAnimated.View>
      </View>

      {/* Brand Label */}
      <TWAnimated.View style={[animatedTextStyle]} className="mt-8 items-center">
        <Text className="text-white text-3xl font-extrabold tracking-[6px] font-rounded">
          CAL<Text className="text-accent-green">.AI</Text>
        </Text>
        <Text className="text-text-secondary text-xs mt-2 uppercase tracking-[3px]">
          Smart Food Tracking
        </Text>
      </TWAnimated.View>

      {/* Footer disclaimer */}
      <View className="absolute bottom-12 items-center">
        <Text className="text-text-muted text-[10px] uppercase tracking-wider">
          Powered by Gemini 2.5
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
