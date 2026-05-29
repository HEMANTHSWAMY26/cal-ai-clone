import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { analyzeFoodImage } from '@/services/gemini';
import { View, Text, Pressable, Image } from '@/tw';

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const setActiveAnalysis = useAppStore((state) => state.setActiveAnalysis);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  const cameraRef = useRef<any>(null);

  const handleRequestPermissions = async () => {
    await requestCameraPermission();
    await requestGalleryPermission();
  };

  const processImageForAI = async (base64Data: string, uri: string) => {
    setIsAnalyzing(true);
    setLoadingStep('Uploading to analyzer...');
    
    try {
      setLoadingStep('Scanning with Gemini AI...');
      const result = await analyzeFoodImage(base64Data, 'image/jpeg');
      
      setLoadingStep('Done!');
      // Store result and image URI
      setActiveAnalysis({
        imageUri: uri,
        result,
      });

      setIsAnalyzing(false);
      // Route to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error("AI scan failed:", error);
      setIsAnalyzing(false);
      alert("AI analysis failed. Please try again with another photo.");
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        setLoadingStep('Capturing photo...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
          skipProcessing: false,
        });

        if (photo && photo.base64) {
          await processImageForAI(photo.base64, photo.uri);
        }
      } catch (err) {
        console.error("Capture photo error:", err);
      }
    }
  };

  const handlePickImage = async () => {
    try {
      // Request gallery permission if not granted
      if (!galleryPermission?.granted) {
        const res = await requestGalleryPermission();
        if (!res.granted) {
          alert("Media library permission is required to upload images.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const asset = result.assets[0];
        await processImageForAI(asset.base64, asset.uri);
      }
    } catch (err) {
      console.error("Gallery pick error:", err);
    }
  };

  if (!cameraPermission) {
    // Camera permissions are still loading
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#30D158" />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet
    return (
      <View className="flex-1 bg-black justify-center items-center p-6 gap-4">
        <View className="w-16 h-16 rounded-full bg-card-primary border border-accent-green/30 justify-center items-center">
          <Feather name="camera-off" size={28} color="#30D158" />
        </View>
        <Text className="text-white text-xl font-bold font-rounded text-center">
          Camera Access Required
        </Text>
        <Text className="text-text-secondary text-sm text-center leading-relaxed max-w-xs">
          To automatically track your calories by snapping a picture, CAL.AI needs camera and library permissions.
        </Text>
        <Pressable 
          onPress={handleRequestPermissions}
          className="bg-accent-green px-8 py-3.5 rounded-2xl mt-4 shadow-lg shadow-accent-green/10"
        >
          <Text className="text-black font-extrabold text-sm uppercase tracking-wider">
            Grant Access
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Camera View Finder */}
      <CameraView
        ref={cameraRef}
        facing={facing}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Camera HUD Overlays */}
      <View className="flex-1 justify-between p-6">
        {/* Top bar controls */}
        <View className="flex-row justify-between items-center mt-12">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/60 border border-white/10 justify-center items-center"
          >
            <Feather name="x" size={18} color="white" />
          </Pressable>

          <Text className="text-white font-extrabold text-sm uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/5 font-rounded">
            Scan Meal
          </Text>

          <Pressable 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            className="w-10 h-10 rounded-full bg-black/60 border border-white/10 justify-center items-center"
          >
            <Feather name="rotate-cw" size={18} color="white" />
          </Pressable>
        </View>

        {/* Framing box indicator in the center */}
        <View className="items-center justify-center">
          <View className="w-64 h-64 border border-white/20 rounded-3xl relative justify-center items-center">
            {/* Corner styling for the lens container */}
            <View className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent-green rounded-tl-xl" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-green rounded-tr-xl" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent-green rounded-bl-xl" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent-green rounded-br-xl" />
            <Text className="text-white/40 text-xs font-medium uppercase tracking-wider font-rounded">
              Center Food Here
            </Text>
          </View>
        </View>

        {/* Bottom Shutter Controls */}
        <View className="flex-row justify-around items-center mb-10">
          {/* Gallery Button */}
          <Pressable 
            onPress={handlePickImage}
            className="w-12 h-12 rounded-full bg-black/60 border border-white/10 justify-center items-center"
          >
            <Feather name="image" size={20} color="white" />
          </Pressable>

          {/* Main Shutter Button */}
          <View className="w-20 h-20 rounded-full border-4 border-white justify-center items-center">
            <Pressable 
              onPress={handleCapture}
              className="w-16 h-16 rounded-full bg-white active:scale-95 transition-transform"
            />
          </View>

          {/* Quick Manual Entry (Alternative option) */}
          <Pressable 
            onPress={() => {
              setActiveAnalysis({
                imageUri: '',
                result: null
              });
              router.push('/analysis');
            }}
            className="w-12 h-12 rounded-full bg-black/60 border border-white/10 justify-center items-center"
          >
            <Feather name="edit-3" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* AI Analysis Overlay Loader */}
      {isAnalyzing && (
        <View className="absolute inset-0 bg-black/80 justify-center items-center p-6 z-50">
          <View className="w-56 h-56 bg-card-primary border border-card-secondary rounded-3xl p-6 justify-center items-center shadow-2xl relative overflow-hidden">
            <View className="absolute w-full h-1 bg-accent-green animate-pulse top-0 left-0 shadow-[0_0_15px_#30D158]" />
            <ActivityIndicator size="large" color="#30D158" className="mb-4" />
            <Text className="text-white font-extrabold text-base font-rounded text-center">
              Analyzing Food
            </Text>
            <Text className="text-text-secondary text-xs mt-2 text-center">
              {loadingStep}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
