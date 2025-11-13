import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NotificationList } from "../components/NotificationList";
import { NotificationCategory } from "../types/notification.types";

export const NotificationPage: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<NotificationCategory>("RECIPE");
  const slideAnim = useState(new Animated.Value(0))[0];

  const handleSwitch = (tab: NotificationCategory) => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === "RECIPE" ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black">Thông báo</Text>
        <View className="w-8" />
      </View>

      {/* Tabs */}
      <View className="px-4 mt-2">
        <View className="flex-row bg-gray-100 rounded-xl overflow-hidden relative" style={{ elevation: 2 }}>
          <Animated.View
            style={[
              styles.activeIndicator,
              { transform: [{ translateX }] },
            ]}
          />
          <TouchableOpacity
            className="flex-1 py-3 items-center justify-center"
            onPress={() => handleSwitch("RECIPE")}
          >
            <Text
              className={`text-base font-semibold ${
                activeTab === "RECIPE" ? "text-white font-bold" : "text-gray-500"
              }`}
            >
              Công thức
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 items-center justify-center"
            onPress={() => handleSwitch("COMMUNITY")}
          >
            <Text
              className={`text-base font-semibold ${
                activeTab === "COMMUNITY" ? "text-white font-bold" : "text-gray-500"
              }`}
            >
              Cộng đồng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification List */}
      <NotificationList category={activeTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#ff6b35",
    borderRadius: 12,
    zIndex: -1,
  },
});
