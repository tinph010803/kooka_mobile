import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  searchRecipes,
  searchRecipesByKeyword,
} from "../redux/slices/recipeSlice";
import { checkMultipleRecipes } from "../redux/slices/favoriteSlice";
import RecipeCard from "./RecipeCard";

interface SearchingRecipesProps {
  // trường hợp tìm theo ingredients
  ingredients?: string[];
  cuisine?: string;
  category?: string;
  tags?: string[];

  // trường hợp tìm theo keyword
  searchParams?: {
    keyword?: string;
    ingredients?: string[];
    cuisine?: string;
    category?: string;
    tags?: string[];
  };
}

const SearchingRecipes: React.FC<SearchingRecipesProps> = ({
  ingredients,
  cuisine,
  category,
  tags,
  searchParams,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, loading, error } = useSelector(
    (state: RootState) => state.recipes
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // Memoize các dependencies để tránh re-render không cần thiết
  const ingredientsKey = useMemo(
    () => JSON.stringify(ingredients),
    [ingredients]
  );
  const tagsKey = useMemo(() => JSON.stringify(tags), [tags]);
  const searchParamsKey = useMemo(
    () => JSON.stringify(searchParams),
    [searchParams]
  );

  // Ref để track query đã dispatch, tránh dispatch trùng lặp
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    const currentQuery =
      searchParamsKey + ingredientsKey + cuisine + category + tagsKey;

    // Nếu query giống với lần trước, không dispatch nữa
    if (lastQueryRef.current === currentQuery) {
      console.log("SearchingRecipes - Query không thay đổi, skip dispatch");
      return;
    }

    console.log("SearchingRecipes useEffect triggered with:", {
      searchParams,
      ingredients,
      cuisine,
      category,
      tags,
    });

    lastQueryRef.current = currentQuery;

    if (searchParams?.keyword) {
      // tìm theo keyword
      console.log("Dispatching searchRecipesByKeyword");
      dispatch(
        searchRecipesByKeyword({
          keywords: searchParams.keyword,
          cuisine: searchParams.cuisine,
          category: searchParams.category,
          tags: searchParams.tags,
          top_k: 10,
        })
      );
    } else if (
      ingredients &&
      (ingredients.length > 0 ||
        cuisine ||
        category ||
        (tags && tags.length > 0))
    ) {
      // tìm theo ingredients
      console.log("Dispatching searchRecipes");
      dispatch(
        searchRecipes({
          ingredients,
          cuisine,
          category,
          tags,
          top_k: 10,
        })
      );
    }
  }, [
    dispatch,
    ingredientsKey,
    cuisine,
    category,
    tagsKey,
    searchParamsKey,
    searchParams,
    ingredients,
    tags,
  ]);

  // Check favorites for all recipes when user is logged in
  useEffect(() => {
    if (user && searchResults.length > 0) {
      const recipeIds = searchResults.map((recipe) => recipe._id);
      dispatch(checkMultipleRecipes({ recipeIds }));
    }
  }, [user, searchResults, dispatch]);

  console.log("SearchingRecipes - searchResults:", searchResults);
  console.log("SearchingRecipes - loading:", loading);
  console.log("SearchingRecipes - error:", error);

  return (
    <View className="py-6 px-4 bg-gray-50 pb-8">
      <View>
        {/* Section Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Kết quả tìm kiếm công thức
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Các công thức gợi ý dựa trên lựa chọn của bạn
          </Text>
        </View>

        {/* Loading / Error */}
        {loading && (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-500 mt-4 text-sm">Đang tìm kiếm...</Text>
          </View>
        )}

        {error && (
          <Text className="text-center text-red-500 text-sm">Lỗi: {error}</Text>
        )}

        {/* Recipe List */}
        {!loading && searchResults.length > 0 && (
          <View>
            {searchResults.map((recipe) => (
              <RecipeCard
                key={recipe._id}
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
            ))}
          </View>
        )}

        {/* No Results */}
        {!loading && searchResults.length === 0 && (
          <View className="py-12 items-center">
            <Text className="text-center text-gray-500 text-base">
              Không tìm thấy công thức phù hợp
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchingRecipes;
