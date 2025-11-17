import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { useNotifications } from '../hooks/useNotifications';
import {
  Notification,
  NotificationCategory,
  NotificationType,
} from '../types/notification.types';

interface NotificationListProps {
  category: NotificationCategory;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  category,
}) => {
  const navigation = useNavigation<any>();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
  } = useNotifications({ category });


  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.relatedRecipe?.recipeId) {
      navigation.navigate('RecipeDetail', {
        recipeId: notification.relatedRecipe.recipeId,
      });
    }
  };

  const handleDelete = (notificationId: string) => {
    Toast.show({
      type: "info",
      text1: "⚠️ Xác nhận xóa",
      text2: "Nhấn và giữ để xác nhận xóa thông báo",
      visibilityTime: 3000,
      onPress: () => {
        deleteNotification(notificationId);
        Toast.show({
          type: "success",
          text1: "✅ Đã xóa",
          text2: "Thông báo đã được xóa",
        });
      },
    });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleNotificationPress(item)}
      className="flex-row items-center bg-white rounded-2xl mb-3 p-3 shadow-sm"
    >
      {/* Hình ảnh công thức bên trái */}
      <Image
        source={{ uri: item.relatedRecipe?.recipeImage }}
        className="w-[60px] h-[60px] rounded-xl"
        resizeMode="cover"
      />

      {/* Nội dung */}
      <View className="flex-1 mx-2.5">
        <Text className="text-[15px] font-semibold text-gray-900" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-[13px] text-gray-500 mt-0.5" numberOfLines={1}>
          {item.message}
        </Text>
        <Text className="text-xs text-gray-400 mt-1.5">{formatTime(item.createdAt)}</Text>
      </View>

      {/* Icon xóa bên phải */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleDelete(item._id);
        }}
        className="p-1.5"
      >
        <Trash2 size={18} color="#9ca3af" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-24 px-10">
      <Text className="text-5xl mb-3 opacity-30">
        {category === 'RECIPE' ? '🍳' : '💬'}
      </Text>
      <Text className="text-sm text-gray-400 text-center leading-5">
        {category === 'RECIPE'
          ? 'Thông báo về món ăn yêu thích sẽ hiển thị tại đây'
          : 'Thông báo về bình luận, lượt thích sẽ hiển thị tại đây'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-5 items-center">
        <ActivityIndicator size="small" color="#ff6b35" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header nhỏ hiển thị loại thông báo */}
      <View className="px-4 pt-4">
        <Text className="text-lg font-bold text-gray-900 mb-2">
          {category === 'RECIPE' ? 'Công thức' : 'Cộng đồng'}
        </Text>
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { padding: 12 }}
      />
    </View>
  );
};
