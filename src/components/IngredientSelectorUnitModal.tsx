import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchIngredientTypes } from "../redux/slices/recipeSlice";
import { getDefaultUnit } from "../utils/ingredientUnits";

// Helper to remove Vietnamese accents
const removeAccents = (str: string): string => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

// Helper to check if string has Vietnamese accents
const hasAccents = (str: string): boolean => {
    return /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i.test(str);
};

interface IngredientSelectorUnitModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (
        ingredients: string[],
        ingredientDetails: Record<string, { quantity: number; unit: string }>
    ) => void;
    selectedIngredients: string[];
    existingIngredientDetails?: Record<string, { quantity: number; unit: string }>;
}

export default function IngredientSelectorUnitModal({
    visible,
    onClose,
    onSelect,
    selectedIngredients = [],
    existingIngredientDetails = {},
}: IngredientSelectorUnitModalProps) {
    const dispatch = useAppDispatch();
    const { ingredients, ingredientTypes } = useAppSelector(
        (state) => state.recipes
    );

    const [localSelectedIngredients, setLocalSelectedIngredients] = useState<string[]>([]);
    const [ingredientQuantities, setIngredientQuantities] = useState<
        Record<string, { quantity: number; unit: string }>
    >({});
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Load data when modal opens
    useEffect(() => {
        if (visible) {
            dispatch(fetchIngredientTypes());
        }
    }, [visible, dispatch]);

    // Reset local state when modal opens - CHỈ khi modal mở
    useEffect(() => {
        if (visible) {
            setLocalSelectedIngredients([...selectedIngredients]);
            // Sử dụng existingIngredientDetails nếu có, nếu không thì dùng giá trị mặc định
            const defaultQuantities: Record<string, { quantity: number; unit: string }> = {};
            selectedIngredients.forEach((ingredient) => {
                defaultQuantities[ingredient] = existingIngredientDetails[ingredient] || {
                    quantity: 1,
                    unit: getDefaultUnit(ingredient),
                };
            });
            setIngredientQuantities(defaultQuantities);
        }
    }, [visible]); // CHỈ phụ thuộc vào visible

    // Auto chọn category đầu tiên
    useEffect(() => {
        if (ingredientTypes.length > 0 && !activeCategory) {
            setActiveCategory(ingredientTypes[0]._id);
        }
    }, [ingredientTypes, activeCategory]);

    const handleIngredientToggle = (ingredient: string) => {
        setLocalSelectedIngredients((prev) => {
            if (prev.includes(ingredient)) {
                // Xóa ingredient và quantity của nó
                const newQuantities = { ...ingredientQuantities };
                delete newQuantities[ingredient];
                setIngredientQuantities(newQuantities);
                return prev.filter((item) => item !== ingredient);
            } else {
                // Thêm ingredient và set quantity mặc định
                const defaultUnit = getDefaultUnit(ingredient);
                setIngredientQuantities((prev) => ({
                    ...prev,
                    [ingredient]: { quantity: 1, unit: defaultUnit },
                }));
                return [...prev, ingredient];
            }
        });
    };

    const handleQuantityChange = (ingredient: string, quantity: number) => {
        setIngredientQuantities((prev) => ({
            ...prev,
            [ingredient]: { ...prev[ingredient], quantity },
        }));
    };

    const handleApply = () => {
        onSelect(localSelectedIngredients, ingredientQuantities);
        onClose();
    };

    const handleClear = () => {
        setLocalSelectedIngredients([]);
        setIngredientQuantities({});
    };

    const handleClose = () => {
        // Reset về trạng thái ban đầu khi đóng mà không apply
        setLocalSelectedIngredients([...selectedIngredients]);
        setIngredientQuantities({});
        onClose();
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
                    const accentFreeWords = removeAccents(ingredient.toLowerCase()).split(/\s+/);
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
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl h-4/5">
                    {/* Header with close button */}
                    <View className="relative p-4 border-b border-gray-200">
                        <TouchableOpacity
                            onPress={handleClose}
                            className="absolute top-3 right-3 z-10"
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold">Chọn nguyên liệu</Text>
                    </View>

                    {/* Search bar */}
                    <View className="px-4 py-3">
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                placeholder="Tìm nguyên liệu..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                className="flex-1 ml-2 text-base"
                            />
                        </View>
                    </View>

                    {/* Main content area - flex-1 to fill remaining space */}
                    <View className="flex-1 flex-row">
                        {/* Categories - hidden when searching */}
                        {!searchTerm && (
                            <ScrollView className="w-1/3 border-r border-gray-200 px-2">
                                {ingredientTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type._id}
                                        onPress={() => setActiveCategory(type._id)}
                                        className={`px-3 py-2 rounded-lg mb-1 ${
                                            activeCategory === type._id
                                                ? "bg-orange-100"
                                                : "bg-transparent"
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm ${
                                                activeCategory === type._id
                                                    ? "text-orange-600 font-semibold"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Ingredients list */}
                        <ScrollView className={searchTerm ? "flex-1 px-4" : "w-2/3 px-4"}>
                            {getFilteredIngredients().length > 0 ? (
                                getFilteredIngredients().map((ingredient) => (
                                    <View
                                        key={ingredient}
                                        className="border border-gray-200 rounded-lg p-3 mb-3"
                                    >
                                        {/* Checkbox và tên nguyên liệu */}
                                        <TouchableOpacity
                                            onPress={() => handleIngredientToggle(ingredient)}
                                            className="flex-row items-center"
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
                                            <Text className="ml-2 font-medium text-gray-800">
                                                {ingredient}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Số lượng và đơn vị - hiển thị khi được chọn */}
                                        {localSelectedIngredients.includes(ingredient) && (
                                            <View className="flex-row items-center ml-7 mt-2 gap-2">
                                                <TextInput
                                                    keyboardType="decimal-pad"
                                                    value={String(
                                                        ingredientQuantities[ingredient]?.quantity || 1
                                                    )}
                                                    onChangeText={(text) => {
                                                        const num = parseFloat(text) || 1;
                                                        handleQuantityChange(ingredient, num);
                                                    }}
                                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white"
                                                />
                                                <Text className="text-sm text-gray-600 font-medium">
                                                    {ingredientQuantities[ingredient]?.unit ||
                                                        getDefaultUnit(ingredient)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-500 text-center pt-4">
                                    Không tìm thấy nguyên liệu nào
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Footer with selected details */}
                    <View className="p-4 border-t border-gray-200">
                        <View className="mb-3">
                            <Text className="text-sm text-gray-600 font-medium mb-2">
                                Đã chọn {localSelectedIngredients.length} nguyên liệu:
                            </Text>
                            {localSelectedIngredients.length > 0 ? (
                                <View className="bg-gray-50 rounded-lg p-3 max-h-20">
                                    <ScrollView>
                                        <Text className="text-sm text-gray-700">
                                            {localSelectedIngredients
                                                .map((ingredient) => {
                                                    const qty = ingredientQuantities[ingredient];
                                                    return `${ingredient} (${qty?.quantity || 1} ${
                                                        qty?.unit || getDefaultUnit(ingredient)
                                                    })`;
                                                })
                                                .join(", ")}
                                        </Text>
                                    </ScrollView>
                                </View>
                            ) : (
                                <Text className="text-gray-400 italic text-sm">
                                    Chưa có nguyên liệu nào được chọn
                                </Text>
                            )}
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleClear}
                                disabled={localSelectedIngredients.length === 0}
                                className={`flex-1 py-3 border rounded-lg ${
                                    localSelectedIngredients.length === 0
                                        ? "border-gray-200 bg-gray-50"
                                        : "border-gray-300 bg-white"
                                }`}
                            >
                                <Text
                                    className={`text-center font-semibold ${
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
                                className="flex-1 py-3 bg-orange-500 rounded-lg"
                            >
                                <Text className="text-center text-white font-bold">
                                    Áp dụng
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
