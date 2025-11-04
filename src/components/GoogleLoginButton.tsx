import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import Svg, { Path } from "react-native-svg";

interface GoogleLoginButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  onSuccess?: () => void;
}

// Google Icon Component
const GoogleIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" className="mr-2">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  text = "continue_with",
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Open Google OAuth URL
      const authUrl = "http://localhost:3000/api/auth/google";
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        await Linking.openURL(authUrl);
        // Note: In a real app, you would need to implement deep linking
        // to handle the OAuth callback
      }
      
      // Mock success for demo - replace with actual OAuth flow
      setTimeout(() => {
        onSuccess?.();
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Google auth failed:", error);
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (text) {
      case "signin_with":
        return "Sign in with Google";
      case "signup_with":
        return "Sign up with Google";
      case "continue_with":
        return "Continue with Google";
      default:
        return "Google";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-row justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg bg-gray-50">
        <ActivityIndicator size="small" color="#6B7280" />
        <Text className="ml-2 text-sm text-gray-600">Signing In...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleGoogleLogin}
      className="flex-row justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg bg-white"
      activeOpacity={0.7}
    >
      <GoogleIcon />
      <Text className="text-sm font-medium text-gray-700">{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;
