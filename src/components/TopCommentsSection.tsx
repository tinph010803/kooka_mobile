import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MessageSquare, Star, ThumbsUp } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { Comment } from "../redux/slices/commentSlice";

interface TopCommentsSectionProps {
  comments: Comment[];
  loading?: boolean;
}

const { width } = Dimensions.get("window");

const TopCommentsSection: React.FC<TopCommentsSectionProps> = ({
  comments,
  loading = false,
}) => {
  const navigation = useNavigation();

  const handleCommentPress = (recipeId?: string) => {
    if (recipeId) {
      (navigation as any).navigate("RecipeDetail", { id: recipeId });
    }
  };

  if (loading) {
    return (
      <View className="mt-8">
        <View className="px-4 mb-4 flex-row items-center gap-2">
          <MessageSquare size={24} color="#10b981" />
          <Text className="text-gray-900 text-xl font-bold">Top Bình Luận</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-4"
        >
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              className="mr-3 bg-gray-200 rounded-xl animate-pulse"
              style={{ width: width * 0.7, height: 200 }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <View className="mt-8">
      <View className="px-4 mb-4 flex-row items-center gap-2">
        <MessageSquare size={24} color="#10b981" />
        <Text className="text-gray-900 text-xl font-bold">Top Bình Luận</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-4"
        snapToInterval={width * 0.7 + 12}
        decelerationRate="fast"
      >
        {comments.map((comment, index) => (
          <TouchableOpacity
            key={comment._id}
            onPress={() => handleCommentPress(comment.recipe?._id)}
            activeOpacity={0.9}
            className={index === comments.length - 1 ? "mr-4" : "mr-3"}
            style={{ width: width * 0.7 }}
          >
            <View className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {/* Recipe Image */}
              <View className="relative h-40">
                <Image
                  source={{
                    uri:
                      comment.recipe?.image ||
                      "https://via.placeholder.com/400x200",
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <View className="absolute bottom-3 left-3 right-3">
                  {/* User Info */}
                  <View className="flex-row items-center gap-2">
                    {comment.userAvatar ? (
                      <Image
                        source={{ uri: comment.userAvatar }}
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center border-2 border-white">
                        <Text className="text-orange-600 font-bold">
                          {comment.firstName?.[0]}
                        </Text>
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm">
                        {comment.firstName} {comment.lastName}
                      </Text>
                      {comment.recipe && (
                        <Text
                          className="text-white/80 text-xs"
                          numberOfLines={1}
                        >
                          {comment.recipe.name}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Comment Content */}
              <View className="p-4">
                <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
                  {comment.content}
                </Text>
                <View className="flex-row items-center gap-4">
                  {comment.ratingRecipe && (
                    <View className="flex-row items-center gap-1">
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-gray-600 text-xs font-medium">
                        {comment.ratingRecipe}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center gap-1">
                    <ThumbsUp size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs font-medium">
                      {comment.likes || 0}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MessageSquare size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs font-medium">
                      {comment.replyCount || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TopCommentsSection;
