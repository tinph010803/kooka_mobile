import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchPopularRecipes } from "../redux/slices/recipeSlice";
import { checkMultipleRecipes } from "../redux/slices/favoriteSlice";
import RecipeCard from "./RecipeCard";

const PopularRecipes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { popularRecipes, loading } = useSelector((state: RootState) => state.recipes);
  const user = useSelector((state: RootState) => state.auth.user);

  // Memoize recipe IDs to prevent unnecessary recalculations
  const displayedRecipeIds = useMemo(() => {
    return popularRecipes
      .map((recipe) => recipe._id)
      .join(",");
  }, [popularRecipes]);

  useEffect(() => {
    dispatch(fetchPopularRecipes(6));
  }, [dispatch]);

  // Check favorites for all recipes when user is logged in
  // Only run when user changes or displayed recipes change
  useEffect(() => {
    if (user && displayedRecipeIds) {
      const recipeIds = displayedRecipeIds.split(",");
      dispatch(checkMultipleRecipes({ recipeIds }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, displayedRecipeIds, dispatch]);

  console.log("PopularRecipes - popularRecipes:", popularRecipes);

  return (
    <View className="py-6 px-4 bg-white pb-8">
      <View className="max-w-7xl mx-auto">
        {/* Section Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Công thức phổ biến
          </Text>
          <Text className="text-sm text-gray-600 text-center px-4 leading-5">
            Khám phá những công thức nấu ăn yêu thích nhất từ cộng đồng đầu bếp
            tại gia!
          </Text>
        </View>

        {/* Recipe Grid */}
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <>
            <View className="flex-row flex-wrap justify-between mb-4">
              {popularRecipes.map((recipe) => (
                <View 
                  key={recipe._id}
                  className="mb-3"
                  style={{ width: '48%' }}
                >
                  <RecipeCard
                    id={recipe._id}
                    title={recipe.name}
                    description={recipe.short}
                    image={recipe.image}
                    rating={recipe.rate}
                    difficulty={recipe.difficulty}
                    cookTime={`${recipe.time}m`}
                    servings={recipe.size}
                    cuisine={recipe.cuisine.name}
                    ingredients={
                      Array.isArray(recipe.ingredients)
                        ? recipe.ingredients.slice(0, 3).map((ing) => ing.name)
                        : []
                    }
                    moreIngredients={
                      Array.isArray(recipe.ingredients) &&
                      recipe.ingredients.length > 3
                        ? recipe.ingredients.length - 3
                        : 0
                    }
                    reviews={recipe.numberOfRate}
                  />
                </View>
              ))}
            </View>

            {/* View All Button */}
            {popularRecipes.length > 0 && (
              <View className="items-center">
                <TouchableOpacity 
                  className="bg-orange-500 rounded-xl px-8 py-3 flex-row items-center shadow-md"
                  onPress={() => (navigation as any).navigate("AllRecipes", { type: "all" })}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold text-sm mr-2">
                    Xem tất cả món ăn
                  </Text>
                  <Text className="text-white text-lg">→</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default PopularRecipes;
