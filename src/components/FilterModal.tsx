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
  selectedCategoryName: string;
  selectedTags: string[];
  selectedTagNames: string[];
  selectedCuisine: string;
  selectedCuisineName: string;
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
  const [selectedCategoryName, setSelectedCategoryName] = useState(
    initialFilters?.selectedCategoryName || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialFilters?.selectedTags || []
  );
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    initialFilters?.selectedTagNames || []
  );
  const [selectedCuisine, setSelectedCuisine] = useState(
    initialFilters?.selectedCuisine || ""
  );
  const [selectedCuisineName, setSelectedCuisineName] = useState(
    initialFilters?.selectedCuisineName || ""
  );

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCuisinePicker, setShowCuisinePicker] = useState(false);

  // Fetch data when modal opens to always get fresh data
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories());
      dispatch(fetchTags());
      dispatch(fetchCuisines());
    }
  }, [isOpen, dispatch]);

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
    setSelectedCategoryName("");
    setSelectedTags([]);
    setSelectedTagNames([]);
    setSelectedCuisine("");
    setSelectedCuisineName("");

    // Notify parent component about cleared filters
    onApply({
      selectedCategory: "",
      selectedCategoryName: "",
      selectedTags: [],
      selectedTagNames: [],
      selectedCuisine: "",
      selectedCuisineName: "",
    });
    onClose();
  };

  const handleTagToggle = (tagId: string, tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
    setSelectedTagNames((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleApply = () => {
    onApply({
      selectedCategory,
      selectedCategoryName,
      selectedTags,
      selectedTagNames,
      selectedCuisine,
      selectedCuisineName,
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
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
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

            <ScrollView 
              className="max-h-[65vh]"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {/* Tags */}
              <View className="mb-5">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Tags
                </Text>
                <View className="min-h-[120px] max-h-[180px] rounded-xl p-3 border-gray-200">
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    persistentScrollbar={true}
                  >
                    <View className="flex-row flex-wrap gap-2.5">
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <TouchableOpacity
                            key={tag._id}
                            onPress={() => handleTagToggle(tag._id, tag.name)}
                            className={`px-4 py-2.5 rounded-full border ${
                              selectedTags.includes(tag._id)
                                ? "border-transparent"
                                : "border-gray-300 bg-white"
                            }`}
                            style={
                              selectedTags.includes(tag._id)
                                ? { backgroundColor: currentColors.primary }
                                : {}
                            }
                          >
                            <Text
                              className={`text-sm font-medium ${
                                selectedTags.includes(tag._id)
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
              <View className="mb-5">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Danh mục
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(true)}
                  className="border border-gray-300 rounded-xl bg-white px-4 py-4 flex-row items-center justify-between shadow-sm"
                >
                  <Text className={selectedCategory ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {selectedCategory 
                      ? categories.find(c => c._id === selectedCategory)?.name || "Tất cả danh mục"
                      : "Tất cả danh mục"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Cuisine */}
              <View className="mb-2">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Ẩm thực
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCuisinePicker(true)}
                  className="border border-gray-300 rounded-xl bg-white px-4 py-4 flex-row items-center justify-between shadow-sm"
                >
                  <Text className={selectedCuisine ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {selectedCuisine 
                      ? cuisines.find(c => c._id === selectedCuisine)?.name || "Tất cả ẩm thực"
                      : "Tất cả ẩm thực"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Button Group */}
            <View className="flex-row gap-3 mt-5 pt-4 border-gray-200">
              <TouchableOpacity
                onPress={handleClearFilters}
                className="flex-1 border-2 border-gray-300 rounded-xl py-3.5 items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Xóa bộ lọc
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                className="flex-[2] rounded-xl py-3.5 items-center shadow-md"
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
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowCategoryPicker(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-gray-900">
                  Chọn danh mục
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView 
                className="max-h-[50vh]"
                showsVerticalScrollIndicator={true}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory("");
                    setSelectedCategoryName("");
                    setShowCategoryPicker(false);
                  }}
                  className={`py-4 px-3 rounded-lg mb-2 ${
                    selectedCategory === "" ? "bg-orange-50" : "bg-white"
                  }`}
                  style={selectedCategory === "" ? { borderWidth: 1, borderColor: currentColors.primary } : {}}
                >
                  <Text className={`text-base ${
                    selectedCategory === "" ? "font-semibold" : "font-normal"
                  }`} style={selectedCategory === "" ? { color: currentColors.primary } : { color: "#111827" }}>
                    Tất cả danh mục
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    onPress={() => {
                      setSelectedCategory(cat._id);
                      setSelectedCategoryName(cat.name);
                      setShowCategoryPicker(false);
                    }}
                    className={`py-4 px-3 rounded-lg mb-2 ${
                      selectedCategory === cat._id ? "bg-orange-50" : "bg-white"
                    }`}
                    style={selectedCategory === cat._id ? { borderWidth: 1, borderColor: currentColors.primary } : {}}
                  >
                    <Text className={`text-base ${
                      selectedCategory === cat._id ? "font-semibold" : "font-normal"
                    }`} style={selectedCategory === cat._id ? { color: currentColors.primary } : { color: "#111827" }}>
                      {cat.name}
                    </Text>
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
        animationType="slide"
        onRequestClose={() => setShowCuisinePicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowCuisinePicker(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-gray-900">
                  Chọn ẩm thực
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCuisinePicker(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView 
                className="max-h-[50vh]"
                showsVerticalScrollIndicator={true}
              >
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCuisine("");
                    setSelectedCuisineName("");
                    setShowCuisinePicker(false);
                  }}
                  className={`py-4 px-3 rounded-lg mb-2 ${
                    selectedCuisine === "" ? "bg-orange-50" : "bg-white"
                  }`}
                  style={selectedCuisine === "" ? { borderWidth: 1, borderColor: currentColors.primary } : {}}
                >
                  <Text className={`text-base ${
                    selectedCuisine === "" ? "font-semibold" : "font-normal"
                  }`} style={selectedCuisine === "" ? { color: currentColors.primary } : { color: "#111827" }}>
                    Tất cả ẩm thực
                  </Text>
                </TouchableOpacity>
                {cuisines.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine._id}
                    onPress={() => {
                      setSelectedCuisine(cuisine._id);
                      setSelectedCuisineName(cuisine.name);
                      setShowCuisinePicker(false);
                    }}
                    className={`py-4 px-3 rounded-lg mb-2 ${
                      selectedCuisine === cuisine._id ? "bg-orange-50" : "bg-white"
                    }`}
                    style={selectedCuisine === cuisine._id ? { borderWidth: 1, borderColor: currentColors.primary } : {}}
                  >
                    <Text className={`text-base ${
                      selectedCuisine === cuisine._id ? "font-semibold" : "font-normal"
                    }`} style={selectedCuisine === cuisine._id ? { color: currentColors.primary } : { color: "#111827" }}>
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
