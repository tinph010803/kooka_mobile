import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

interface Notification {
  id: string;
  title: string;
  message: string;
  image: string;
  time: string;
  icon: string;
  iconBg: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Bún Chả Hà Nội",
    message: "vừa được thêm vào danh sách món ăn mới",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100",
    time: "5 ngày trước",
    icon: "⚡",
    iconBg: "#f97316",
  },
  {
    id: "2",
    title: "Phở Bò Truyền Thống",
    message: "có công thức mới được cập nhật",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100",
    time: "1 tuần trước",
    icon: "✨",
    iconBg: "#10b981",
  },
  {
    id: "3",
    title: "Bánh Xèo Miền Tây",
    message: "vừa ra mắt trên Kooka",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100",
    time: "1 tháng trước",
    icon: "🎉",
    iconBg: "#3b82f6",
  },
  {
    id: "4",
    title: "Cơm Tấm Sườn Bì",
    message: "có video hướng dẫn chi tiết",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100",
    time: "2 tháng trước",
    icon: "📹",
    iconBg: "#a855f7",
  },
  {
    id: "5",
    title: "Gỏi Cuốn Tôm Thịt",
    message: "có mẹo hay được cập nhật",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100",
    time: "3 tháng trước",
    icon: "💡",
    iconBg: "#ec4899",
  },
];

const NotificationsPage: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"recipes" | "community">("recipes");

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Thông báo</Text>
        <TouchableOpacity>
          <Text className="text-orange-500 text-sm font-semibold">Đã đọc</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 bg-white">
        <TouchableOpacity
          onPress={() => setActiveTab("recipes")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "recipes" ? "border-orange-500" : "border-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "recipes" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            Công thức
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("community")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "community" ? "border-orange-500" : "border-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "community" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            Cộng đồng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        {activeTab === "recipes" ? (
          <>
            {MOCK_NOTIFICATIONS.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className="px-5 py-4 border-b border-gray-100 active:bg-orange-50"
              >
                <View className="flex-row gap-3">
                  {/* Image with icon badge */}
                  <View className="relative">
                    <Image
                      source={{ uri: notification.image }}
                      className="w-14 h-14 rounded-xl"
                      resizeMode="cover"
                    />
                    <View
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: notification.iconBg }}
                    >
                      <Text className="text-[10px]">{notification.icon}</Text>
                    </View>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-800 leading-5">
                      <Text className="font-semibold text-gray-900">{notification.title}</Text>{" "}
                      {notification.message}
                    </Text>
                    <View className="flex-row items-center mt-1.5">
                      <View className="w-1 h-1 bg-gray-400 rounded-full mr-1.5" />
                      <Text className="text-xs text-gray-500">{notification.time}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          /* Community Tab - Empty State */
          <View className="px-5 py-20 items-center">
            <Bell size={48} color="#d1d5db" />
            <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
              Chưa có thông báo cộng đồng
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Các thông báo về bình luận, lượt thích sẽ hiển thị tại đây
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {activeTab === "recipes" && (
        <View className="px-5 py-3.5 bg-orange-50 border-t border-gray-200">
          <TouchableOpacity className="w-full py-2 items-center">
            <Text className="text-sm text-orange-600 font-semibold">
              Xem tất cả thông báo →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationsPage;
