import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { View, Text } from '@/tw';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  value: string;
}

export default function ProgressRing({
  progress,
  size,
  strokeWidth,
  color,
  label,
  value,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Cap progress between 0 and 1
  const cleanProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - cleanProgress * circumference;

  return (
    <View className="items-center justify-center">
      <View style={{ width: size, height: size }} className="items-center justify-center relative">
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1C1C1E"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        {/* Inner Label */}
        <View className="absolute items-center justify-center">
          <Text className="text-white text-sm font-extrabold font-rounded">
            {Math.round(cleanProgress * 100)}%
          </Text>
        </View>
      </View>
      <Text className="text-white text-[11px] font-bold font-rounded mt-2 uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-text-secondary text-[10px] mt-0.5">
        {value}
      </Text>
    </View>
  );
}
