import React, { useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [password, setPassword] = useState(''); // We use simple auth for the coding challenge
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
      // Redirect to Dashboard on success
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "We have sent password recovery instructions (or mock link) to: " + (email || "your email"),
      [{ text: "OK" }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        className="p-6"
      >
        {/* Background Decorative Blur */}
        <View className="absolute w-[250px] h-[250px] bg-accent-green/5 rounded-full blur-[70px] top-1/4 left-1/4" />

        <View className="items-center mb-8">
          <View className="w-14 h-14 rounded-2xl bg-card-primary border border-accent-green/30 justify-center items-center mb-4">
            <Feather name="shield" size={28} color="#30D158" />
          </View>
          <Text className="text-white text-3xl font-extrabold font-rounded tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>
          <Text className="text-text-secondary text-sm mt-2 text-center">
            {isSignUp 
              ? "Join CAL.AI and start analyzing your meals." 
              : "Sign in with your email to view your dashboard."}
          </Text>
        </View>

        {/* Auth Box */}
        <View className="bg-card-primary border border-card-secondary rounded-3xl p-5 shadow-2xl gap-4">
          {errorMessage && (
            <View className="bg-danger/10 border border-danger/20 p-3 rounded-xl flex-row items-center gap-2">
              <Feather name="alert-circle" size={16} color="#FF453A" />
              <Text className="text-danger text-xs font-medium flex-1">{errorMessage}</Text>
            </View>
          )}

          {isSignUp && (
            <View className="gap-2">
              <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">Name</Text>
              <View className="flex-row items-center bg-black border border-card-secondary focus:border-accent-green rounded-xl px-3 py-3 gap-2">
                <Feather name="user" size={16} color="#8E8E93" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="#48484A"
                  className="text-white text-sm flex-1"
                />
              </View>
            </View>
          )}

          <View className="gap-2">
            <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">Email Address</Text>
            <View className="flex-row items-center bg-black border border-card-secondary focus:border-accent-green rounded-xl px-3 py-3 gap-2">
              <Feather name="mail" size={16} color="#8E8E93" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor="#48484A"
                keyboardType="email-address"
                autoCapitalize="none"
                className="text-white text-sm flex-1"
              />
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">Password</Text>
              {!isSignUp && (
                <Pressable onPress={handleForgotPassword}>
                  <Text className="text-accent-green text-xs font-semibold">Forgot?</Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row items-center bg-black border border-card-secondary focus:border-accent-green rounded-xl px-3 py-3 gap-2">
              <Feather name="lock" size={16} color="#8E8E93" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#48484A"
                secureTextEntry
                className="text-white text-sm flex-1"
              />
            </View>
          </View>

          {/* Submit Button */}
          <Pressable 
            onPress={handleSubmit}
            disabled={isLoading}
            className="w-full bg-accent-green py-4 rounded-xl items-center justify-center mt-2 shadow-lg shadow-accent-green/10"
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black font-extrabold text-base font-rounded">
                {isSignUp ? "Get Started" : "Sign In"}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Toggle Mode */}
        <View className="flex-row justify-center items-center mt-8 gap-2">
          <Text className="text-text-secondary text-sm">
            {isSignUp ? "Already have an account?" : "New to CAL.AI?"}
          </Text>
          <Pressable onPress={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage(null);
          }}>
            <Text className="text-accent-green font-bold text-sm">
              {isSignUp ? "Sign In" : "Register"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
