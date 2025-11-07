import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchIngredientTypes } from "../redux/slices/recipeSlice";

interface IngredientSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ingredients: string[]) => void;
  selectedIngredients: string[];
}

const IngredientSelectorModal: React.FC<IngredientSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIngredients = [],
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { ingredients, ingredientTypes } = useSelector(
    (state: RootState) => state.recipes
  );

  const [localSelectedIngredients, setLocalSelectedIngredients] = useState<
    string[]
  >(selectedIngredients);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load dữ liệu từ API khi mở modal
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchIngredientTypes());
    }
  }, [isOpen, dispatch]);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIngredients([...selectedIngredients]);
    }
  }, [isOpen, selectedIngredients]);

  // Auto chọn category đầu tiên
  useEffect(() => {
    if (ingredientTypes.length > 0 && !activeCategory) {
      setActiveCategory(ingredientTypes[0]._id);
    }
  }, [ingredientTypes, activeCategory]);

  const handleIngredientToggle = (ingredient: string) => {
    setLocalSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleApply = () => {
    onSelect(localSelectedIngredients);
    onClose();
  };

  const handleClear = () => {
    setLocalSelectedIngredients([]);
  };

  // Helper function to remove accents from Vietnamese text
  const removeAccents = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Helper function to check if a string has Vietnamese accents
  const hasAccents = (str: string): boolean => {
    return /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i.test(
      str
    );
  };

  // Nhóm ingredients theo type
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, string[]> = {};
    ingredientTypes.forEach((type) => {
      groups[type._id] = ingredients
        .filter((ing) => ing.typeId === type._id)
        .map((ing) => ing.name);
    });
    return groups;
  }, [ingredients, ingredientTypes]);

  // Filter ingredient theo search
  const getFilteredIngredients = () => {
    if (!searchTerm.trim()) {
      return activeCategory ? groupedIngredients[activeCategory] || [] : [];
    }

    // If searching, show matches from all categories
    const lowercaseSearch = searchTerm.toLowerCase().trim();
    const searchHasAccents = hasAccents(lowercaseSearch);
    const accentFreeSearch = removeAccents(lowercaseSearch);
    const results: string[] = [];

    Object.values(groupedIngredients).forEach((categoryIngredients) => {
      categoryIngredients.forEach((ingredient) => {
        if (searchHasAccents) {
          const words = ingredient.toLowerCase().split(/\s+/);
          if (
            words.some((w) => w.startsWith(lowercaseSearch)) ||
            ingredient.toLowerCase().startsWith(lowercaseSearch)
          ) {
            results.push(ingredient);
          }
        } else {
          const accentFreeWords = removeAccents(
            ingredient.toLowerCase()
          ).split(/\s+/);
          if (
            accentFreeWords.some((w) => w.startsWith(accentFreeSearch)) ||
            removeAccents(ingredient.toLowerCase()).startsWith(accentFreeSearch)
          ) {
            results.push(ingredient);
          }
        }
      });
    });

    return results;
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-white rounded-t-3xl h-[85vh]">
          <View className="p-6 flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                Chọn nguyên liệu
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-gray-100 rounded-full"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-4">
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 py-3 px-2 text-base"
                placeholder="Tìm nguyên liệu..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            <View className="flex-1 flex-row gap-3">
              {/* Category sidebar - hidden when searching */}
              {!searchTerm && (
                <ScrollView
                  className="w-1/3 border-r border-gray-200 pr-3"
                  showsVerticalScrollIndicator={false}
                >
                  {ingredientTypes.map((type) => (
                    <TouchableOpacity
                      key={type._id}
                      className={`px-3 py-2 rounded-lg mb-1 ${
                        activeCategory === type._id
                          ? "bg-orange-100"
                          : "bg-white"
                      }`}
                      onPress={() => setActiveCategory(type._id)}
                    >
                      <Text
                        className={`text-base ${
                          activeCategory === type._id
                            ? "text-orange-800 font-semibold"
                            : "text-gray-700"
                        }`}
                        numberOfLines={2}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Ingredients list */}
              <ScrollView
                className={`${searchTerm ? "flex-1" : "w-2/3"}`}
                showsVerticalScrollIndicator={false}
              >
                {getFilteredIngredients().length > 0 ? (
                  getFilteredIngredients().map((ingredient) => (
                    <TouchableOpacity
                      key={ingredient}
                      className="flex-row items-center py-3 px-2 hover:bg-gray-50 rounded-lg"
                      onPress={() => handleIngredientToggle(ingredient)}
                    >
                      <Ionicons
                        name={
                          localSelectedIngredients.includes(ingredient)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={24}
                        color={
                          localSelectedIngredients.includes(ingredient)
                            ? "#F97316"
                            : "#9CA3AF"
                        }
                      />
                      <Text className="ml-3 text-base text-gray-900">
                        {ingredient}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center pt-8">
                    Không tìm thấy nguyên liệu nào
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* Footer */}
            <View className="pt-4 border-t border-gray-200 mt-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-gray-600">
                  Đã chọn:{" "}
                  <Text className="font-semibold text-gray-900">
                    {localSelectedIngredients.length}
                  </Text>{" "}
                  nguyên liệu
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleClear}
                  disabled={localSelectedIngredients.length === 0}
                  className={`flex-1 border rounded-xl py-4 items-center ${
                    localSelectedIngredients.length === 0
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold text-base ${
                      localSelectedIngredients.length === 0
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    Xóa tất cả
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApply}
                  className="flex-[2] bg-orange-500 rounded-xl py-4 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Áp dụng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default IngredientSelectorModal;
