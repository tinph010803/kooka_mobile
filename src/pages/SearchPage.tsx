import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const SearchPage: React.FC = () => {
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#FFF7ED", "#FFFFFF", "#FEF2F2"]}
        className="flex-1 justify-center items-center"
      >
        <Text className="text-3xl font-bold text-gray-900">Hello Search</Text>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SearchPage;
