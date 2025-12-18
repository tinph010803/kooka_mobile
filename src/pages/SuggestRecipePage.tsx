import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    fetchCategories,
    fetchCuisines,
    fetchIngredients,
    fetchTags,
    type Instruction,
} from "../redux/slices/recipeSlice";
import { createSubmission } from "../redux/slices/submissionSlice";
import IngredientSelectorUnitModal from "../components/IngredientSelectorUnitModal";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

interface IngredientWithDetails {
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
}

export default function SuggestRecipePage() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { categories, cuisines, ingredients, tags } = useAppSelector(
        (state) => state.recipes
    );

    const [isIngredientSelectorOpen, setIsIngredientSelectorOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [recipe, setRecipe] = useState({
        name: "",
        ingredients: [] as string[],
        ingredientsWithDetails: [] as IngredientWithDetails[],
        tags: [] as string[],
        short: "",
        instructions: [] as Instruction[],
        image: "",
        video: "",
        calories: 1,
        time: 1,
        size: 1,
        difficulty: "",
        cuisine: "",
        category: "",
    });

    const [currentInstruction, setCurrentInstruction] = useState<Instruction>({
        title: "",
        images: [],
        subTitle: [""],
    });

    const [showTagPicker, setShowTagPicker] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchCuisines());
        dispatch(fetchIngredients());
        dispatch(fetchTags());
    }, [dispatch]);

    const handleInputChange = (name: string, value: string | number) => {
        setRecipe((prev) => ({
            ...prev,
            [name]: ["calories", "time", "size"].includes(name) ? Number(value) : value,
        }));
    };

    const handleSubtitleChange = (index: number, value: string) => {
        const updated = [...currentInstruction.subTitle];
        updated[index] = value;
        setCurrentInstruction({ ...currentInstruction, subTitle: updated });
    };

    const addSubtitle = () =>
        setCurrentInstruction((prev) => ({
            ...prev,
            subTitle: [...prev.subTitle, ""],
        }));

    const removeSubtitle = (index: number) =>
        setCurrentInstruction((prev) => ({
            ...prev,
            subTitle: prev.subTitle.filter((_, i) => i !== index),
        }));

    const addInstruction = () => {
        if (
            currentInstruction.title &&
            currentInstruction.subTitle.some((s) => s.trim() !== "")
        ) {
            setRecipe((prev) => ({
                ...prev,
                instructions: [...prev.instructions, { ...currentInstruction }],
            }));
            setCurrentInstruction({ title: "", images: [], subTitle: [""] });
            Toast.show({
                type: "success",
                text1: "✅ Đã thêm hướng dẫn",
                position: "top",
            });
        }
    };

    const removeInstruction = (index: number) =>
        setRecipe((prev) => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== index),
        }));

    const handleIngredientSelect = (
        selectedIngredients: string[],
        ingredientDetails: Record<string, { quantity: number; unit: string }>
    ) => {
        const ingredientIds: string[] = [];
        const ingredientsWithDetails: IngredientWithDetails[] = [];

        selectedIngredients.forEach((ingredientName) => {
            const ingredient = ingredients.find((ing) => ing.name === ingredientName);
            if (ingredient) {
                ingredientIds.push(ingredient._id);
                ingredientsWithDetails.push({
                    ingredientId: ingredient._id,
                    name: ingredient.name,
                    quantity: ingredientDetails[ingredientName]?.quantity || 1,
                    unit: ingredientDetails[ingredientName]?.unit || "gram",
                });
            }
        });

        setRecipe((prev) => ({
            ...prev,
            ingredients: ingredientIds,
            ingredientsWithDetails: ingredientsWithDetails,
        }));
    };

    const handleTagToggle = (tagId: string) => {
        setRecipe((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter((t) => t !== tagId)
                : [...prev.tags, tagId],
        }));
    };

    const pickImage = async (forInstruction: boolean = false) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            try {
                // ✅ ĐÚNG - Convert sang base64
                const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                    encoding: 'base64',
                });
                
                const imageData = `data:image/jpeg;base64,${base64}`;
                
                if (forInstruction) {
                    if (currentInstruction.images.length < 4) {
                        setCurrentInstruction((prev) => ({
                            ...prev,
                            images: [...prev.images, imageData],
                        }));
                    }
                } else {
                    setRecipe((prev) => ({ ...prev, image: imageData }));
                }
            } catch (error) {
                console.error("Error converting image to base64:", error);
                Toast.show({
                    type: "error",
                    text1: "❌ Lỗi",
                    text2: "Không thể xử lý ảnh",
                    position: "top",
                });
            }
        }
    };

    const removeInstructionImage = (index: number) => {
        setCurrentInstruction((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (!recipe.name.trim()) {
                Toast.show({
                    type: "error",
                    text1: "⚠️ Thiếu thông tin",
                    text2: "Vui lòng nhập tên món ăn",
                });
                return;
            }
            if (!recipe.category || !recipe.cuisine || !recipe.difficulty) {
                Toast.show({
                    type: "error",
                    text1: "⚠️ Thiếu thông tin",
                    text2: "Vui lòng chọn đầy đủ thông tin phân loại",
                });
                return;
            }
            if (recipe.ingredients.length === 0) {
                Toast.show({
                    type: "error",
                    text1: "⚠️ Thiếu nguyên liệu",
                    text2: "Vui lòng chọn ít nhất 1 nguyên liệu",
                });
                return;
            }
            if (recipe.instructions.length === 0) {
                Toast.show({
                    type: "error",
                    text1: "⚠️ Thiếu hướng dẫn",
                    text2: "Vui lòng thêm ít nhất 1 hướng dẫn",
                });
                return;
            }

            const transformedIngredients = recipe.ingredientsWithDetails.map((detail) => ({
                id: detail.ingredientId,
                quantity: detail.quantity,
                unit: detail.unit,
            }));

            const submissionData = {
                name: recipe.name,
                short: recipe.short,
                difficulty: recipe.difficulty,
                time: recipe.time,
                size: recipe.size,
                calories: recipe.calories,
                image: recipe.image,
                video: recipe.video || undefined,
                ingredients: recipe.ingredients,
                tags: recipe.tags,
                cuisine: recipe.cuisine,
                category: recipe.category,
                ingredientsWithDetails: transformedIngredients,
                instructions: recipe.instructions,
            };

            await dispatch(createSubmission(submissionData)).unwrap();
            Toast.show({
                type: "success",
                text1: "🎉 Gửi đề xuất thành công!",
                text2: "Chúng tôi sẽ xem xét và phê duyệt sớm",
                position: "top",
                visibilityTime: 4000,
            });

            setTimeout(() => {
                // @ts-ignore
                navigation.navigate("MySubmissions");
            }, 1500);
        } catch (error: any) {
            const errorMessage = error?.message || error || "Gửi đề xuất thất bại";
            Toast.show({
                type: "error",
                text1: "❌ Lỗi",
                text2: errorMessage,
                position: "top",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-gray-50"
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="bg-gradient-to-r from-orange-400 to-red-500 pt-12 pb-6 px-4">
                    <View className="flex-row items-center mb-2">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-white flex-1">
                            Đề Xuất Món Ăn
                        </Text>
                    </View>
                    <Text className="text-white/90 text-sm ml-9">
                        Chia sẻ công thức món ăn yêu thích của bạn
                    </Text>
                </View>

                <View className="p-4 space-y-4">
                    {/* Basic Info */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Thông tin cơ bản
                        </Text>
                        <TextInput
                            placeholder="Tên món ăn *"
                            value={recipe.name}
                            onChangeText={(text) => handleInputChange("name", text)}
                            className="border border-gray-300 rounded-xl p-3 mb-3"
                        />
                        <TextInput
                            placeholder="Mô tả ngắn *"
                            value={recipe.short}
                            onChangeText={(text) => handleInputChange("short", text)}
                            multiline
                            numberOfLines={3}
                            className="border border-gray-300 rounded-xl p-3 mb-3"
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Image */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Hình ảnh minh họa
                        </Text>
                        {recipe.image ? (
                            <View className="relative">
                                <Image
                                    source={{ uri: recipe.image }}
                                    className="w-full h-48 rounded-xl"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => setRecipe((prev) => ({ ...prev, image: "" }))}
                                    className="absolute top-2 right-2 bg-white/90 rounded-full p-2"
                                >
                                    <Ionicons name="close" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                            >
                                <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-600 mt-2">Chọn ảnh</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Numbers */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Thông số</Text>
                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1">
                                <Text className="text-sm text-gray-600 mb-1">Calories</Text>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={String(recipe.calories)}
                                    onChangeText={(text) => handleInputChange("calories", text)}
                                    className="border border-gray-300 rounded-xl p-3"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-gray-600 mb-1">Thời gian (phút)</Text>
                                <TextInput
                                    keyboardType="number-pad"
                                    value={String(recipe.time)}
                                    onChangeText={(text) => handleInputChange("time", text)}
                                    className="border border-gray-300 rounded-xl p-3"
                                />
                            </View>
                        </View>
                        <View>
                            <Text className="text-sm text-gray-600 mb-1">Khẩu phần</Text>
                            <TextInput
                                keyboardType="number-pad"
                                value={String(recipe.size)}
                                onChangeText={(text) => handleInputChange("size", text)}
                                className="border border-gray-300 rounded-xl p-3"
                            />
                        </View>
                    </View>

                    {/* Classification */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Phân loại</Text>

                        {/* Difficulty */}
                        <Text className="text-sm text-gray-600 mb-1">Độ khó *</Text>
                        <View className="flex-row gap-2 mb-3">
                            {["Dễ", "Trung bình", "Khó"].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => handleInputChange("difficulty", level)}
                                    className={`flex-1 py-3 rounded-xl border ${
                                        recipe.difficulty === level
                                            ? "bg-orange-100 border-orange-500"
                                            : "bg-white border-gray-300"
                                    }`}
                                >
                                    <Text
                                        className={`text-center font-semibold ${
                                            recipe.difficulty === level
                                                ? "text-orange-600"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Category */}
                        <Text className="text-sm text-gray-600 mb-1">Danh mục *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat._id}
                                    onPress={() => handleInputChange("category", cat._id)}
                                    className={`mr-2 px-4 py-2 rounded-xl ${
                                        recipe.category === cat._id
                                            ? "bg-orange-500"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    <Text
                                        className={`font-medium ${
                                            recipe.category === cat._id
                                                ? "text-white"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Cuisine */}
                        <Text className="text-sm text-gray-600 mb-1">Ẩm thực *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {cuisines.map((cui) => (
                                <TouchableOpacity
                                    key={cui._id}
                                    onPress={() => handleInputChange("cuisine", cui._id)}
                                    className={`mr-2 px-4 py-2 rounded-xl ${
                                        recipe.cuisine === cui._id
                                            ? "bg-orange-500"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    <Text
                                        className={`font-medium ${
                                            recipe.cuisine === cui._id
                                                ? "text-white"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {cui.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Ingredients */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Nguyên liệu *
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsIngredientSelectorOpen(true)}
                            className="border border-gray-300 rounded-xl p-4 mb-2"
                        >
                            <Text className={recipe.ingredients.length > 0 ? "text-gray-800" : "text-gray-400"}>
                                {recipe.ingredients.length > 0
                                    ? recipe.ingredientsWithDetails
                                          .map((ing) => `${ing.name} (${ing.quantity} ${ing.unit})`)
                                          .join(", ")
                                    : "Chọn nguyên liệu..."}
                            </Text>
                        </TouchableOpacity>
                        {recipe.ingredients.length > 0 && (
                            <Text className="text-xs text-gray-500">
                                Đã chọn {recipe.ingredients.length} nguyên liệu
                            </Text>
                        )}
                    </View>

                    {/* Tags */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold text-gray-900">Thẻ (Tags)</Text>
                            <TouchableOpacity onPress={() => setShowTagPicker(!showTagPicker)}>
                                <Ionicons
                                    name={showTagPicker ? "chevron-up" : "chevron-down"}
                                    size={24}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                        {showTagPicker && (
                            <View className="flex-row flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag._id}
                                        onPress={() => handleTagToggle(tag._id)}
                                        className={`px-3 py-2 rounded-xl ${
                                            recipe.tags.includes(tag._id)
                                                ? "bg-blue-500"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm ${
                                                recipe.tags.includes(tag._id)
                                                    ? "text-white"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {tag.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {recipe.tags.length > 0 && (
                            <Text className="text-xs text-gray-500 mt-2">
                                Đã chọn {recipe.tags.length} thẻ
                            </Text>
                        )}
                    </View>

                    {/* Instructions */}
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Hướng dẫn nấu ăn *
                        </Text>

                        {/* List of added instructions */}
                        {recipe.instructions.map((ins, i) => (
                            <View key={i} className="border border-gray-200 rounded-xl p-3 mb-3">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-bold text-gray-900 flex-1">
                                        {i + 1}. {ins.title}
                                    </Text>
                                    <TouchableOpacity onPress={() => removeInstruction(i)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                                {ins.images && ins.images.length > 0 && (
                                    <ScrollView horizontal className="mb-2">
                                        {ins.images.map((img, j) => (
                                            <Image
                                                key={j}
                                                source={{ uri: img }}
                                                className="w-24 h-20 rounded-lg mr-2"
                                            />
                                        ))}
                                    </ScrollView>
                                )}
                                {ins.subTitle.map((s, j) => (
                                    <Text key={j} className="text-sm text-gray-600 ml-2">
                                        • {s}
                                    </Text>
                                ))}
                            </View>
                        ))}

                        {/* Add new instruction form */}
                        <View className="border border-dashed border-gray-300 rounded-xl p-3">
                            <TextInput
                                placeholder="Tên bước"
                                value={currentInstruction.title}
                                onChangeText={(text) =>
                                    setCurrentInstruction({ ...currentInstruction, title: text })
                                }
                                className="border border-gray-300 rounded-xl p-3 mb-2"
                            />

                            {/* Images for instruction */}
                            {currentInstruction.images.length > 0 && (
                                <ScrollView horizontal className="mb-2">
                                    {currentInstruction.images.map((img, idx) => (
                                        <View key={idx} className="relative mr-2">
                                            <Image
                                                source={{ uri: img }}
                                                className="w-24 h-20 rounded-lg"
                                            />
                                            <TouchableOpacity
                                                onPress={() => removeInstructionImage(idx)}
                                                className="absolute top-1 right-1 bg-white/90 rounded-full p-1"
                                            >
                                                <Ionicons name="close" size={12} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}

                            {currentInstruction.images.length < 4 && (
                                <TouchableOpacity
                                    onPress={() => pickImage(true)}
                                    className="border border-dashed border-gray-300 rounded-xl p-3 mb-2 items-center"
                                >
                                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                                    <Text className="text-gray-500 text-xs mt-1">
                                        Thêm ảnh ({currentInstruction.images.length}/4)
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {currentInstruction.subTitle.map((sub, idx) => (
                                <View key={idx} className="flex-row items-center mb-2">
                                    <TextInput
                                        placeholder={`Bước ${idx + 1}`}
                                        value={sub}
                                        onChangeText={(text) => handleSubtitleChange(idx, text)}
                                        className="flex-1 border border-gray-300 rounded-xl p-3"
                                    />
                                    {idx > 0 && (
                                        <TouchableOpacity
                                            onPress={() => removeSubtitle(idx)}
                                            className="ml-2"
                                        >
                                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <View className="flex-row justify-between mt-2">
                                <TouchableOpacity
                                    onPress={addSubtitle}
                                    className="flex-1 mr-2 py-2 border border-orange-500 rounded-xl"
                                >
                                    <Text className="text-center text-orange-500 font-semibold">
                                        + Thêm bước phụ
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={addInstruction}
                                    className="flex-1 ml-2 py-2 bg-orange-500 rounded-xl"
                                >
                                    <Text className="text-center text-white font-bold">
                                        Lưu hướng dẫn
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Submit buttons */}
                    <View className="flex-row gap-3 pb-8">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            disabled={isSubmitting}
                            className="flex-1 py-4 border border-gray-300 rounded-xl"
                        >
                            <Text className="text-center text-gray-700 font-bold">Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-orange-500 rounded-xl"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text className="text-center text-white font-bold">
                                    Gửi đề xuất
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <IngredientSelectorUnitModal
                visible={isIngredientSelectorOpen}
                onClose={() => setIsIngredientSelectorOpen(false)}
                onSelect={handleIngredientSelect}
                selectedIngredients={recipe.ingredients.map((ingredientId) => {
                    const ingredient = ingredients.find((ing) => ing._id === ingredientId);
                    return ingredient ? ingredient.name : "";
                }).filter(Boolean)}
                existingIngredientDetails={recipe.ingredientsWithDetails.reduce(
                    (acc, ing) => {
                        acc[ing.name] = { quantity: ing.quantity, unit: ing.unit };
                        return acc;
                    },
                    {} as Record<string, { quantity: number; unit: string }>
                )}
            />
        </KeyboardAvoidingView>
    );
}
