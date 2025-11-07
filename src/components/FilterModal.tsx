import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchCategories,
  fetchTags,
  fetchCuisines,
} from "../redux/slices/recipeSlice";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterData) => void;
  initialFilters?: FilterData;
  colorScheme?: "orange" | "indigo";
}

export interface FilterData {
  selectedCategory: string;
  selectedTags: string[];
  selectedCuisine: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  colorScheme = "orange",
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux
  const { categories, tags, cuisines } = useSelector(
    (state: RootState) => state.recipes
  );

  // State for filters with initial values from props or defaults
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters?.selectedCategory || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialFilters?.selectedTags || []
  );
  const [selectedCuisine, setSelectedCuisine] = useState(
    initialFilters?.selectedCuisine || ""
  );

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCuisinePicker, setShowCuisinePicker] = useState(false);

  // Fetch data when component mounts if not already loaded
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
    if (cuisines.length === 0) {
      dispatch(fetchCuisines());
    }
  }, [dispatch, categories.length, tags.length, cuisines.length]);

  // Color scheme
  const colors = {
    orange: {
      primary: "#F97316",
      secondary: "#EA580C",
    },
    indigo: {
      primary: "#6366F1",
      secondary: "#4F46E5",
    },
  };

  const currentColors = colors[colorScheme];

  // Function to clear all filters
  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedTags([]);
    setSelectedCuisine("");

    // Notify parent component about cleared filters
    onApply({
      selectedCategory: "",
      selectedTags: [],
      selectedCuisine: "",
    });
    onClose();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = () => {
    onApply({
      selectedCategory,
      selectedTags,
      selectedCuisine,
    });
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="p-6 max-h-[80vh]">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Bộ lọc tìm kiếm
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-gray-100 rounded-full"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
              {/* Tags */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Tags
                </Text>
                <View className="max-h-[100px]">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    <View className="flex-row flex-wrap gap-2">
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <TouchableOpacity
                            key={tag._id}
                            onPress={() => handleTagToggle(tag.name)}
                            className={`px-4 py-2 rounded-full border ${
                              selectedTags.includes(tag.name)
                                ? "border-transparent"
                                : "border-gray-300 bg-white"
                            }`}
                            style={
                              selectedTags.includes(tag.name)
                                ? { backgroundColor: currentColors.primary }
                                : {}
                            }
                          >
                            <Text
                              className={`text-sm font-medium ${
                                selectedTags.includes(tag.name)
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              {tag.name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text className="text-sm text-gray-500">
                          Không có tags
                        </Text>
                      )}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Category */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Danh mục
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(true)}
                  className="border border-gray-300 rounded-xl bg-white px-4 py-3.5 flex-row items-center justify-between"
                >
                  <Text className={selectedCategory ? "text-gray-900" : "text-gray-500"}>
                    {selectedCategory || "Tất cả danh mục"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Cuisine */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Ẩm thực
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCuisinePicker(true)}
                  className="border border-gray-300 rounded-xl bg-white px-4 py-3.5 flex-row items-center justify-between"
                >
                  <Text className={selectedCuisine ? "text-gray-900" : "text-gray-500"}>
                    {selectedCuisine || "Tất cả ẩm thực"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Button Group */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClearFilters}
                className="flex-1 border border-gray-300 rounded-xl py-4 items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Xóa bộ lọc
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                className="flex-[2] rounded-xl py-4 items-center"
                style={{ backgroundColor: currentColors.primary }}
              >
                <Text className="text-white font-semibold text-base">
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowCategoryPicker(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl max-h-[60vh]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  Chọn danh mục
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory("");
                    setShowCategoryPicker(false);
                  }}
                  className="py-3 border-b border-gray-200"
                >
                  <Text className="text-base text-gray-900">
                    Tất cả danh mục
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    onPress={() => {
                      setSelectedCategory(cat.name);
                      setShowCategoryPicker(false);
                    }}
                    className="py-3 border-b border-gray-200"
                  >
                    <Text className="text-base text-gray-900">{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Cuisine Picker Modal */}
      <Modal
        visible={showCuisinePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCuisinePicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowCuisinePicker(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl max-h-[60vh]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">
                  Chọn ẩm thực
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCuisinePicker(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCuisine("");
                    setShowCuisinePicker(false);
                  }}
                  className="py-3 border-b border-gray-200"
                >
                  <Text className="text-base text-gray-900">
                    Tất cả ẩm thực
                  </Text>
                </TouchableOpacity>
                {cuisines.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine._id}
                    onPress={() => {
                      setSelectedCuisine(cuisine.name);
                      setShowCuisinePicker(false);
                    }}
                    className="py-3 border-b border-gray-200"
                  >
                    <Text className="text-base text-gray-900">
                      {cuisine.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
};

export default FilterModal;
