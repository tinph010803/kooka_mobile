import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import {
  Flame,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Star,
  User,
  Play,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { Recipe } from "../redux/slices/recipeSlice";
import type { Comment } from "../redux/slices/commentSlice";

interface MostFavoritedRecipe {
  _id: string;
  name: string;
  image: string;
  favoriteCount: number;
  rank?: number;
}

interface ThreeColumnSectionProps {
  trendingRecipes: Recipe[];
  mostFavorited: MostFavoritedRecipe[];
  newestComments: Comment[];
  loading?: boolean;
}

const { width } = Dimensions.get("window");

const ThreeColumnSection: React.FC<ThreeColumnSectionProps> = ({
  trendingRecipes,
  mostFavorited,
  newestComments,
  loading = false,
}) => {
  const navigation = useNavigation();

  const handleRecipePress = (recipeId: string) => {
    (navigation as any).navigate("RecipeDetail", { id: recipeId });
  };

  const handleCommentPress = (recipeId?: string) => {
    if (recipeId) {
      (navigation as any).navigate("RecipeDetail", { id: recipeId });
    }
  };

  const getTrendingIcon = (index: number) => {
    if (index < 2) return <TrendingUp size={18} color="#10b981" />;
    if (index === 2)
      return (
        <View className="w-[18px] h-[18px] items-center justify-center">
          <View className="w-3 h-0.5 bg-gray-500" />
        </View>
      );
    return <TrendingDown size={18} color="#ef4444" />;
  };

  if (loading) {
    return (
      <View className="mt-8">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-4"
          snapToInterval={width * 0.85 + 12}
          decelerationRate="fast"
        >
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              className="mr-3 bg-white rounded-xl p-4 shadow-lg border border-gray-200"
              style={{ width: width * 0.85 }}
            >
              <View className="h-8 bg-gray-200 rounded mb-4 animate-pulse" />
              {[...Array(5)].map((_, j) => (
                <View
                  key={j}
                  className="h-16 bg-gray-200 rounded-lg mb-2 animate-pulse"
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="mt-8">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-4"
        snapToInterval={width * 0.85 + 12}
        decelerationRate="fast"
      >
        {/* SÔI NỔI NHẤT */}
        <View
          className="mr-3 bg-white rounded-xl p-4 shadow-lg border border-gray-200"
          style={{ width: width * 0.85 }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Flame size={20} color="#10b981" />
            <Text className="text-gray-900 text-lg font-bold">
              Sôi Nổi Nhất
            </Text>
          </View>

          {trendingRecipes.length === 0 ? (
            <Text className="text-center py-8 text-gray-500 text-sm">
              Chưa có dữ liệu
            </Text>
          ) : (
            <View>
              {trendingRecipes.slice(0, 5).map((recipe, index) => (
                <TouchableOpacity
                  key={recipe._id}
                  onPress={() => handleRecipePress(recipe._id)}
                  className="flex-row items-center gap-3 p-2 rounded-lg active:bg-gray-100 mb-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-xl font-bold text-gray-500 w-6">
                    {index + 1}.
                  </Text>
                  {getTrendingIcon(index)}
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-10 h-14 rounded-md"
                    resizeMode="cover"
                  />
                  <Text
                    className="flex-1 text-gray-900 text-sm font-medium"
                    numberOfLines={2}
                  >
                    {recipe.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {trendingRecipes.length > 5 && (
                <TouchableOpacity className="w-full items-center py-2 mt-2">
                  <Text className="text-sm text-gray-600 font-medium">
                    Xem thêm
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* YÊU THÍCH NHẤT */}
        <View
          className="mr-3 bg-white rounded-xl p-4 shadow-lg border border-gray-200"
          style={{ width: width * 0.85 }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <ThumbsUp size={20} color="#3b82f6" />
            <Text className="text-gray-900 text-lg font-bold">
              Yêu Thích Nhất
            </Text>
          </View>

          {mostFavorited.length === 0 ? (
            <Text className="text-center py-8 text-gray-500 text-sm">
              Chưa có dữ liệu
            </Text>
          ) : (
            <View>
              {mostFavorited.slice(0, 5).map((recipe, index) => (
                <TouchableOpacity
                  key={recipe._id}
                  onPress={() => handleRecipePress(recipe._id)}
                  className="flex-row items-center gap-3 p-2 rounded-lg active:bg-gray-100 mb-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-xl font-bold text-gray-500 w-6">
                    {index + 1}.
                  </Text>
                  {getTrendingIcon(index)}
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-10 h-14 rounded-md"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-gray-900 text-sm font-medium mb-0.5"
                      numberOfLines={2}
                    >
                      {recipe.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {recipe.favoriteCount} lượt thích
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {mostFavorited.length > 5 && (
                <TouchableOpacity className="w-full items-center py-2 mt-2">
                  <Text className="text-sm text-gray-600 font-medium">
                    Xem thêm
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* BÌNH LUẬN MỚI */}
        <View
          className="mr-4 bg-white rounded-xl p-4 shadow-lg border border-gray-200"
          style={{ width: width * 0.85 }}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Sparkles size={20} color="#a855f7" />
            <Text className="text-gray-900 text-lg font-bold">
              Bình Luận Mới
            </Text>
          </View>

          {newestComments.length === 0 ? (
            <Text className="text-center py-8 text-gray-500 text-sm">
              Chưa có bình luận mới nào
            </Text>
          ) : (
            <View>
              {newestComments.slice(0, 5).map((comment) => (
                <TouchableOpacity
                  key={comment._id}
                  onPress={() => handleCommentPress(comment.recipe?._id)}
                  className="flex-row gap-3 p-2 rounded-lg active:bg-gray-100 mb-3"
                  activeOpacity={0.7}
                >
                  {/* User Avatar */}
                  <View className="flex-shrink-0">
                    {comment.userAvatar ? (
                      <Image
                        source={{ uri: comment.userAvatar }}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                        <User size={20} color="#6b7280" />
                      </View>
                    )}
                  </View>

                  {/* Comment Content */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-0.5">
                      <Text className="font-semibold text-sm text-gray-900">
                        {comment.firstName} {comment.lastName}
                      </Text>
                      {comment.ratingRecipe && (
                        <View className="flex-row items-center gap-1">
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <Text className="text-xs text-gray-600">
                            {comment.ratingRecipe}
                          </Text>
                        </View>
                      )}
                    </View>

                    {comment.recipe && (
                      <View className="flex-row items-center gap-1 mb-1">
                        <Play size={10} color="#f97316" />
                        <Text
                          className="text-xs text-gray-600"
                          numberOfLines={1}
                        >
                          {comment.recipe.name}
                        </Text>
                      </View>
                    )}

                    <Text className="text-xs text-gray-700" numberOfLines={2}>
                      {comment.content}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ThreeColumnSection;
