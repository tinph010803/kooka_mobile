import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
  Keyboard,
  Animated,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import axiosInstance from '../utils/axiosInstance';
import * as ImagePicker from 'expo-image-picker';

interface Recipe {
  id: string;
  name: string;
  image?: string;
  time?: number;
  calories?: number;
  size?: number;
  difficulty?: string;
  rating?: number;
  numberOfRatings?: number;
  cuisine?: string | null;
  category?: string | null;
  short?: string;
}

interface MealPlanDay {
  morning?: {
    recipeId: string;
    recipeName: string;
    recipeImage?: string;
  };
  noon?: {
    recipeId: string;
    recipeName: string;
    recipeImage?: string;
  };
  evening?: {
    recipeId: string;
    recipeName: string;
    recipeImage?: string;
  };
}

interface MealPlan {
  mealPlanType: string;
  duration: number;
  plans: MealPlanDay[];
  totalRecipes: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  recipes?: Recipe[];
  images?: string[];
  mealPlan?: MealPlan;
}

interface QuickSuggestion {
  id: string;
  text: string;
  icon: string;
}

// Typing Indicator Component với animation
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSequence = () => {
      Animated.sequence([
        Animated.timing(dot1, {
          toValue: -8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot1, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),

        Animated.timing(dot2, {
          toValue: -8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot2, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),

        Animated.timing(dot3, {
          toValue: -8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot3, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => animateSequence()); // lặp lại
    };

    animateSequence();
  }, [dot1, dot2, dot3]);

  return (
    <View className="flex-row gap-1.5">
      <Animated.View
        style={{ transform: [{ translateY: dot1 }] }}
        className="w-2 h-2 rounded-full bg-gray-400"
      />
      <Animated.View
        style={{ transform: [{ translateY: dot2 }] }}
        className="w-2 h-2 rounded-full bg-gray-400"
      />
      <Animated.View
        style={{ transform: [{ translateY: dot3 }] }}
        className="w-2 h-2 rounded-full bg-gray-400"
      />
    </View>
  );
};

const AIChatBotPage = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickSuggestions: QuickSuggestion[] = [
    { id: '1', text: 'Gợi ý món ăn với gà', icon: 'restaurant' },
    { id: '2', text: 'Công thức món chay', icon: 'leaf' },
    { id: '3', text: 'Món ăn nhanh 15 phút', icon: 'time' },
    { id: '4', text: 'Món Việt Nam dễ làm', icon: 'fast-food' },
  ];

  // Initialize session ID
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: 'Xin chào! Tôi là Kooka AI Assistant. Tôi có thể giúp bạn tìm công thức, gợi ý món ăn, hoặc trả lời câu hỏi về nấu ăn. Bạn cần hỗ trợ gì?',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  // Send message to backend API
  const sendMessageToAPI = async (userMessage: string, images?: string[]): Promise<{ message: string; recipes: Recipe[]; mealPlan?: MealPlan }> => {
    try {
      setError('');

      console.log('🔵 Sending to chatbot API...');
      console.log('📡 Base URL:', axiosInstance.defaults.baseURL);
      console.log('💬 Message:', userMessage);

      const requestBody: {
        message?: string;
        sessionId: string;
        userId: string | null;
        imageBase64?: string;
      } = {
        message: userMessage || undefined,
        sessionId: sessionId,
        userId: user?._id || null,
      };

      // If images provided, send first image as imageBase64
      if (images && images.length > 0) {
        requestBody.imageBase64 = images[0];
      }

      console.log('📦 Request body:', { ...requestBody, imageBase64: requestBody.imageBase64 ? '[IMAGE_DATA]' : undefined });

      // Chatbot API needs longer timeout (AI processing takes time)
      const response = await axiosInstance.post('/chatbot/chat', requestBody, {
        timeout: 60000, // 60 seconds for AI processing (meal plan generation takes time)
      });

      console.log('✅ Chatbot response:', response.data);

      if (response.data.success) {
        const message = response.data.message || response.data.response || 'Không có phản hồi';

        let recipes: Recipe[] = [];
        let mealPlan: MealPlan | undefined = undefined;

        if (response.data.structuredData) {
          // Single recipe detail
          if (response.data.structuredData.recipe) {
            recipes = [response.data.structuredData.recipe];
          }
          // Multiple recipes list
          else if (response.data.structuredData.recipes && response.data.structuredData.recipes.length > 0) {
            recipes = response.data.structuredData.recipes;
          }

          // Handle meal plan data
          if (response.data.structuredData.generatedMealPlan) {
            mealPlan = response.data.structuredData.generatedMealPlan;
          }
        }

        return { message, recipes, mealPlan };
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error sending message to chatbot:', err);
      setError(error.message || 'An error occurred');

      const errorMessage = 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau! 🙏';
      return { message: errorMessage, recipes: [] };
    }
  };

  const handleImagePicker = () => {
    setShowImageOptions(true);
  };

  const handleTakePhoto = async () => {
    setShowImageOptions(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: "error",
        text1: "❌ Lỗi quyền truy cập",
        text2: "Cần quyền truy cập camera",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImages([base64Image]);
    }
  };

  const handlePickImage = async () => {
    setShowImageOptions(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: "error",
        text1: "❌ Lỗi quyền truy cập",
        text2: "Cần quyền truy cập thư viện ảnh",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImages([base64Image]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImages([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && selectedImages.length === 0) return;

    // Dismiss keyboard when sending
    Keyboard.dismiss();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim() || '🖼️ Đã gửi ảnh',
      sender: 'user',
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    };

    const currentMessage = message;
    const currentImages = [...selectedImages];

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setSelectedImages([]);
    setIsTyping(true);

    try {
      // Call backend API with Gemini AI
      const { message: botResponseText, recipes, mealPlan } = await sendMessageToAPI(currentMessage, currentImages.length > 0 ? currentImages : undefined);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        recipes: recipes.length > 0 ? recipes : undefined,
        mealPlan: mealPlan,
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error('Error getting bot response:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại! 🙏',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickSuggestion = async (suggestion: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { message: botResponseText, recipes, mealPlan } = await sendMessageToAPI(suggestion);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        recipes: recipes.length > 0 ? recipes : undefined,
        mealPlan: mealPlan,
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      console.error('Error getting bot response:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-gray-200">
          <View className="flex-row items-center gap-3">
            <Image
              source={{
                uri: 'https://res.cloudinary.com/df2amyjzw/image/upload/v1760760986/bot_sc9i1l.webp',
              }}
              className="w-10 h-10 rounded-full"
              resizeMode="cover"
            />

            <View>
              <Text className="text-lg font-semibold text-gray-900">Kooka AI</Text>
              {/* Icon online */}
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1" />
                <Text className="text-xs text-gray-500">Online</Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity className="w-9 h-9 items-center justify-center">
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>


        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        >
          {messages.map((msg, index) => (
            <View key={msg.id}>
              {msg.sender === 'bot' ? (
                // Bot message
                <View className="flex-row items-start mb-4">
                  <Image
                    source={{ uri: 'https://res.cloudinary.com/df2amyjzw/image/upload/v1760760986/bot_sc9i1l.webp' }}
                    className="w-8 h-8 rounded-full mr-2"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <Text className="text-gray-800 text-[15px] leading-5">{msg.text}</Text>
                    </View>

                    {/* Recipe Cards */}
                    {msg.recipes && msg.recipes.length > 0 && (
                      <View className="mt-3 max-w-[85%]">
                        <View className="space-y-2">
                          {msg.recipes.slice(0, 6).map((recipe) => (
                            <TouchableOpacity
                              key={recipe.id}
                              onPress={() => {
                                // @ts-ignore
                                navigation.navigate('RecipeDetail', { id: recipe.id });
                              }}
                              className="bg-white border border-gray-200 rounded-lg p-2 flex-row items-center gap-2"
                            >
                              {/* Recipe Image */}
                              <View className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                {recipe.image ? (
                                  <Image
                                    source={{ uri: recipe.image }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View className="w-full h-full items-center justify-center">
                                    <Ionicons name="restaurant" size={24} color="#999" />
                                  </View>
                                )}
                              </View>

                              {/* Recipe Info */}
                              <View className="flex-1">
                                <Text className="font-semibold text-xs text-gray-900 mb-1" numberOfLines={1}>
                                  {recipe.name}
                                </Text>
                                {recipe.rating !== undefined && recipe.rating !== null && recipe.rating > 0 && (
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons name="star" size={12} color="#fbbf24" />
                                    <Text className="text-xs text-gray-600 font-medium">
                                      {recipe.rating.toFixed(1)}
                                    </Text>
                                    {recipe.numberOfRatings && recipe.numberOfRatings > 0 && (
                                      <Text className="text-xs text-gray-400">
                                        ({recipe.numberOfRatings})
                                      </Text>
                                    )}
                                  </View>
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {msg.recipes.length > 6 && (
                          <Text className="text-xs text-gray-500 text-center mt-2">
                            Còn {msg.recipes.length - 6} món nữa. Hỏi tôi để xem chi tiết!
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Meal Plan Button */}
                    {msg.mealPlan && (
                      <View className="mt-3 max-w-[85%]">
                        <TouchableOpacity
                          onPress={() => {
                            if (!user) {
                              Toast.show({
                                type: 'info',
                                text1: 'Thông báo',
                                text2: 'Vui lòng đăng nhập để sử dụng tính năng này!'
                              });
                              return;
                            }
                            // @ts-ignore
                            navigation.navigate('MealPlan', {
                              aiGeneratedPlan: msg.mealPlan,
                            });
                          }}
                          className="bg-green-500 rounded-xl px-4 py-3 flex-row items-center justify-center gap-2"
                        >
                          <Ionicons name="calendar" size={16} color="#fff" />
                          <Text className="text-white font-semibold text-sm">
                            🎉 Xem Meal Plan
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Timestamp - Đặt sau cùng */}
                    <Text className="text-gray-400 text-xs mt-2 ml-1">
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              ) : (
                // User message
                <View className="flex-row justify-end mb-4">
                  <View className="max-w-[75%]">
                    {/* User Images */}
                    {msg.images && msg.images.length > 0 && (
                      <View className="mb-2">
                        {msg.images.map((imageUri, imgIndex) => (
                          <View key={imgIndex} className="rounded-xl overflow-hidden mb-1">
                            <Image
                              source={{ uri: imageUri }}
                              className="w-48 h-48 rounded-xl"
                              resizeMode="cover"
                            />
                          </View>
                        ))}
                      </View>
                    )}
                    {/* User Text */}
                    {msg.text && (
                      <View className="bg-blue-500 rounded-2xl rounded-tr-sm px-4 py-3">
                        <Text className="text-white text-[15px] leading-5">{msg.text}</Text>
                      </View>
                    )}
                    <Text className="text-gray-400 text-xs mt-1 text-right mr-1">
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View className="flex-row items-start mb-4">
              <Image
                source={{ uri: 'https://res.cloudinary.com/df2amyjzw/image/upload/v1760760986/bot_sc9i1l.webp' }}
                className="w-8 h-8 rounded-full mr-2"
                resizeMode="cover"
              />
              <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <TypingIndicator />
              </View>
            </View>
          )}

          {/* Quick suggestions - Show after welcome message */}
          {messages.length === 1 && messages[0].id === 'welcome' && (
            <View className="mt-2">
              <Text className="text-gray-500 text-sm mb-3 ml-1">Gợi ý nhanh:</Text>
              {quickSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  className="flex-row items-center bg-orange-50 rounded-xl px-4 py-3 mb-2"
                  onPress={() => handleQuickSuggestion(suggestion.text)}
                >
                  <Ionicons name="bulb-outline" size={18} color="#f97316" />
                  <Text className="text-gray-700 text-sm ml-3">{suggestion.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Container */}
        <View className="px-4 py-3 bg-white border-t border-gray-200" style={{ marginBottom: keyboardHeight > 0 ? keyboardHeight : 60 }}>
          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <View className="mb-3">
              <View className="relative">
                <Image
                  source={{ uri: selectedImages[0] }}
                  className="w-24 h-24 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="flex-row items-end bg-gray-100 rounded-3xl px-3 py-2">
            <TouchableOpacity className="p-2" onPress={handleImagePicker}>
              <Ionicons name="image-outline" size={24} color="#666" />
            </TouchableOpacity>

            <TextInput
              className="flex-1 text-gray-900 text-base max-h-24 px-2 py-2"
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              onSubmitEditing={handleSendMessage}
            />

            <TouchableOpacity
              className={`w-9 h-9 rounded-full items-center justify-center ml-1 ${message.trim() || selectedImages.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              onPress={handleSendMessage}
              disabled={!message.trim() && selectedImages.length === 0}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowImageOptions(false)}
        >
          <Pressable className="bg-white rounded-t-3xl pb-8" onPress={(e) => e.stopPropagation()}>
            <View className="items-center py-3 border-b border-gray-200">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="px-4 pt-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Chọn ảnh</Text>

              {/* Take Photo Option */}
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-row items-center bg-blue-50 rounded-2xl p-4 mb-3"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">Chụp ảnh</Text>
                  <Text className="text-sm text-gray-600">Mở camera để chụp ảnh mới</Text>
                </View>
              </TouchableOpacity>

              {/* Pick from Gallery Option */}
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-row items-center bg-green-50 rounded-2xl p-4 mb-3"
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="images" size={24} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">Chọn từ thư viện</Text>
                  <Text className="text-sm text-gray-600">Chọn ảnh có sẵn trong thiết bị</Text>
                </View>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setShowImageOptions(false)}
                className="bg-gray-100 rounded-2xl p-4 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-gray-700">Hủy</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default AIChatBotPage;
