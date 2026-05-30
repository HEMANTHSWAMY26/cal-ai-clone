import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { View, Text, Pressable, TextInput } from '@/tw';

export default function AuthScreen() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const signUp = useAppStore((state) => state.signUp);
  const isLoading = useAppStore((state) => state.isLoading);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!email) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (isSignUp && !name) {
      setErrorMessage('Please enter your name.');
      return;
    }

    let res;
    if (isSignUp) {
      res = await signUp(email, name);
    } else {
      res = await login(email);
    }

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "We have sent password recovery instructions to: " + (email || "your email"),
      [{ text: "OK" }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#050505]"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        className="p-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorative Blur */}
        <View className="absolute w-[280px] h-[280px] bg-[#22C55E]/5 rounded-full blur-[90px] top-1/4 left-1/4" />

        <View className="items-center mb-8">
          <View className="w-14 h-14 rounded-2xl bg-[#111111] border border-[#1E1E1E] justify-center items-center mb-4">
            <Feather name="shield" size={24} color="#22C55E" />
          </View>
          <Text className="text-white text-3xl font-black font-rounded tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text className="text-[#A1A1AA] text-xs mt-2 text-center max-w-[260px] leading-relaxed">
            {isSignUp 
              ? "Join CAL.AI and start tracking your meals with Gemini 2.5." 
              : "Sign in with your email to view your analytics metrics."}
          </Text>
        </View>

        {/* Auth Box */}
        <View className="bg-[#111111] border border-[#1E1E1E] rounded-3xl p-5 shadow-2xl gap-4">
          {errorMessage && (
            <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex-row items-center gap-2">
              <Feather name="alert-circle" size={14} color="#FF453A" />
              <Text className="text-red-500 text-xs font-semibold flex-1">{errorMessage}</Text>
            </View>
          )}

          {isSignUp && (
            <View className="gap-1.5">
              <Text className="text-[#A1A1AA] text-[10px] uppercase font-black tracking-wider">Name</Text>
              <View className="flex-row items-center bg-black border border-[#1E1E1E] rounded-xl px-3 py-3 gap-2">
                <Feather name="user" size={14} color="#71717A" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="#71717A"
                  className="text-white text-sm flex-1"
                />
              </View>
            </View>
          )}

          <View className="gap-1.5">
            <Text className="text-[#A1A1AA] text-[10px] uppercase font-black tracking-wider">Email Address</Text>
            <View className="flex-row items-center bg-black border border-[#1E1E1E] rounded-xl px-3 py-3 gap-2">
              <Feather name="mail" size={14} color="#71717A" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor="#71717A"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-white text-sm flex-1"
              />
            </View>
          </View>

          <View className="gap-1.5">
            <View className="flex-row justify-between items-center">
              <Text className="text-[#A1A1AA] text-[10px] uppercase font-black tracking-wider">Password</Text>
              {!isSignUp && (
                <Pressable onPress={handleForgotPassword}>
                  <Text className="text-[#22C55E] text-xs font-bold font-rounded">Forgot?</Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row items-center bg-black border border-[#1E1E1E] rounded-xl px-3 py-3 gap-2">
              <Feather name="lock" size={14} color="#71717A" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#71717A"
                secureTextEntry
                className="text-white text-sm flex-1"
              />
            </View>
          </View>

          {/* Submit Button */}
          <Pressable 
            onPress={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#22C55E] py-4 rounded-xl items-center justify-center mt-2 shadow-lg shadow-[#22C55E]/10"
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black font-black text-sm font-rounded">
                {isSignUp ? "Get Started" : "Sign In"}
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-[1px] bg-[#1E1E1E]" />
            <Text className="text-[#71717A] text-[9px] uppercase font-bold tracking-widest">or</Text>
            <View className="flex-1 h-[1px] bg-[#1E1E1E]" />
          </View>

          {/* Social login placeholders */}
          <View className="gap-2.5">
            <Pressable 
              onPress={() => {}}
              className="w-full bg-black border border-[#1E1E1E] py-3.5 rounded-xl flex-row justify-center items-center gap-2"
            >
              <Feather name="chrome" size={14} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs font-rounded">Continue with Google</Text>
            </Pressable>
            
            <Pressable 
              onPress={() => {}}
              className="w-full bg-black border border-[#1E1E1E] py-3.5 rounded-xl flex-row justify-center items-center gap-2"
            >
              <Feather name="github" size={14} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs font-rounded">Continue with GitHub</Text>
            </Pressable>
          </View>
        </View>

        {/* Toggle Mode */}
        <View className="flex-row justify-center items-center mt-8 gap-2">
          <Text className="text-[#A1A1AA] text-xs">
            {isSignUp ? "Already have an account?" : "New to CAL.AI?"}
          </Text>
          <Pressable onPress={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage(null);
          }}>
            <Text className="text-[#22C55E] font-black text-xs font-rounded">
              {isSignUp ? "Sign In" : "Register"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
