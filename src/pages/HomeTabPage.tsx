import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bell, Settings, Play, UsersRound, MapPinned, Clock, Star } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { fetchTopRatedRecipes, fetchNewestRecipes, fetchPopularRecipes, fetchCategories, fetchTrendingRecipes } from "../redux/slices/recipeSlice"
import { fetchMostFavorited } from "../redux/slices/favoriteSlice"
import { fetchTopComments, fetchNewestComments } from "../redux/slices/commentSlice"
import RecipeCard from "../components/RecipeCard"
import TopCommentsSection from "../components/TopCommentsSection"
import ThreeColumnSection from "../components/ThreeColumnSection"

const { width } = Dimensions.get("window")

const HomeTabPage: React.FC = () => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const [currentSlide, setCurrentSlide] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  // Lấy data từ Redux
  const { topRatedRecipes, newestRecipes, popularRecipes, categories, trendingRecipes, loading } = useAppSelector((state) => state.recipes)
  const { mostFavorited } = useAppSelector((state) => state.favorites)
  const { topComments, newestComments } = useAppSelector((state) => state.comments)

  // Fetch data khi component mount
  useEffect(() => {
    dispatch(fetchTopRatedRecipes(6)) // Lấy 6 món top rated cho banner
    dispatch(fetchNewestRecipes(6))
    dispatch(fetchPopularRecipes(6))
    dispatch(fetchCategories())
    dispatch(fetchTrendingRecipes())
    dispatch(fetchMostFavorited())
    dispatch(fetchTopComments())
    dispatch(fetchNewestComments())
  }, [dispatch])

  // Scroll đến vị trí giữa khi có data
  useEffect(() => {
    if (topRatedRecipes.length > 0) {
      const timer = setTimeout(() => {
        if (scrollViewRef.current) {
          const slideWidth = width - 32
          const middleIndex = Math.floor(topRatedRecipes.length / 2)
          setCurrentSlide(middleIndex)
          scrollViewRef.current.scrollTo({ x: slideWidth * middleIndex, animated: false })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [topRatedRecipes])

  // Auto scroll mỗi 10 giây
  useEffect(() => {
    if (topRatedRecipes.length === 0) return

    const autoScrollInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % topRatedRecipes.length
        if (scrollViewRef.current) {
          const slideWidth = width - 32
          scrollViewRef.current.scrollTo({ x: slideWidth * nextSlide, animated: true })
        }
        return nextSlide
      })
    }, 10000) // 10 giây

    return () => clearInterval(autoScrollInterval)
  }, [topRatedRecipes.length])

  const handleRecipePress = (recipeId: string) => {
    ;(navigation as any).navigate("RecipeDetail", { id: recipeId })
  }

  // Helper function để format thời gian
  const formatTime = (minutes: number) => {
    return `${minutes}m`
  }

  // Helper function để map difficulty
  const getDifficulty = (difficulty: string) => {
    if (!difficulty) return "Trung bình" // Default nếu undefined
    const difficultyMap: { [key: string]: string } = {
      'easy': 'Dễ',
      'medium': 'Trung bình',
      'hard': 'Khó'
    }
    return difficultyMap[difficulty.toLowerCase()] || difficulty
  }

  if (loading && topRatedRecipes.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-500 mt-4">Đang tải...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        {/* Logo */}

        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center">
            <Image source={require("../../assets/images/icon.png")} className="w-full h-full" resizeMode="cover" />
          </View>
          <View>
            <Text className="text-gray-900 text-lg font-bold">Kooka</Text>
            <Text className="text-gray-900 text-xs">Công thức mới mỗi ngày</Text>
          </View>
        </View>
        {/* Icons */}
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => (navigation as any).navigate("Notifications")}>
            <Bell size={22} color="#1f2937" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (navigation as any).navigate("Settings")}>
            <Settings size={22} color="#1f2937" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Featured Recipe Carousel */}
        <View className="mt-4">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x
              const slideWidth = width - 32
              const slide = Math.round(offsetX / slideWidth)
              setCurrentSlide(slide)
            }}
            scrollEventThrottle={16}
            snapToInterval={width - 32}
            snapToAlignment="start"
            decelerationRate="fast"
          >
            {topRatedRecipes.map((recipe) => (
              <View key={recipe._id} style={{ width: width - 32 }} className="px-4">
                <TouchableOpacity onPress={() => handleRecipePress(recipe._id)} activeOpacity={0.9}>
                  <View className="rounded-2xl overflow-hidden shadow-lg">
                    <Image source={{ uri: recipe.image }} className="w-full h-[250px]" resizeMode="cover" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-4 gap-1">
            {topRatedRecipes.map((recipe, index) => (
              <View
                key={recipe._id}
                className={`h-1 rounded-full ${currentSlide === index ? "bg-orange-500 w-8" : "bg-gray-300 w-2"}`}
              />
            ))}
          </View>
        </View>

        {/* Recipe Details - Hiển thị thông tin của recipe hiện tại */}
        {topRatedRecipes.length > 0 && topRatedRecipes[currentSlide] && (
          <View className="mt-6 px-4">
            {/* Tên món ăn */}
            <Text className="text-gray-900 text-2xl font-bold mb-4">{topRatedRecipes[currentSlide].name}</Text>

            {/* Info Tags */}
            <View className="flex-row items-center gap-2 mb-4 flex-wrap">
              <View className="bg-orange-500 px-3 py-1.5 rounded-lg flex-row items-center gap-1">
                <Star size={12} color="#ffffff" fill="#ffffff" />
                <Text className="text-white text-xs font-bold">{topRatedRecipes[currentSlide].rate.toFixed(1)}</Text>
              </View>
              <View className="border-2 border-orange-500 px-3 py-1.5 rounded-lg">
                <Text className="text-orange-600 text-xs font-bold">{getDifficulty(topRatedRecipes[currentSlide].difficulty)}</Text>
              </View>
              <View className="border-2 border-orange-500 px-3 py-1.5 rounded-lg flex-row items-center gap-1">
                <Clock size={12} color="#ea580c" />
                <Text className="text-orange-600 text-xs font-bold">{formatTime(topRatedRecipes[currentSlide].time)}</Text>
              </View>
              <View className="border-2 border-orange-500 px-3 py-1.5 rounded-lg flex-row items-center gap-1">
                <UsersRound size={12} color="#ea580c" />
                <Text className="text-orange-600 text-xs font-bold">{topRatedRecipes[currentSlide].size}</Text>
              </View>
            </View>

            {/* Description - Giới hạn 2 dòng */}
            <Text className="text-gray-600 text-sm mb-4 leading-5" numberOfLines={2}>
              {topRatedRecipes[currentSlide].short || "Công thức nấu ăn ngon..."}
            </Text>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-orange-500 py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-md"
                onPress={() => handleRecipePress(topRatedRecipes[currentSlide]._id)}
              >
                <Play size={18} color="#ffffff" fill="#ffffff" />
                <Text className="text-white font-bold text-sm">Xem Công Thức</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 border-2 border-orange-500 py-3 rounded-xl flex-row items-center justify-center gap-2"
                onPress={() => handleRecipePress(topRatedRecipes[currentSlide]._id)}
              >
                <View className="w-4 h-4 rounded-full border-2 border-orange-500 items-center justify-center">
                  <Text className="text-orange-500 font-bold text-[10px]">i</Text>
                </View>
                <Text className="text-orange-500 font-bold text-sm">Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Món Ăn Mới */}
        <View className="mt-8">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <Text className="text-gray-900 text-xl font-bold">Món Ăn Mới</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate("AllRecipes", { type: "new" })}>
              <Text className="text-orange-500 text-sm font-semibold">Xem thêm →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="pl-4"
            snapToInterval={width * 0.45 + 12}
            decelerationRate="fast"
          >
            {newestRecipes.map((recipe, index) => (
              <View
                key={recipe._id}
                className={index === newestRecipes.length - 1 ? "mr-4" : "mr-3"}
                style={{ width: width * 0.45 }}
              >
                <RecipeCard
                  id={recipe._id}
                  title={recipe.name}
                  description={recipe.short}
                  image={recipe.image}
                  rating={recipe.rate}
                  difficulty={getDifficulty(recipe.difficulty)}
                  cookTime={formatTime(recipe.time)}
                  servings={recipe.size}
                  cuisine={recipe.cuisine?.name || "Món ăn"}
                  ingredients={
                    Array.isArray(recipe.ingredients)
                      ? recipe.ingredients.slice(0, 3).map((ing) => ing.name)
                      : []
                  }
                  moreIngredients={
                    Array.isArray(recipe.ingredients) && recipe.ingredients.length > 3
                      ? recipe.ingredients.length - 3
                      : 0
                  }
                  reviews={recipe.numberOfRate || 0}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Món Ăn Phổ Biến */}
        <View className="mt-8">
          <View className="px-4 mb-4 flex-row items-center justify-between">
            <Text className="text-gray-900 text-xl font-bold">Món Ăn Phổ Biến</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate("AllRecipes", { type: "popular" })}>
              <Text className="text-orange-500 text-sm font-semibold">Xem thêm →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="pl-4"
            snapToInterval={width * 0.45 + 12}
            decelerationRate="fast"
          >
            {popularRecipes.map((recipe, index) => (
              <View
                key={recipe._id}
                className={index === popularRecipes.length - 1 ? "mr-4" : "mr-3"}
                style={{ width: width * 0.45 }}
              >
                <RecipeCard
                  id={recipe._id}
                  title={recipe.name}
                  description={recipe.short}
                  image={recipe.image}
                  rating={recipe.rate}
                  difficulty={getDifficulty(recipe.difficulty)}
                  cookTime={formatTime(recipe.time)}
                  servings={recipe.size}
                  cuisine={recipe.cuisine?.name || "Món ăn"}
                  ingredients={
                    Array.isArray(recipe.ingredients)
                      ? recipe.ingredients.slice(0, 3).map((ing) => ing.name)
                      : []
                  }
                  moreIngredients={
                    Array.isArray(recipe.ingredients) && recipe.ingredients.length > 3
                      ? recipe.ingredients.length - 3
                      : 0
                  }
                  reviews={recipe.numberOfRate || 0}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Top Comments Section */}
        <TopCommentsSection comments={topComments} loading={loading} />

        {/* Three Columns Section - Scroll ngang */}
        <ThreeColumnSection 
          trendingRecipes={trendingRecipes}
          mostFavorited={mostFavorited}
          newestComments={newestComments}
          loading={loading}
        />

        <View className="pb-20" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeTabPage
