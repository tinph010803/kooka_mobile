import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Star, Trash2, Edit3 } from "lucide-react-native";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import axiosInstance from "../utils/axiosInstance";
import Toast from "react-native-toast-message";
import { fetchUserReviews } from "../redux/slices/commentSlice";
import type { Comment } from "../redux/slices/commentSlice";

interface ReviewWithRecipe extends Comment {
  recipe: {
    _id: string;
    name: string;
    image: string;
  };
}

const MyReviewsPage: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userReviews, loading } = useAppSelector((state) => state.comments);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserReviews = async () => {
    try {
      await dispatch(fetchUserReviews()).unwrap();
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách đánh giá",
        position: "top",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserReviews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserReviews();
  };

  const handleRecipePress = (recipeId: string) => {
    (navigation as any).navigate("RecipeDetail", { id: recipeId });
  };

  const handleDeleteReview = async (commentId: string) => {
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      // Reload reviews after delete
      await dispatch(fetchUserReviews()).unwrap();
      
      Toast.show({
        type: "success",
        text1: "Đã xóa",
        text2: "Đánh giá đã được xóa thành công",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xóa đánh giá. Vui lòng thử lại!",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            color={star <= rating ? "#F59E0B" : "#E5E7EB"}
            fill={star <= rating ? "#F59E0B" : "none"}
            strokeWidth={2}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Đánh Giá Của Tôi</Text>
      </View>

      {/* Content */}
      {loading && userReviews.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-gray-500 mt-3">Đang tải đánh giá...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 bg-gray-50"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
            />
          }
        >
          <View className="pb-20 pt-4">
            {userReviews.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="bg-gray-100 rounded-full p-6 mb-4">
                  <Star size={48} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 text-lg font-semibold mb-2">
                  Chưa có đánh giá
                </Text>
                <Text className="text-gray-400 text-sm text-center px-8">
                  Hãy thử các món ăn và để lại đánh giá của bạn!
                </Text>
              </View>
            ) : (
              userReviews
                .filter((review) => review.recipe) // Chỉ hiển thị review có recipe
                .map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review as ReviewWithRecipe}
                    onRecipePress={() => handleRecipePress(review.recipe!._id)}
                    onDelete={() => handleDeleteReview(review._id)}
                    renderStars={renderStars}
                  />
                ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

interface ReviewCardProps {
  review: ReviewWithRecipe;
  onRecipePress: () => void;
  onDelete: () => void;
  renderStars: (rating: number) => React.ReactElement;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onRecipePress,
  onDelete,
  renderStars,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hôm nay";
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
    return `${Math.floor(days / 365)} năm trước`;
  };

  return (
    <View className="mb-4 bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200">
      {/* Recipe Info - Clickable */}
      <TouchableOpacity
        onPress={onRecipePress}
        className="flex-row p-4 border-b border-gray-100 bg-gray-50"
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: review.recipe.image }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={2}>
            {review.recipe.name}
          </Text>
          <Text className="text-gray-500 text-xs">Nhấn để xem chi tiết</Text>
        </View>
      </TouchableOpacity>

      {/* Review Content */}
      <View className="p-4">
        {/* Rating & Date */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            {review.ratingRecipe && renderStars(review.ratingRecipe)}
            <Text className="text-gray-700 text-sm font-semibold ml-2">
              {review.ratingRecipe}.0
            </Text>
          </View>
          <Text className="text-gray-400 text-xs">
            {formatDate(review.createdAt)}
          </Text>
        </View>

        {/* Comment Text */}
        <View className="bg-gray-50 p-3 rounded-xl mb-3">
          <Text className="text-gray-700 text-sm leading-5">
            {review.content}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={onDelete}
            className="bg-red-500 py-2.5 px-4 rounded-xl flex-row items-center shadow-sm"
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#ffffff" />
            <Text className="text-white font-bold text-sm ml-2">Xóa đánh giá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MyReviewsPage;
