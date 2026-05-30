import React, { useState, useRef } from 'react';
import { StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { analyzeFoodImage } from '@/services/gemini';
import { View, Text, Pressable } from '@/tw';

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
    setLoadingStep('Uploading image data...');
    
    try {
      setLoadingStep('Running Gemini AI scanner...');
      const result = await analyzeFoodImage(base64Data, 'image/jpeg');
      
      setLoadingStep('Finalizing macros...');
      setActiveAnalysis({
        imageUri: uri,
        result,
      });

      setIsAnalyzing(false);
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
        setLoadingStep('Capturing frame...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.75,
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
        quality: 0.75,
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
    return (
      <View className="flex-1 bg-[#050505] justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View className="flex-1 bg-[#050505] justify-center items-center p-6 gap-5">
        <View className="w-16 h-16 rounded-3xl bg-[#111111] border border-[#1E1E1E] justify-center items-center shadow-lg">
          <Feather name="camera-off" size={24} color="#FF453A" />
        </View>
        <Text className="text-white text-xl font-black font-rounded text-center">
          Camera Access Required
        </Text>
        <Text className="text-[#A1A1AA] text-xs text-center leading-relaxed max-w-[280px]">
          To automatically parse calorie details by snapping a picture, CAL.AI needs camera and library permissions.
        </Text>
        <Pressable 
          onPress={handleRequestPermissions}
          className="bg-[#22C55E] px-8 py-3.5 rounded-2xl mt-4 shadow-lg shadow-[#22C55E]/10"
        >
          <Text className="text-black font-black text-xs uppercase tracking-wider font-rounded">
            Grant Access
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050505]">
      {/* Camera View Finder */}
      <CameraView
        ref={cameraRef}
        facing={facing}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Camera HUD Overlays */}
      <View className="flex-grow justify-between p-6 z-10">
        {/* Top bar controls */}
        <View className="flex-row justify-between items-center mt-12">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/70 border border-white/10 justify-center items-center"
          >
            <Feather name="x" size={16} color="white" />
          </Pressable>

          <Text className="text-white font-black text-xs uppercase tracking-[2px] bg-black/70 px-4 py-2 rounded-full border border-white/5 font-rounded">
            Scan Meal
          </Text>

          <Pressable 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            className="w-10 h-10 rounded-full bg-black/70 border border-white/10 justify-center items-center"
          >
            <Feather name="rotate-cw" size={16} color="white" />
          </Pressable>
        </View>

        {/* Framing box indicator in the center */}
        <View className="items-center justify-center my-auto">
          <View className="w-60 h-60 border border-white/10 rounded-3xl relative justify-center items-center bg-black/10">
            {/* Corner styling for the lens container */}
            <View className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#22C55E] rounded-tl-xl" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#22C55E] rounded-tr-xl" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#22C55E] rounded-bl-xl" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#22C55E] rounded-br-xl" />
            <Text className="text-white/30 text-[10px] font-black uppercase tracking-wider font-rounded">
              Center Food Here
            </Text>
          </View>
        </View>

        {/* Bottom Shutter Controls */}
        <View className="flex-row justify-around items-center mb-10">
          {/* Gallery Button */}
          <Pressable 
            onPress={handlePickImage}
            className="w-12 h-12 rounded-full bg-black/70 border border-white/10 justify-center items-center"
          >
            <Feather name="image" size={18} color="white" />
          </Pressable>

          {/* Main Shutter Button */}
          <View className="w-20 h-20 rounded-full border-4 border-white justify-center items-center">
            <Pressable 
              onPress={handleCapture}
              className="w-16 h-16 rounded-full bg-white active:scale-95 transition-transform"
            />
          </View>

          {/* Quick Manual Entry */}
          <Pressable 
            onPress={() => {
              setActiveAnalysis({
                imageUri: '',
                result: null
              });
              router.push('/analysis');
            }}
            className="w-12 h-12 rounded-full bg-black/70 border border-white/10 justify-center items-center"
          >
            <Feather name="edit-3" size={18} color="white" />
          </Pressable>
        </View>
      </View>

      {/* AI Analysis Overlay Loader */}
      {isAnalyzing && (
        <View className="absolute inset-0 bg-black/85 justify-center items-center p-6 z-50">
          <View className="w-56 h-56 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-6 justify-center items-center shadow-2xl relative overflow-hidden">
            <View className="absolute w-full h-0.5 bg-[#22C55E] top-0 left-0 shadow-lg shadow-[#22C55E]" />
            <ActivityIndicator size="large" color="#22C55E" className="mb-4" />
            <Text className="text-white font-black text-sm font-rounded text-center uppercase tracking-wider">
              Analyzing Food
            </Text>
            <Text className="text-[#A1A1AA] text-[10px] mt-2 text-center">
              {loadingStep}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
