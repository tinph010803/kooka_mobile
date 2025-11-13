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
          <Ionicons name="star" size={11} color="#FBBF24" />
          <Text className="ml-1 text-[11px] font-bold text-gray-900">
            {(rating || 0).toFixed(1)}
          </Text>
        </View>

        {/* Difficulty Badge */}
        <View
          className="absolute top-2 right-2 px-2 py-1 rounded-lg"
          style={{ backgroundColor: difficultyColor.bg }}
        >
          <Text
            className="text-[9px] font-semibold"
            style={{ color: difficultyColor.text }}
          >
            {difficulty}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-2.5">
        <Text className="text-xs font-bold text-gray-900 mb-1.5 leading-tight" numberOfLines={1}>
          {title}
        </Text>

        {/* Meta Info */}
        <View className="flex-row items-center flex-wrap gap-2">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={11} color="#6B7280" />
            <Text className="ml-0.5 text-[10px] text-gray-600">{cookTime}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={11} color="#6B7280" />
            <Text className="ml-0.5 text-[10px] text-gray-600">{servings}</Text>
          </View>
          <Text className="text-[10px] text-gray-600">{cuisine}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
