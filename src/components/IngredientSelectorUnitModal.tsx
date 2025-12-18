import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchIngredientTypes } from "../redux/slices/recipeSlice";

// Helper function to get default unit for ingredient
const getDefaultUnit = (ingredientName: string): string => {
    const name = ingredientName.toLowerCase();
    
    // Rau củ, trái cây -> gram hoặc kg
    if (name.includes("rau") || name.includes("củ") || name.includes("cà")) {
        return "gram";
    }
    
    // Thịt, cá -> gram hoặc kg
    if (name.includes("thịt") || name.includes("cá") || name.includes("tôm") || name.includes("mực")) {
        return "gram";
    }
    
    // Nước, dầu -> ml
    if (name.includes("nước") || name.includes("dầu") || name.includes("tương") || name.includes("giấm")) {
        return "ml";
    }
    
    // Bột, gạo -> gram
    if (name.includes("bột") || name.includes("gạo") || name.includes("mì")) {
        return "gram";
    }
    
    // Gia vị nhỏ -> muỗng canh
    if (name.includes("muối") || name.includes("đường") || name.includes("tiêu") || name.includes("bột ngọt")) {
        return "muỗng canh";
    }
    
    // Default
    return "gram";
};

// Helper to remove Vietnamese accents
const removeAccents = (str: string): string => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

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

    // Reset local state when modal opens
    useEffect(() => {
        if (visible) {
            setLocalSelectedIngredients([...selectedIngredients]);
            const defaultQuantities: Record<string, { quantity: number; unit: string }> = {};
            selectedIngredients.forEach((ingredient) => {
                defaultQuantities[ingredient] = existingIngredientDetails[ingredient] || {
                    quantity: 1,
                    unit: getDefaultUnit(ingredient),
                };
            });
            setIngredientQuantities(defaultQuantities);
        }
    }, [visible]);

    // Auto select first category
    useEffect(() => {
        if (ingredientTypes.length > 0 && !activeCategory) {
            setActiveCategory(ingredientTypes[0]._id);
        }
    }, [ingredientTypes, activeCategory]);

    const handleIngredientToggle = (ingredient: string) => {
        setLocalSelectedIngredients((prev) => {
            if (prev.includes(ingredient)) {
                const newQuantities = { ...ingredientQuantities };
                delete newQuantities[ingredient];
                setIngredientQuantities(newQuantities);
                return prev.filter((item) => item !== ingredient);
            } else {
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
        setLocalSelectedIngredients([...selectedIngredients]);
        setIngredientQuantities({});
        onClose();
    };

    // Group ingredients by type
    const groupedIngredients = useMemo(() => {
        const groups: Record<string, string[]> = {};
        ingredientTypes.forEach((type) => {
            groups[type._id] = ingredients
                .filter((ing) => ing.typeId === type._id)
                .map((ing) => ing.name);
        });
        return groups;
    }, [ingredients, ingredientTypes]);

    // Filter ingredients by search
    const getFilteredIngredients = () => {
        if (!searchTerm.trim()) {
            return activeCategory ? groupedIngredients[activeCategory] || [] : [];
        }

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
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                        <Text className="text-xl font-bold">Chọn nguyên liệu</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
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

                    <View className="flex-1 flex-row">
                        {/* Categories - hidden when searching */}
                        {!searchTerm && (
                            <ScrollView className="w-1/3 border-r border-gray-200 px-2">
                                {ingredientTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type._id}
                                        onPress={() => setActiveCategory(type._id)}
                                        className={`px-3 py-3 rounded-lg mb-1 ${
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
                                        className="border border-gray-200 rounded-xl p-3 mb-3"
                                    >
                                        {/* Checkbox and name */}
                                        <TouchableOpacity
                                            onPress={() => handleIngredientToggle(ingredient)}
                                            className="flex-row items-center mb-2"
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

                                        {/* Quantity and unit */}
                                        {localSelectedIngredients.includes(ingredient) && (
                                            <View className="flex-row items-center ml-8 mt-2">
                                                <TextInput
                                                    keyboardType="decimal-pad"
                                                    value={String(
                                                        ingredientQuantities[ingredient]?.quantity || 1
                                                    )}
                                                    onChangeText={(text) => {
                                                        const num = parseFloat(text) || 1;
                                                        handleQuantityChange(ingredient, num);
                                                    }}
                                                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                                                />
                                                <Text className="ml-2 text-sm text-gray-600 font-medium">
                                                    {ingredientQuantities[ingredient]?.unit ||
                                                        getDefaultUnit(ingredient)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-500 text-center pt-8">
                                    Không tìm thấy nguyên liệu nào
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Footer */}
                    <View className="p-4 border-t border-gray-200">
                        <View className="mb-3">
                            <Text className="text-sm text-gray-600 font-medium mb-2">
                                Đã chọn {localSelectedIngredients.length} nguyên liệu
                            </Text>
                            {localSelectedIngredients.length > 0 && (
                                <ScrollView className="max-h-16 bg-gray-50 rounded-lg p-2">
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
                            )}
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleClear}
                                disabled={localSelectedIngredients.length === 0}
                                className={`flex-1 py-3 border rounded-xl ${
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
                                className="flex-1 py-3 bg-orange-500 rounded-xl"
                            >
                                <Text className="text-center text-white font-bold">Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
