import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthData } from "../redux/slices/authSlice";
import { fetchProfile } from "../redux/slices/userSlice";
import { useAppDispatch } from "../redux/hooks";

const API_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || "https://api.kooka.site/api";

// Required for web browser to dismiss properly
WebBrowser.maybeCompleteAuthSession();

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
  const dispatch = useAppDispatch();

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Use Expo's auth proxy - works with Google OAuth
      const redirectUri = makeRedirectUri({
        path: 'auth/google/callback',
      });
      
      // Build OAuth URL with redirect URI
      const authUrl = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      console.log("🚀 Opening Google auth URL:", authUrl);
      console.log("🔗 Redirect URI:", redirectUri);
      console.log("🌐 API_URL:", API_URL);
      
      // Open browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      
      console.log("📱 WebBrowser result:", result);
      
      if (result.type === "success") {
        // Parse token and user from URL
        const url = result.url;
        const params = new URL(url).searchParams;
        const token = params.get("token");
        const userJson = params.get("user");
        const error = params.get("error");
        
        if (error) {
          console.error("❌ Google login failed:", error);
          Alert.alert("Đăng nhập thất bại", error === "auth_failed" ? "Xác thực Google thất bại" : error);
          return;
        }
        
        if (token && userJson) {
          try {
            // Save token to AsyncStorage
            await AsyncStorage.setItem("token", token);
            
            // Parse user data
            const userData = JSON.parse(decodeURIComponent(userJson));
            
            console.log("📦 User data from backend:", userData);
            console.log("🔑 Token:", token);
            
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            
            // Dispatch to Redux store
            dispatch(setAuthData({ user: userData, token }));
            
            // Fetch user profile to get full information
            if (userData._id) {
              dispatch(fetchProfile(userData._id));
            }
            
            // console.log("✅ Login thành công! User:", userData.username || userData.email);
            
            onSuccess?.();
          } catch (parseError) {
            console.error("❌ Lỗi parse data:", parseError);
            console.error("Raw userJson:", userJson);
            Alert.alert("Lỗi", "Không thể xử lý dữ liệu đăng nhập");
          }
        } else {
          console.error("❌ Missing data - Token:", !!token, "UserJson:", !!userJson);
          Alert.alert("Lỗi", "Không nhận được thông tin đăng nhập từ server");
        }
      } else if (result.type === "cancel") {
        console.log("⚠️ User cancelled authentication");
      } else if (result.type === "dismiss") {
        console.log("⚠️ Browser dismissed");
      }
      
    } catch (error: any) {
      console.error("❌ Google auth failed:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert(
        "Lỗi đăng nhập", 
        `Không thể kết nối đến server.\n\nChi tiết: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (text) {
      case "signin_with":
        return " Đăng nhập với Google";
      case "signup_with":
        return " Đăng ký với Google";
      case "continue_with":
        return " Tiếp tục với Google";
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
