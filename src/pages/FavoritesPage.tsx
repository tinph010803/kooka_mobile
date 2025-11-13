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
import { ChevronLeft, Clock, Users, Star, Trash2 } from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { toggleFavorite } from "../redux/slices/favoriteSlice";
import axiosInstance from "../utils/axiosInstance";
import Toast from "react-native-toast-message";

interface Cuisine {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Ingredient {
  _id: string;
  name: string;
}

interface Recipe {
  _id: string;
  name: string;
  image: string;
  time?: number;
  difficulty?: string;
  cuisine?: Cuisine;
  category?: Category;
  ingredients?: Ingredient[];
  rate?: number;
  numberOfRate?: number;
}

interface FavoriteWithRecipe {
  _id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
  recipe?: Recipe;
}

const FavoritesPage: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [favorites, setFavorites] = useState<FavoriteWithRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavoritesWithRecipes = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/favorites/user/${user._id}`);
      
      if (response.data && response.data.favorites) {
        // Fetch recipe details for each favorite
        const favoritesWithRecipes = await Promise.all(
          response.data.favorites.map(async (fav: FavoriteWithRecipe) => {
            try {
              const recipeResponse = await axiosInstance.get(`/recipes/${fav.recipeId}`);
              return {
                ...fav,
                recipe: recipeResponse.data,
              };
            } catch (error) {
              console.error(`Error fetching recipe ${fav.recipeId}:`, error);
              return fav;
            }
          })
        );
        setFavorites(favoritesWithRecipes);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavoritesWithRecipes();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavoritesWithRecipes();
  };

  const handleRecipePress = (recipeId: string) => {
    (navigation as any).navigate("RecipeDetail", { id: recipeId });
  };

  const handleRemoveFavorite = async (favoriteId: string, recipeId: string) => {
    try {
      // Dùng Redux action để đồng bộ state
      await dispatch(toggleFavorite({ recipeId })).unwrap();
      
      // Remove from local state
      setFavorites(favorites.filter((fav) => fav._id !== favoriteId));
      
      // Show success toast
      Toast.show({
        type: "success",
        text1: "Đã bỏ thích",
        text2: "Công thức đã được xóa khỏi danh sách yêu thích",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      
      // Show error toast
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể bỏ thích công thức. Vui lòng thử lại!",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Yêu thích</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#F97316"
            />
          }
        >
          <View className="pb-20 pt-2">
            {favorites.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Text className="text-gray-400 text-base">
                  Chưa có công thức yêu thích
                </Text>
              </View>
            ) : (
              favorites.map((favorite) => (
                <FavoriteRecipeCard
                  key={favorite._id}
                  favorite={favorite}
                  onPress={() => handleRecipePress(favorite.recipeId)}
                  onRemove={() =>
                    handleRemoveFavorite(favorite._id, favorite.recipeId)
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

interface FavoriteRecipeCardProps {
  favorite: FavoriteWithRecipe;
  onPress: () => void;
  onRemove: () => void;
}

const FavoriteRecipeCard: React.FC<FavoriteRecipeCardProps> = ({
  favorite,
  onPress,
  onRemove,
}) => {
  const recipe = favorite.recipe;

  if (!recipe) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 bg-white rounded-2xl overflow-hidden shadow-sm border-gray-200"
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Recipe Image */}
        <View className="w-36 h-48 bg-gray-200 relative">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Category Badge - Top Left */}
          {recipe.category && (
            <View className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">
                {recipe.category.name}
              </Text>
            </View>
          )}
          {/* Difficulty Badge - Bottom Left */}
          {recipe.difficulty && (
            <View className="absolute bottom-2 left-2 bg-green-500 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-bold">
                {recipe.difficulty}
              </Text>
            </View>
          )}
        </View>

        {/* Recipe Info */}
        <View className="flex-1 px-4 py-4 justify-between">
          <View className="flex-1">
            {/* Recipe Name */}
            <Text className="text-gray-900 font-bold text-base mb-2" numberOfLines={2}>
              {recipe.name}
            </Text>
            
            {/* Cuisine */}
            {recipe.cuisine && (
              <Text className="text-gray-500 text-sm mb-3">
                {recipe.cuisine.name}
              </Text>
            )}

            {/* Stats - Separated with spacing */}
            <View className="space-y-2.5">
              {/* Time */}
              {recipe.time && (
                <View className="flex-row items-center">
                  <View className="w-5 items-center">
                    <Clock size={16} color="#6B7280" />
                  </View>
                  <Text className="text-gray-700 text-sm ml-2 font-medium">
                    {recipe.time} phút
                  </Text>
                </View>
              )}

              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <View className="flex-row items-center">
                  <View className="w-5 items-center">
                    <Users size={16} color="#6B7280" />
                  </View>
                  <Text className="text-gray-700 text-sm ml-2 font-medium">
                    {recipe.ingredients.length} nguyên liệu
                  </Text>
                </View>
              )}

              {/* Rating */}
              {recipe.rate !== undefined && (
                <View className="flex-row items-center">
                  <View className="w-5 items-center">
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  </View>
                  <Text className="text-gray-700 text-sm ml-2 font-medium">
                    {recipe.rate.toFixed(1)} 
                    <Text className="text-gray-500"> ({recipe.numberOfRate || 0} đánh giá)</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={onRemove}
            className="bg-red-500 py-2 px-3 rounded-lg self-start mt-3 flex-row items-center"
            activeOpacity={0.7}
          >
            <Trash2 size={14} color="#ffffff" />
            <Text className="text-white font-semibold text-xs ml-1.5">Bỏ thích</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FavoritesPage;
