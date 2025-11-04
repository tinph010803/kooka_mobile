import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LogOut, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from 'react-native-safe-area-context';

const HomePage: React.FC = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.navigate("Login" as never);
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#FFF7ED", "#FFFFFF", "#FEF2F2"]}
        className="flex-1"
      >
        <View className="flex-1 p-5 justify-center items-center">
          <View className="items-center mb-10">
            <LinearGradient
              colors={["#F97316", "#DC2626"]}
              className="w-20 h-20 rounded-full justify-center items-center mb-4"
            >
              <User size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text className="text-4xl font-bold text-gray-900 mb-2">Welcome!</Text>
            <Text className="text-base text-gray-500">
              Demo User
            </Text>
          </View>

          <View className="bg-white rounded-xl p-6 mb-8 shadow-lg w-full max-w-[400px]">
            <Text className="text-xl font-bold text-gray-900 mb-3 text-center">🎉 You're logged in!</Text>
            <Text className="text-sm text-gray-500 text-center leading-5">
              This is a demo home page. You can add your main app content here.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="rounded-lg overflow-hidden w-full max-w-[400px]"
          >
            <LinearGradient
              colors={["#F97316", "#DC2626"]}
              className="flex-row py-3.5 px-5 items-center justify-center"
            >
              <LogOut size={20} color="#FFFFFF" />
              <Text className="text-base font-semibold text-white ml-2">Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomePage;
