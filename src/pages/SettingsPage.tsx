import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Wifi, Signal, Zap } from "lucide-react-native";

const SettingsPage: React.FC = () => {
  const navigation = useNavigation();
  const [autoPlayWifi, setAutoPlayWifi] = useState(true);
  const [autoPlay5G, setAutoPlay5G] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState("1.5x");

  const speedOptions = ["1.0x", "1.25x", "1.5x", "1.75x", "2.0x"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold">Cài đặt</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cài đặt trình chiếu */}
        <View className="px-4 py-4">
          <Text className="text-gray-600 text-sm mb-4 font-semibold">
            Cài đặt trình chiếu
          </Text>

          {/* Chất lượng phát mạc định - Wifi */}
          <View className="bg-white rounded-2xl mb-3 p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Wifi size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">
                    Chất lượng phát mặc định
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Khi sử dụng wifi
                  </Text>
                </View>
              </View>
              <Switch
                value={autoPlayWifi}
                onValueChange={setAutoPlayWifi}
                trackColor={{ false: "#d1d5db", true: "#10b981" }}
                thumbColor={autoPlayWifi ? "#ffffff" : "#9ca3af"}
              />
            </View>
            <View className="bg-green-500 px-3 py-1.5 rounded-lg self-end">
              <Text className="text-white text-xs font-semibold">Tự động</Text>
            </View>
          </View>

          {/* Chất lượng phát mạc định - 5G/4G */}
          <View className="bg-white rounded-2xl mb-3 p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Signal size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">
                    Chất lượng phát mặc định
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Khi sử dụng 5G/4G
                  </Text>
                </View>
              </View>
              <Switch
                value={autoPlay5G}
                onValueChange={setAutoPlay5G}
                trackColor={{ false: "#d1d5db", true: "#10b981" }}
                thumbColor={autoPlay5G ? "#ffffff" : "#9ca3af"}
              />
            </View>
            <View className="bg-green-500 px-3 py-1.5 rounded-lg self-end">
              <Text className="text-white text-xs font-semibold">Tự động</Text>
            </View>
          </View>

          {/* Tốc độ tua */}
          <View className="bg-white rounded-2xl mb-3 p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Zap size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold">Tốc độ tua</Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Khi giữ vào player
                  </Text>
                </View>
              </View>
              <View className="bg-green-500 px-3 py-1.5 rounded-lg">
                <Text className="text-white text-xs font-semibold">
                  {playbackSpeed}
                </Text>
              </View>
            </View>

            {/* Speed Options */}
            <View className="flex-row justify-between mt-2">
              {speedOptions.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  onPress={() => setPlaybackSpeed(speed)}
                  className={`px-4 py-2 rounded-lg ${
                    playbackSpeed === speed ? "bg-green-500" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      playbackSpeed === speed ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {speed}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Cài đặt hệ thống */}
        <View className="px-4 py-4">
          <Text className="text-gray-600 text-sm mb-4 font-semibold">Cài đặt hệ thống</Text>

          {/* Cập nhật ứng dụng */}
          <View className="bg-white rounded-2xl mb-3 p-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold mb-1">
                  Cập nhật ứng dụng
                </Text>
                <Text className="text-gray-500 text-xs">
                  Phiên bản hiện tại: 1.0.0
                </Text>
              </View>
              <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg shadow-sm">
                <Text className="text-white text-xs font-semibold">
                  Kiểm tra ngay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="pb-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;
