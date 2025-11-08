import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

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
  image,
  rating,
  difficulty,
  cookTime,
  servings,
  cuisine,
  ingredients,
  moreIngredients,
}) => {
  const navigation = useNavigation();

  const difficultyColors: Record<string, { bg: string; text: string }> = {
    Dễ: { bg: "#D1FAE5", text: "#065F46" },
    "Trung bình": { bg: "#FEF3C7", text: "#92400E" },
    Khó: { bg: "#FEE2E2", text: "#991B1B" },
  };

  const difficultyColor =
    difficultyColors[difficulty] || { bg: "#F3F4F6", text: "#374151" };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      activeOpacity={0.7}
      onPress={() => navigation.navigate("RecipeDetail" as never, { id } as never)}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: image || "https://via.placeholder.com/400x300" }}
          className="w-full h-32"
          resizeMode="cover"
        />

        {/* Rating Badge */}
        <View className="absolute top-2 left-2 flex-row items-center bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text className="ml-1 text-xs font-bold text-gray-900">
            {(rating || 0).toFixed(1)}
          </Text>
        </View>

        {/* Difficulty Badge */}
        <View
          className="absolute top-2 right-2 px-2 py-1 rounded-lg"
          style={{ backgroundColor: difficultyColor.bg }}
        >
          <Text
            className="text-[10px] font-semibold"
            style={{ color: difficultyColor.text }}
          >
            {difficulty}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-sm font-bold text-gray-900 mb-2" numberOfLines={2}>
          {title}
        </Text>

        {/* Meta Info */}
        <View className="flex-row items-center flex-wrap">
          <View className="flex-row items-center mr-3">
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-600">{cookTime}</Text>
          </View>
          <View className="flex-row items-center mr-3">
            <Ionicons name="people-outline" size={12} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-600">{servings}</Text>
          </View>
          <Text className="text-xs text-gray-600">{cuisine}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
