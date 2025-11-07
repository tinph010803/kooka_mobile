import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchIngredients } from "../redux/slices/recipeSlice";
import FilterModal, { FilterData } from "./FilterModal";
import IngredientSelectorModal from "./IngredientSelectorModal";

interface CombinedRecipeSearchProps {
  onSearch: (params: {
    keyword?: string;
    ingredients?: string[];
    cuisine?: string;
    category?: string;
    tags?: string[];
  } | null) => void;
}

interface Ingredient {
  _id: string;
  name: string;
}

const CombinedRecipeSearch: React.FC<CombinedRecipeSearchProps> = ({
  onSearch,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const ingredients = useSelector(
    (state: RootState) => state.recipes.ingredients
  );

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  const [searchMode, setSearchMode] = useState<"keyword" | "ingredient">(
    "keyword"
  );
  const [keyword, setKeyword] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filters, setFilters] = useState<FilterData>({
    selectedCategory: "",
    selectedTags: [],
    selectedCuisine: "",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);

  const removeAccents = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const hasAccents = (str: string): boolean => {
    return /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i.test(
      str
    );
  };

  const getFilteredSuggestions = () => {
    if (!ingredientSearchTerm.trim()) return [];
    const lowercaseSearch = ingredientSearchTerm.toLowerCase().trim();
    const accentFreeSearch = removeAccents(lowercaseSearch);
    const searchHasAccents = hasAccents(lowercaseSearch);

    return ingredients
      .map((i: Ingredient) => i.name)
      .filter((ingredient) => {
        if (searchHasAccents) {
          const ingredientWords = ingredient.toLowerCase().split(/\s+/);
          const matchesWithAccents = ingredientWords.some((word) =>
            word.startsWith(lowercaseSearch)
          );
          const wholeIngredientMatchesWithAccents = ingredient
            .toLowerCase()
            .startsWith(lowercaseSearch);
          return (
            (matchesWithAccents || wholeIngredientMatchesWithAccents) &&
            !selectedIngredients.includes(ingredient)
          );
        } else {
          const accentFreeWords = removeAccents(ingredient.toLowerCase()).split(
            /\s+/
          );
          const matchesWithoutAccents = accentFreeWords.some((word) =>
            word.startsWith(accentFreeSearch)
          );
          const wholeIngredientMatchesWithoutAccents = removeAccents(
            ingredient.toLowerCase()
          ).startsWith(accentFreeSearch);
          return (
            (matchesWithoutAccents || wholeIngredientMatchesWithoutAccents) &&
            !selectedIngredients.includes(ingredient)
          );
        }
      })
      .slice(0, 5);
  };

  const handleAddIngredient = (ingredient: string) => {
    if (ingredient && !selectedIngredients.includes(ingredient)) {
      setSelectedIngredients((prev) => [...prev, ingredient]);
      setIngredientSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((item) => item !== ingredient)
    );
  };

  const handleKeywordSearch = () => {
    if (keyword.trim()) {
      onSearch({
        keyword,
        cuisine: filters.selectedCuisine,
        category: filters.selectedCategory,
        tags: filters.selectedTags,
      });
    }
  };

  const handleIngredientSearch = () => {
    if (selectedIngredients.length > 0) {
      onSearch({
        ingredients: selectedIngredients,
        cuisine: filters.selectedCuisine,
        category: filters.selectedCategory,
        tags: filters.selectedTags,
      });
    }
  };

  const handleIngredientsSelected = (ingredients: string[]) => {
    setSelectedIngredients(ingredients);
    setIsIngredientModalOpen(false);
  };

  const getFilterCount = () => {
    return (
      (filters.selectedCategory ? 1 : 0) +
      filters.selectedTags.length +
      (filters.selectedCuisine ? 1 : 0)
    );
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <LinearGradient
      colors={["#FFF7ED", "#FFFFFF", "#EFF6FF"]}
      className="pt-6 pb-8 px-4"
    >
      <View className="max-w-7xl mx-auto">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            {searchMode === "keyword" ? (
              <>
                Gõ từ khóa, tìm ngay món ăn{"\n"}
                <Text className="text-indigo-500">bạn muốn nấu hôm nay</Text>
              </>
            ) : (
              <>
                Tìm công thức với nguyên liệu{"\n"}
                <Text className="text-orange-500">bạn đã có sẵn</Text>
              </>
            )}
          </Text>

          <Text className="text-sm text-gray-600 text-center px-4 leading-5">
            {searchMode === "keyword"
              ? 'Nhập từ khóa như "phở bò", "cà ri gà" hoặc "súp cua" để tìm công thức bạn cần'
              : "Không còn phải băn khoăn \"tôi có thể nấu gì?\" Nhập nguyên liệu của bạn và khám phá những công thức tuyệt vời"}
          </Text>
        </View>

        {/* Mode Toggle */}
        <View className="flex-row justify-center gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setSearchMode("keyword")}
            className={`px-5 py-2.5 rounded-lg ${
              searchMode === "keyword"
                ? "bg-indigo-500"
                : "bg-white border border-gray-300"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                searchMode === "keyword" ? "text-white" : "text-gray-700"
              }`}
            >
              Tìm theo tên món
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSearchMode("ingredient")}
            className={`px-5 py-2.5 rounded-lg ${
              searchMode === "ingredient"
                ? "bg-orange-500"
                : "bg-white border border-gray-300"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                searchMode === "ingredient" ? "text-white" : "text-gray-700"
              }`}
            >
              Tìm theo nguyên liệu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View className="bg-white rounded-xl shadow-lg p-4 mb-4">
          {searchMode === "keyword" ? (
            <View>
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3">
                  <Ionicons name="search" size={18} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-2.5 px-2 text-sm"
                    placeholder='Ví dụ: "phở bò", "cà ri gà"...'
                    value={keyword}
                    onChangeText={setKeyword}
                    onSubmitEditing={handleKeywordSearch}
                    returnKeyType="search"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleKeywordSearch}
                  className="bg-indigo-500 rounded-lg px-5 justify-center"
                >
                  <Text className="text-white font-semibold text-sm">Tìm</Text>
                </TouchableOpacity>
              </View>

              {/* Filter Button */}
              <TouchableOpacity
                onPress={() => setIsFilterOpen(true)}
                className="flex-row items-center justify-center py-2.5 border border-gray-300 rounded-lg"
              >
                <Ionicons name="options-outline" size={18} color="#6B7280" />
                <Text className="ml-2 text-sm text-gray-700 font-medium">
                  Bộ lọc
                  {getFilterCount() > 0 && ` (${getFilterCount()})`}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Ingredient Search Row */}
              <View className="flex-row gap-2 mb-3">
                {/* Search Input with Suggestions */}
                <View className="flex-1 relative">
                  <View className="flex-row items-center bg-gray-100 rounded-lg px-3">
                    <Ionicons name="search" size={18} color="#6B7280" />
                    <TextInput
                      className="flex-1 py-2.5 px-2 text-sm"
                      placeholder="Nhập nguyên liệu (trứng, cà chua...)"
                      value={ingredientSearchTerm}
                      onChangeText={(text) => {
                        setIngredientSearchTerm(text);
                        setShowSuggestions(text.trim().length > 0);
                      }}
                      onFocus={() =>
                        setShowSuggestions(ingredientSearchTerm.trim().length > 0)
                      }
                    />
                  </View>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48">
                      {filteredSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleAddIngredient(suggestion)}
                          className="flex-row items-center px-3 py-2.5 border-b border-gray-100"
                        >
                          <Ionicons name="add" size={16} color="#F97316" />
                          <Text className="ml-2 text-sm text-gray-700">
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  onPress={() => setIsIngredientModalOpen(true)}
                  className="bg-orange-500 rounded-lg px-4 justify-center"
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>

                {/* Filter Button */}
                <TouchableOpacity
                  onPress={() => setIsFilterOpen(true)}
                  className="bg-white border border-gray-300 rounded-lg px-4 justify-center relative"
                >
                  <Ionicons name="options-outline" size={18} color="#6B7280" />
                  {getFilterCount() > 0 && (
                    <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-4 h-4 items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">
                        {getFilterCount()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Selected Ingredients */}
              {selectedIngredients.length > 0 && (
                <View className="mb-3">
                  <Text className="text-xs text-gray-700 font-semibold mb-2">
                    Nguyên liệu của tôi:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedIngredients.map((ingredient, index) => (
                      <View
                        key={index}
                        className="rounded-full px-3 py-1.5 flex-row items-center"
                        style={{ backgroundColor: "#FED7AA" }}
                      >
                        <Text className="text-orange-800 text-xs mr-1.5">
                          {ingredient}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveIngredient(ingredient)}
                        >
                          <Ionicons name="close" size={16} color="#C2410C" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Popular Ingredients when no selection */}
              {selectedIngredients.length === 0 && (
                <View>
                  <Text className="text-xs text-gray-700 font-semibold mb-2">
                    Nguyên liệu phổ biến:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ingredients.slice(0, 8).map((ingredient) => (
                      <TouchableOpacity
                        key={ingredient._id}
                        onPress={() => handleAddIngredient(ingredient.name)}
                        className="bg-gray-100 px-3 py-1.5 rounded-full"
                      >
                        <Text className="text-gray-700 text-xs">
                          {ingredient.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Search Button for Ingredient Mode */}
        {searchMode === "ingredient" && selectedIngredients.length > 0 && (
          <TouchableOpacity
            onPress={handleIngredientSearch}
            className="rounded-xl py-3.5 flex-row items-center justify-center shadow-lg"
            style={{
              backgroundColor: "#10B981",
            }}
          >
            <Ionicons name="search" size={18} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Tìm công thức ({selectedIngredients.length} nguyên liệu)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterOpen(false);
        }}
        initialFilters={filters}
        colorScheme={searchMode === "keyword" ? "indigo" : "orange"}
      />

      <IngredientSelectorModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSelect={handleIngredientsSelected}
        selectedIngredients={selectedIngredients}
      />
    </LinearGradient>
  );
};

export default CombinedRecipeSearch;
