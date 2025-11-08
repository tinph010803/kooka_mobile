import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bell, Settings, Play } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
const { width } = Dimensions.get("window")

// Mock data
const MOCK_RECIPES = [
  {
    id: "1",
    name: "Phở Bò Hà Nội",
    engName: "Hanoi Beef Pho",
    image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=500&h=600&fit=crop",
    rating: 4.8,
    difficulty: "Trung bình",
    cookingTime: "2 giờ",
    servings: "4 người",
    description:
      "Món phở bò truyền thống Hà Nội với nước dùng thanh ngọt từ xương, thịt bò mềm và hương thơm đặc trưng...",
  },
  {
    id: "2",
    name: "Bún Chả Hà Nội",
    engName: "Hanoi Grilled Pork with Noodles",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=600&fit=crop",
    rating: 4.9,
    difficulty: "Dễ",
    cookingTime: "1 giờ",
    servings: "3 người",
    description: "Món bún chả thơm ngon với thịt nướng và chả giòn, ăn kèm bún tươi và nước chấm chua ngọt...",
  },
  {
    id: "3",
    name: "Bánh Xèo Miền Tây",
    engName: "Vietnamese Crispy Pancake",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=500&h=600&fit=crop",
    rating: 4.7,
    difficulty: "Trung bình",
    cookingTime: "45 phút",
    servings: "4 người",
    description: "Bánh xèo giòn rụm với nhân tôm thịt, giá đỗ, ăn kèm rau sống và nước mắm chua ngọt...",
  },
  {
    id: "4",
    name: "Cơm Tấm Sườn Nướng",
    engName: "Grilled Pork with Broken Rice",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=600&fit=crop",
    rating: 4.6,
    difficulty: "Dễ",
    cookingTime: "30 phút",
    servings: "2 người",
    description: "Cơm tấm sườn nướng thơm lừng với nước mắm pha chua ngọt, chả trứng và bì...",
  },
  {
    id: "5",
    name: "Gỏi Cuốn Tôm Thịt",
    engName: "Fresh Spring Rolls",
    image: "https://images.unsplash.com/photo-1599514986786-4e2f1f2c9e70?w=500&h=600&fit=crop",
    rating: 4.5,
    difficulty: "Dễ",
    cookingTime: "20 phút",
    servings: "4 người",
    description: "Gỏi cuốn tươi mát với tôm, thịt, bún và rau sống, chấm với nước tương đậu phộng...",
  },
  {
    id: "6",
    name: "Bò Lúc Lắc",
    engName: "Shaking Beef",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&h=600&fit=crop",
    rating: 4.8,
    difficulty: "Dễ",
    cookingTime: "25 phút",
    servings: "3 người",
    description: "Thịt bò thăn mềm xào với hành tây, tiêu đen, ăn kèm salad và cơm trắng...",
  },
  {
    id: "7",
    name: "Canh Chua Cá Lóc",
    engName: "Sour Fish Soup",
    image: "https://images.unsplash.com/photo-1604908815749-7c4e8146a8da?w=500&h=600&fit=crop",
    rating: 4.7,
    difficulty: "Trung bình",
    cookingTime: "40 phút",
    servings: "4 người",
    description: "Canh chua cá lóc miền Nam với me chua, dứa, cà chua và rau muống...",
  },
  {
    id: "8",
    name: "Bánh Mì Pate Thịt",
    engName: "Vietnamese Baguette",
    image: "https://images.unsplash.com/photo-1592415734786-748e0c7c2b25?w=500&h=600&fit=crop",
    rating: 4.9,
    difficulty: "Dễ",
    cookingTime: "15 phút",
    servings: "2 người",
    description: "Bánh mì Việt Nam giòn tan với pate, thịt nguội, rau sống và nước tương...",
  },
]

const CATEGORIES = [
  { id: "1", name: "Đề xuất" },
  { id: "2", name: "Món Việt" },
  { id: "3", name: "Món Á" },
  { id: "4", name: "Thể loại", dropdown: true },
]

const HomeTabPage: React.FC = () => {
  const navigation = useNavigation()
  const [activeCategory, setActiveCategory] = useState("1")
  const [currentSlide, setCurrentSlide] = useState(3) // Bắt đầu từ giữa (index 3 trong 8 món)
  const scrollViewRef = useRef<ScrollView>(null)

  // Scroll đến vị trí giữa khi component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        const slideWidth = width - 32
        scrollViewRef.current.scrollTo({ x: slideWidth * 3, animated: false })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleFilmPress = (filmId: string) => {
    ; (navigation as any).navigate("RecipeDetail", { id: filmId })
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
          <TouchableOpacity>
            <Settings size={22} color="#1f2937" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View className="px-4 mt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
                className={`mr-2 px-4 py-2 rounded-full border ${activeCategory === category.id ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-transparent"
                  }`}
              >
                <Text
                  className={`font-semibold text-sm ${activeCategory === category.id ? "text-white" : "text-gray-700"
                    }`}
                >
                  {category.name}
                  {category.dropdown && " ▼"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Featured Recipe Carousel */}
        <View className="mt-6">
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
            {MOCK_RECIPES.map((recipe) => (
              <View key={recipe.id} style={{ width: width - 32 }} className="px-4">
                <TouchableOpacity onPress={() => handleFilmPress(recipe.id)} activeOpacity={0.9}>
                  <View className="rounded-2xl overflow-hidden shadow-lg">
                    <Image source={{ uri: recipe.image }} className="w-full h-[250px]" resizeMode="cover" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-4 gap-1">
            {MOCK_RECIPES.map((_, index) => (
              <View
                key={index}
                className={`h-1 rounded-full ${currentSlide === index ? "bg-emerald-500 w-8" : "bg-gray-300 w-2"}`}
              />
            ))}
          </View>
        </View>

        {/* Recipe Details - Hiển thị thông tin của recipe hiện tại */}
        <View className="mt-6 px-4">
          {/* Tên món ăn */}
          <Text className="text-gray-900 text-2xl font-bold mb-4">{MOCK_RECIPES[currentSlide].name}</Text>

          {/* Info Tags */}
          <View className="flex-row items-center gap-2 mb-4 flex-wrap">
            <View className="bg-emerald-500 px-3 py-1.5 rounded-lg">
              <Text className="text-white text-xs font-bold">⭐ {MOCK_RECIPES[currentSlide].rating}</Text>
            </View>
            <View className="border-2 border-emerald-500 px-3 py-1.5 rounded-lg">
              <Text className="text-emerald-600 text-xs font-bold">{MOCK_RECIPES[currentSlide].difficulty}</Text>
            </View>
            <View className="border-2 border-emerald-500 px-3 py-1.5 rounded-lg">
              <Text className="text-emerald-600 text-xs font-bold">⏱ {MOCK_RECIPES[currentSlide].cookingTime}</Text>
            </View>
            <View className="border-2 border-emerald-500 px-3 py-1.5 rounded-lg">
              <Text className="text-emerald-600 text-xs font-bold">👥 {MOCK_RECIPES[currentSlide].servings}</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-gray-600 text-sm mb-4 leading-5">{MOCK_RECIPES[currentSlide].description}</Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-emerald-500 py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-md">
              <Play size={18} color="#ffffff" fill="#ffffff" />
              <Text className="text-white font-bold text-sm">Xem Công Thức</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border-2 border-emerald-500 py-3 rounded-xl flex-row items-center justify-center gap-2">
              <View className="w-4 h-4 rounded-full border-2 border-emerald-500 items-center justify-center">
                <Text className="text-emerald-500 font-bold text-[10px]">i</Text>
              </View>
              <Text className="text-emerald-500 font-bold text-sm">Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Placeholder for more content */}
        <View className="mt-8 px-4">
          <Text className="text-gray-900 text-lg font-bold">Đang cập nhật</Text>
        </View>

        <View className="pb-20" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeTabPage
