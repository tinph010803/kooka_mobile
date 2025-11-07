import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { toggleFavorite } from "../redux/slices/favoriteSlice";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  difficulty: string;
  cookTime: string;
  servings: number;
  cuisine: string;
  ingredients: string[];
  moreIngredients?: number;
  reviews: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  description,
  image,
  rating,
  difficulty,
  cookTime,
  servings,
  cuisine,
  ingredients,
  moreIngredients,
  reviews,
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { favoriteRecipeIds } = useAppSelector((state) => state.favorites);
  const { user } = useAppSelector((state) => state.auth);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(favoriteRecipeIds.includes(id));
  }, [favoriteRecipeIds, id]);

  const difficultyColors: Record<string, { bg: string; text: string }> = {
    Dễ: { bg: "#D1FAE5", text: "#065F46" },
    "Trung bình": { bg: "#FEF3C7", text: "#92400E" },
    Khó: { bg: "#FEE2E2", text: "#991B1B" },
  };

  const difficultyColor =
    difficultyColors[difficulty] || { bg: "#F3F4F6", text: "#374151" };

  const handleFavoriteClick = async () => {
    if (!user) {
      // Navigate to login
      // navigation.navigate("Login");
      return;
    }
    try {
      await dispatch(toggleFavorite({ recipeId: id })).unwrap();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4"
      activeOpacity={0.7}
      onPress={() => navigation.navigate("RecipeDetail" as never, { id } as never)}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: image || "https://via.placeholder.com/400x300" }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Rating Badge */}
        <View className="absolute top-3 left-3 flex-row items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Ionicons name="star" size={16} color="#FBBF24" />
          <Text className="ml-1 text-sm font-semibold text-gray-900">
            {(rating || 0).toFixed(1)}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={22}
            color={isFavorited ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>

        {/* Difficulty Badge */}
        <View
          className="absolute bottom-3 right-3 px-3 py-1 rounded-full"
          style={{ backgroundColor: difficultyColor.bg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: difficultyColor.text }}
          >
            {difficulty}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900 mb-2" numberOfLines={2}>
          {title}
        </Text>
        <Text className="text-sm text-gray-600 mb-4" numberOfLines={2}>
          {description}
        </Text>

        {/* Meta Info */}
        <View className="flex-row items-center mb-4">
          <View className="flex-row items-center mr-4">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">{cookTime}</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">{servings} người</Text>
          </View>
          <Text className="text-gray-400">•</Text>
          <Text className="ml-2 text-sm text-gray-600">{cuisine}</Text>
        </View>

        {/* Ingredients */}
        <View className="mb-4">
          <View className="flex-row flex-wrap gap-1">
            {ingredients.slice(0, 3).map((ingredient, index) => (
              <View key={index} className="bg-gray-100 px-2 py-1 rounded-md">
                <Text className="text-xs text-gray-700">{ingredient}</Text>
              </View>
            ))}
            {(moreIngredients ?? 0) > 0 && (
              <View className="bg-gray-100 px-2 py-1 rounded-md">
                <Text className="text-xs text-gray-500">
                  +{moreIngredients} khác
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">{reviews} đánh giá</Text>
          <View className="bg-orange-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold text-sm">
              Xem công thức
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
