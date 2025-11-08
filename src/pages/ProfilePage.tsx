import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  User,
  LogOut,
  Heart,
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  Star,
} from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/slices/authSlice";
import { fetchProfile } from "../redux/slices/userSlice";

const ProfilePage: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchProfile(user._id));
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          navigation.navigate("Login" as never);
        },
      },
    ]);
  };

  const getUserInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4">
          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 items-center justify-center overflow-hidden border-2">
              {profile?.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white text-xl font-bold">
                  {getUserInitials()}
                </Text>
              )}
            </View>

            <View className="ml-3 flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-gray-900 text-lg font-bold">
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : user?.username || "Người dùng"}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">
                Tham gia: {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                  : new Date().toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate("AccountManagement" as never)}
            className="bg-black rounded-2xl p-4 mb-4 flex-row items-center justify-center shadow-sm"
          >
            <User size={20} color="#ffffff" />
            <Text className="text-white font-bold ml-2">Quản lý tài khoản</Text>
          </TouchableOpacity>

          <View className="mb-4 bg-white rounded-2xl shadow-sm overflow-hidden">
            <MenuItem 
              icon={Heart} 
              label="Công Thức Yêu thích" 
              onPress={() => navigation.navigate("Favorites" as never)}
            />
            <MenuItem 
              icon={Star} 
              label="Đánh Giá Của Tôi" 
              onPress={() => navigation.navigate("MyReviews" as never)}
            />
            <MenuItem icon={Settings} label="Cài đặt" />
            <MenuItem icon={ShieldCheck} label="Chính sách bảo mật" />
            <MenuItem icon={HelpCircle} label="Liên hệ" />
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between py-4 bg-white rounded-2xl px-4 shadow-sm"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#EF4444" />
              <Text className="text-red-500 font-bold ml-3">Đăng xuất</Text>
            </View>
            <ChevronRight size={20} color="#EF4444" />
          </TouchableOpacity>

          <View className="items-center py-6">
            <Text className="text-gray-500 text-xs">Kooka Mobile v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface MenuItemProps {
  icon: any;
  label: string;
  onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Icon size={20} color="#6B7280" />
        <Text className="text-gray-900 ml-3">{label}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

export default ProfilePage;
