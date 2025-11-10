import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getRecipeById } from "../redux/slices/recipeSlice";
import { WebView } from "react-native-webview";

interface RouteParams {
  id: string;
}

export default function RecipeDetailPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as RouteParams;
  const dispatch = useAppDispatch();
  const [openSteps, setOpenSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('instructions');
  const screenWidth = Dimensions.get("window").width;

  // Convert Rumble URL to embed URL
  const getRumbleEmbedUrl = (url: string): string => {
    // If already an embed URL, return as is
    if (url.includes('/embed/')) {
      return url;
    }

    // Extract video ID and pub parameter from rumble.com URL
    // Format: https://rumble.com/v71hv94-hutieu.html?mref=4notu2&mc=94do0
    const videoIdMatch = url.match(/rumble\.com\/([a-zA-Z0-9]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];

      // Try to extract pub parameter from mref
      const pubMatch = url.match(/[?&]mref=([^&]+)/);
      const pubParam = pubMatch ? `?pub=${pubMatch[1]}` : '';

      return `https://rumble.com/embed/${videoId}/${pubParam}`;
    }
    return url;
  };

  // Generate HTML for Rumble embed
  const generateRumbleHTML = (videoUrl: string): string => {
    const embedUrl = getRumbleEmbedUrl(videoUrl);
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Video Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { 
      background: #000;
      overflow: hidden; 
      height: 100%; 
      width: 100%; 
    }
    .video-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: #000;
    }
    iframe.rumble {
      width: 100%;
      height: 100%;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
    }
  </style>
</head>
<body>
  <div class="video-container">
    <iframe 
      class="rumble" 
      width="100%" 
      height="100%" 
      src="${embedUrl}" 
      frameborder="0" 
      allowfullscreen>
    </iframe>
  </div>
</body>
</html>
    `;
  };

  // Get recipe from Redux store
  const recipes = useAppSelector((state) => state.recipes.recipes);
  const loading = useAppSelector((state) => state.recipes.loading);
  const recipe = recipes.find((r) => r._id === id);

  useEffect(() => {
    if (id) {
      dispatch(getRecipeById(id));
    }
  }, [dispatch, id]);

  const toggleStep = (index: number) => {
    setOpenSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Show loading spinner when loading and no recipe
  if (loading && !recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="animate-spin">
          <Ionicons name="refresh" size={48} color="#F97316" />
        </View>
      </View>
    );
  }

  // Show not found if not loading and no recipe
  if (!loading && !recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-2xl font-semibold text-gray-900 mb-4">
          Không tìm thấy công thức
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-orange-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If still no recipe (loading first time)
  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="animate-spin">
          <Ionicons name="refresh" size={48} color="#F97316" />
        </View>
      </View>
    );
  }

  const difficultyColors: Record<string, string> = {
    Dễ: "#10B981",
    "Trung bình": "#F59E0B",
    Khó: "#EF4444",
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image with Overlay */}
        <View className="relative h-80">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Dark Overlay */}
          <View className="absolute inset-0 bg-black/40" />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-8 left-4 bg-white/90 rounded-full p-2"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Favorite Button (Non-functional for now) */}
          <TouchableOpacity
            className="absolute top-8 right-4 bg-white/90 rounded-full p-2"
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={24} color="#6B7280" />
          </TouchableOpacity>

          {/* Recipe Info Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-6">
            {/* Badges */}
            <View className="flex-row flex-wrap gap-2 mb-3">
              <View
                className="px-4 py-1 rounded-full"
                style={{
                  backgroundColor:
                    difficultyColors[recipe.difficulty] || "#6B7280",
                }}
              >
                <Text className="text-white text-sm font-semibold">
                  {recipe.difficulty}
                </Text>
              </View>
              <View className="bg-orange-500/80 px-4 py-1 rounded-full">
                <Text className="text-white text-sm font-semibold">
                  {recipe.cuisine.name}
                </Text>
              </View>
            </View>

            {/* Title & Description */}
            <Text className="text-white text-3xl font-bold mb-2">
              {recipe.name}
            </Text>
            <View className="mb-4">
              <Text className="text-white/95 text-base">
                {showFullDescription
                  ? recipe.short
                  : recipe.short && recipe.short.length > 100
                    ? recipe.short.substring(0, 100) + "..."
                    : recipe.short
                }
                {recipe.short && recipe.short.length > 100 && (
                  <Text
                    onPress={() => setShowFullDescription(!showFullDescription)}
                    className="text-orange-300 text-sm font-semibold"
                  >
                    {showFullDescription ? " Thu gọn" : " Xem thêm"}
                  </Text>
                )}
              </Text>
            </View>

            {/* Meta Info */}
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={20} color="#FFF" />
                <Text className="text-white text-sm">{recipe.time} phút</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="people-outline" size={20} color="#FFF" />
                <Text className="text-white text-sm">{recipe.size} người</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="star" size={20} color="#FBBF24" />
                <Text className="text-white text-sm font-semibold">
                  {(recipe.rate || 0).toFixed(1)}
                </Text>
                <Text className="text-white/80 text-sm">
                  ({recipe.numberOfRate || 0} đánh giá)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-6">
          {/* Tab Navigation + Content Container */}
          <View className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 mb-6 overflow-hidden">
            {/* Tab Navigation */}
            <View className="flex-row p-1 bg-white">
              <TouchableOpacity
                onPress={() => setActiveTab('instructions')}
                className={`flex-1 py-3 ${
                  activeTab === 'instructions' 
                    ? 'bg-orange-500 rounded-t-xl' 
                    : 'bg-gray-100 rounded-t-xl'
                }`}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons 
                    name="list" 
                    size={18} 
                    color={activeTab === 'instructions' ? '#FFF' : '#6B7280'} 
                  />
                  <Text 
                    className={`font-semibold text-sm ${
                      activeTab === 'instructions' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    Hướng dẫn nấu
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setActiveTab('ingredients')}
                className={`flex-1 py-3 ml-1 ${
                  activeTab === 'ingredients' 
                    ? 'bg-orange-500 rounded-t-xl' 
                    : 'bg-gray-100 rounded-t-xl'
                }`}
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Ionicons 
                    name="restaurant" 
                    size={18} 
                    color={activeTab === 'ingredients' ? '#FFF' : '#6B7280'} 
                  />
                  <Text 
                    className={`font-semibold text-sm ${
                      activeTab === 'ingredients' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    Nguyên liệu
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View className={`${activeTab === 'instructions' ? 'bg-white' : 'bg-white'}`}>
            {/* Instructions Section */}
            {activeTab === 'instructions' && (
              <View className="p-4 pt-0">
              {recipe.instructions.map((instruction, index) => (
                <View
                  key={index}
                  className="border border-gray-200 rounded-lg mb-3 overflow-hidden"
                >
                  {/* Step Header */}
                  <Pressable
                    onPress={() => toggleStep(index)}
                    className="flex-row items-center gap-3 p-4 bg-white active:bg-orange-50"
                  >
                    <View className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 items-center justify-center">
                      <Text className="text-white font-bold">
                        {index + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-base font-semibold text-gray-800">
                      {instruction.title}
                    </Text>
                    <Ionicons
                      name={
                        openSteps.includes(index)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color="#F97316"
                    />
                  </Pressable>

                  {/* Step Content */}
                  {openSteps.includes(index) && (
                    <View className="p-4 pt-0 bg-gray-50 border-t border-gray-200">
                      {/* Images */}
                      {instruction.images && instruction.images.length > 0 && (
                        <View className="mb-4">
                          {/* 1 image - centered */}
                          {instruction.images.length === 1 && (
                            <View className="w-4/5 mx-auto">
                              <Image
                                source={{ uri: instruction.images[0] }}
                                className="w-full h-48 rounded-lg"
                                resizeMode="cover"
                              />
                            </View>
                          )}

                          {/* 2 images - 2 columns */}
                          {instruction.images.length === 2 && (
                            <View className="flex-row gap-1">
                              {instruction.images.map((img, imgIndex) => (
                                <View
                                  key={imgIndex}
                                  className="flex-1 rounded-lg overflow-hidden"
                                >
                                  <Image
                                    source={{ uri: img }}
                                    className="w-full h-32"
                                    resizeMode="cover"
                                  />
                                </View>
                              ))}
                            </View>
                          )}

                          {/* 3 images - 2 on top, 1 bottom */}
                          {instruction.images.length === 3 && (
                            <View className="gap-1">
                              <View className="flex-row gap-1">
                                {instruction.images
                                  .slice(0, 2)
                                  .map((img, imgIndex) => (
                                    <View
                                      key={imgIndex}
                                      className="flex-1 rounded-lg overflow-hidden"
                                    >
                                      <Image
                                        source={{ uri: img }}
                                        className="w-full h-32"
                                        resizeMode="cover"
                                      />
                                    </View>
                                  ))}
                              </View>
                              <View className="rounded-lg overflow-hidden">
                                <Image
                                  source={{ uri: instruction.images[2] }}
                                  className="w-full h-40"
                                  resizeMode="cover"
                                />
                              </View>
                            </View>
                          )}

                          {/* 4+ images - grid */}
                          {instruction.images.length >= 4 && (
                            <View className="flex-row flex-wrap gap-1">
                              {instruction.images.map((img, imgIndex) => (
                                <View
                                  key={imgIndex}
                                  className="w-[49%] rounded-lg overflow-hidden"
                                >
                                  <Image
                                    source={{ uri: img }}
                                    className="w-full h-32"
                                    resizeMode="cover"
                                  />
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}

                      {/* Step Details */}
                      <View className="space-y-2">
                        {instruction.subTitle.map((step, stepIndex) => (
                          <View key={stepIndex} className="flex-row gap-2">
                            <Text className="text-orange-500 font-bold mt-1">
                              •
                            </Text>
                            <Text className="text-sm text-gray-700 leading-relaxed flex-1">
                              {step}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
              </View>
            )}

            {/* Ingredients Section */}
            {activeTab === 'ingredients' && (
              <View className="p-4 pt-0">
                {recipe.ingredients.map((ingredient, index) => (
                  <Pressable
                    key={index}
                    onPress={() => toggleIngredient(index)}
                    className="flex-row items-center gap-3 py-3 px-3 bg-gray-50 rounded-lg mb-2 border border-transparent active:border-orange-200 active:bg-orange-50"
                  >
                    <View
                      className={`h-5 w-5 rounded border-2 items-center justify-center ${checkedIngredients.includes(index)
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300"
                        }`}
                    >
                      {checkedIngredients.includes(index) && (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      )}
                    </View>
                    <Text className="text-sm text-gray-700 font-medium flex-1">
                      {ingredient.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            </View>
          </View>

          {/* Cooking Tips */}
          <View className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 shadow-md border-2 border-orange-200 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="bg-orange-500 p-2 rounded-lg">
                <Ionicons name="bulb" size={20} color="#FFF" />
              </View>
              <Text className="text-orange-700 text-lg font-bold">
                Mẹo nấu ăn
              </Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row gap-3 items-start">
                <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center mt-0.5">
                  <Text className="text-white text-xs font-bold">1</Text>
                </View>
                <Text className="text-orange-900 text-sm leading-relaxed flex-1">
                  Đọc kỹ hướng dẫn trước khi bắt đầu nấu
                </Text>
              </View>
              <View className="flex-row gap-3 items-start">
                <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center mt-0.5">
                  <Text className="text-white text-xs font-bold">2</Text>
                </View>
                <Text className="text-orange-900 text-sm leading-relaxed flex-1">
                  Chuẩn bị và đong đo tất cả nguyên liệu trước
                </Text>
              </View>
              <View className="flex-row gap-3 items-start">
                <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center mt-0.5">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <Text className="text-orange-900 text-sm leading-relaxed flex-1">
                  Điều chỉnh gia vị theo khẩu vị cá nhân
                </Text>
              </View>
              <View className="flex-row gap-3 items-start">
                <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center mt-0.5">
                  <Text className="text-white text-xs font-bold">4</Text>
                </View>
                <Text className="text-orange-900 text-sm leading-relaxed flex-1">
                  Sử dụng nguyên liệu tươi để có kết quả tốt nhất
                </Text>
              </View>
            </View>
          </View>

          {/* Video Tutorial */}
          {recipe.video && recipe.video.trim() !== "" && (
            <View className="bg-white rounded-2xl shadow-md border-2 border-orange-100 overflow-hidden mb-6">
              <View className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="play-circle" size={20} color="#F97316" />
                  <Text className="text-gray-800 text-base font-bold">
                    Video hướng dẫn
                  </Text>
                </View>
              </View>

              <View className="p-4">
                <View
                  className="bg-black rounded-lg overflow-hidden"
                  style={{ height: (screenWidth - 32) * 9 / 16 }}
                >
                  {videoLoading && (
                    <View className="absolute inset-0 items-center justify-center bg-gray-900 z-10">
                      <ActivityIndicator size="large" color="#F97316" />
                      <Text className="text-white mt-2">Đang tải video...</Text>
                    </View>
                  )}

                  <WebView
                    source={{ html: generateRumbleHTML(recipe.video) }}
                    style={{ flex: 1, backgroundColor: "#000" }}
                    allowsFullscreenVideo={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    scrollEnabled={false}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onLoadStart={() => setVideoLoading(true)}
                    onLoadEnd={() => setVideoLoading(false)}
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.error("WebView error:", nativeEvent);
                      setVideoLoading(false);
                    }}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Bottom spacing for safe area */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
