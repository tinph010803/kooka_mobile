import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchNewestRecipes,
  fetchPopularRecipes,
  fetchRecipes,
  fetchTags,
  fetchCuisines,
  fetchCategories,
} from "../redux/slices/recipeSlice";
import type { Recipe as ReduxRecipe } from "../redux/slices/recipeSlice";
import FilterModal, { type FilterData } from "../components/FilterModal";

const { width } = Dimensions.get("window");

type AllRecipesPageRouteProp = RouteProp<
  {
    AllRecipes: {
      type: "new" | "popular" | "all";
      categoryId?: string;
      categoryName?: string;
    };
  },
  "AllRecipes"
>;

interface Recipe {
  id: string;
  title: string;
  image: string;
  duration: string;
  difficulty: string;
  rating?: number;
  reviews?: number;
  servings?: number;
  cuisine?: string;
  ingredients?: string[];
}

const AllRecipesPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AllRecipesPageRouteProp>();
  const { type, categoryId, categoryName } = route.params || { type: "all" };

  const dispatch = useAppDispatch();
  const {
    newestRecipes,
    popularRecipes,
    recipes: allRecipes,
    loading,
    categories,
  } = useAppSelector((state) => state.recipes);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initialize filters with category from navigation params if available
  const [filters, setFilters] = useState<FilterData>({
    selectedCategory: categoryId || "",
    selectedTags: [],
    selectedCuisine: "",
  });

  const isNewRecipes = type === "new";
  const isAllRecipes = type === "all";

  const recipes = isAllRecipes ? allRecipes : isNewRecipes ? newestRecipes : popularRecipes;

  // Fetch filter options
  useEffect(() => {
    dispatch(fetchTags());
    dispatch(fetchCuisines());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto-select category when navigating from footer
  useEffect(() => {
    if (categoryName && categories.length > 0) {
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (matchedCategory && matchedCategory._id !== filters.selectedCategory) {
        setFilters((prev) => ({
          ...prev,
          selectedCategory: matchedCategory._id,
        }));
      }
    }
  }, [categoryName, categories]);

  useEffect(() => {
    // Fetch recipes based on type - chỉ fetch khi chưa có data
    if (isAllRecipes && allRecipes.length === 0) {
      dispatch(fetchRecipes());
    } else if (isNewRecipes && newestRecipes.length === 0) {
      dispatch(fetchNewestRecipes());
    } else if (!isNewRecipes && !isAllRecipes && popularRecipes.length === 0) {
      dispatch(fetchPopularRecipes());
    }
  }, [dispatch, isNewRecipes, isAllRecipes, allRecipes.length, newestRecipes.length, popularRecipes.length]);



  const convertRecipes = (reduxRecipes: ReduxRecipe[]): Recipe[] => {
    return reduxRecipes.map((recipe) => ({
      id: recipe._id,
      title: recipe.name,
      image: recipe.image,
      duration: `${recipe.time} phút`,
      difficulty: recipe.difficulty,
      rating: recipe.rate,
      reviews: recipe.numberOfRate,
      servings: recipe.size,
      cuisine: recipe.cuisine.name,
      ingredients: recipe.ingredients.map((ing) => ing.name),
    }));
  };

  // Apply filters before converting
  const filteredReduxRecipes = recipes.filter((recipe) => {
    // Check category match
    const matchesCategory =
      !filters.selectedCategory || recipe.category._id === filters.selectedCategory;

    // Check cuisine match
    const matchesCuisine =
      !filters.selectedCuisine || recipe.cuisine._id === filters.selectedCuisine;

    // Check tags match - món ăn phải có TẤT CẢ tags được chọn
    const matchesTags =
      filters.selectedTags.length === 0 ||
      filters.selectedTags.every((tagId) => recipe.tags.some((tag) => tag._id === tagId));

    return matchesCategory && matchesCuisine && matchesTags;
  });

  const filteredRecipes = convertRecipes(filteredReduxRecipes);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedRecipes = filteredRecipes.slice(startIndex, endIndex);

  // Reset to page 1 when type or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [type, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getFilterCount = () => {
    return (
      (filters.selectedCategory ? 1 : 0) +
      filters.selectedTags.length +
      (filters.selectedCuisine ? 1 : 0)
    );
  };

  // Dynamic configuration based on type
  const config = isAllRecipes
    ? {
        iconName: "restaurant" as const,
        iconColor: "#2563EB",
        title: "Tất Cả Món Ăn",
        description: "Khám phá toàn bộ kho công thức nấu ăn phong phú của chúng tôi",
        gradientColors: ["#EFF6FF", "#E0E7FF", "#EFF6FF"],
        buttonColor: "#2563EB",
      }
    : isNewRecipes
      ? {
          iconName: "sparkles" as const,
          iconColor: "#F97316",
          title: "Món Ăn Mới",
          description: "Khám phá các công thức nấu ăn mới nhất được cập nhật liên tục",
          gradientColors: ["#FFEDD5", "#FEF3C7", "#FFEDD5"],
          buttonColor: "#F97316",
        }
      : {
          iconName: "trending-up" as const,
          iconColor: "#DB2777",
          title: "Món Ăn Phổ Biến",
          description: "Khám phá các món ăn được yêu thích nhất bởi cộng đồng",
          gradientColors: ["#FCE7F3", "#F3E8FF", "#FCE7F3"],
          buttonColor: "#DB2777",
        };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        style={{ width: (width - 48) / 2 }}
        activeOpacity={0.7}
        onPress={() => (navigation as any).navigate("RecipeDetail", { id: recipe.id })}
      >
        {/* Image */}
        <View className="relative">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-32"
            resizeMode="cover"
          />

          {/* Rating Badge */}
          <View className="absolute top-2 left-2 flex-row items-center bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text className="ml-1 text-xs font-bold text-gray-900">
              {recipe.rating?.toFixed(1) || "0.0"}
            </Text>
          </View>

          {/* Difficulty Badge */}
          <View
            className="absolute top-2 right-2 px-2 py-1 rounded-lg"
            style={{
              backgroundColor:
                recipe.difficulty === "Dễ"
                  ? "#D1FAE5"
                  : recipe.difficulty === "Khó"
                    ? "#FEE2E2"
                    : "#FEF3C7",
            }}
          >
            <Text
              className="text-[10px] font-semibold"
              style={{
                color:
                  recipe.difficulty === "Dễ"
                    ? "#065F46"
                    : recipe.difficulty === "Khó"
                      ? "#991B1B"
                      : "#92400E",
              }}
            >
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-3">
          <Text className="text-sm font-bold text-gray-900 mb-2" numberOfLines={1} ellipsizeMode="tail">
            {recipe.title}
          </Text>

          {/* Meta Info */}
          <View className="flex-row items-center flex-wrap mb-2">
            <View className="flex-row items-center mr-2">
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-600">{recipe.duration}</Text>
            </View>
            <View className="flex-row items-center mr-2">
              <Ionicons name="people-outline" size={12} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-600">{recipe.servings}</Text>
            </View>
            {/* Cuisine - Quốc gia */}
            {recipe.cuisine && (
              <View className="flex-row items-center">
                <Text className="ml-1 text-xs text-gray-600" numberOfLines={1}>
                  {recipe.cuisine}
                </Text>
              </View>
            )}
          </View>

          {/* Reviews */}
          <Text className="text-xs text-gray-600">
            {recipe.reviews ? `${recipe.reviews} đánh giá` : "0 đánh giá"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Ionicons name={config.iconName} size={24} color={config.iconColor} />
            <Text className="ml-2 text-xl font-bold text-gray-900">{config.title}</Text>
          </View>
          <Text className="text-xs text-gray-600" numberOfLines={1}>
            {config.description}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {loading && recipes.length === 0 ? (
          // Loading skeleton - 2 columns
          <View className="flex-row flex-wrap justify-between">
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4"
                style={{ width: (width - 48) / 2 }}
              >
                <View className="h-32 bg-gray-200" />
                <View className="p-3">
                  <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <View className="flex-row mb-2">
                    <View className="h-3 bg-gray-200 rounded w-16 mr-2" />
                    <View className="h-3 bg-gray-200 rounded w-12" />
                  </View>
                  <View className="h-3 bg-gray-200 rounded w-20" />
                </View>
              </View>
            ))}
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name={config.iconName} size={64} color="#D1D5DB" />
            <Text className="text-xl font-bold text-gray-900 mb-2 mt-4">
              {getFilterCount() > 0
                ? "Không tìm thấy món ăn phù hợp"
                : `Chưa có ${config.title.toLowerCase()}`}
            </Text>
            <Text className="text-gray-600 text-center px-4">
              {getFilterCount() > 0
                ? "Thử thay đổi bộ lọc để xem thêm món ăn"
                : "Hãy quay lại sau để khám phá các công thức mới nhất!"}
            </Text>
          </View>
        ) : (
          <>
            {/* Filter Bar */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs text-gray-600">
                Hiển thị{" "}
                <Text className="font-semibold">
                  {startIndex + 1}-{Math.min(endIndex, filteredRecipes.length)}
                </Text>{" "}
                trong tổng số <Text className="font-semibold">{filteredRecipes.length}</Text> món ăn
              </Text>

              <TouchableOpacity
                onPress={() => setIsFilterOpen(true)}
                className={`px-4 py-2 border rounded-lg flex-row items-center relative ${
                  getFilterCount() > 0
                    ? "bg-orange-500 border-orange-500"
                    : "bg-white border-gray-300"
                }`}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="filter"
                  size={16}
                  color={getFilterCount() > 0 ? "#FFFFFF" : "#374151"}
                />
                <Text
                  className={`ml-2 font-semibold text-sm ${
                    getFilterCount() > 0 ? "text-white" : "text-gray-700"
                  }`}
                >
                  Bộ lọc
                </Text>
                {getFilterCount() > 0 && (
                  <View className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">{getFilterCount()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Recipe Grid - 2 columns */}
            <View className="flex-row flex-wrap justify-between">
              {displayedRecipes.map((recipe) => (
                <View key={recipe.id} className="mb-4">
                  <RecipeCard recipe={recipe} />
                </View>
              ))}
            </View>

            {/* Pagination */}
            {totalPages > 1 && (
              <View className="flex-row items-center justify-center py-6">
                {/* Previous Button */}
                <TouchableOpacity
                  onPress={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-full ${
                    currentPage === 1 ? "bg-gray-200" : "bg-orange-500"
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentPage === 1 ? "#9CA3AF" : "#FFFFFF"}
                  />
                </TouchableOpacity>

                {/* Page Info */}
                <View className="flex-row items-center bg-orange-500 rounded-full px-6 py-3 mx-4">
                  <Text className="text-white font-semibold mr-2">Trang</Text>
                  <TextInput
                    value={currentPage.toString()}
                    onChangeText={(text) => {
                      const page = parseInt(text);
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    keyboardType="number-pad"
                    className="w-12 bg-orange-600 text-white text-center rounded px-2 py-1.5 font-semibold"
                    maxLength={totalPages.toString().length}
                  />
                  <Text className="text-white font-medium ml-2">/ {totalPages}</Text>
                </View>

                {/* Next Button */}
                <TouchableOpacity
                  onPress={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-full ${
                    currentPage === totalPages ? "bg-gray-200" : "bg-orange-500"
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentPage === totalPages ? "#9CA3AF" : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterOpen(false);
        }}
        initialFilters={filters}
        colorScheme="orange"
      />
    </SafeAreaView>
  );
};

export default AllRecipesPage;
