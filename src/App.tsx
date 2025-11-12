import "@/global.css";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AccountManagementPage from "./pages/AccountManagementPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import AllRecipesPage from "./pages/AllRecipesPage";
import MainTabs from "./navigation/MainTabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, RootState } from "./redux/store";
import { ActivityIndicator, View, Text } from "react-native";
import Toast from "react-native-toast-message";
import { useAppDispatch } from "./redux/hooks";
import { fetchRecipes } from "./redux/slices/recipeSlice";

const Stack = createNativeStackNavigator();

// Custom Toast config để hiển thị đủ text
const toastConfig = {
  success: (props: any) => (
    <View className="bg-green-500 mx-4 p-4 rounded-2xl shadow-lg" style={{ maxWidth: '90%', minWidth: 300 }}>
      <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
      <Text className="text-white text-sm" numberOfLines={5}>{props.text2}</Text>
    </View>
  ),
  error: (props: any) => (
    <View className="bg-red-500 mx-4 p-4 rounded-2xl shadow-lg" style={{ maxWidth: '90%', minWidth: 300 }}>
      <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
      <Text className="text-white text-sm" numberOfLines={5}>{props.text2}</Text>
    </View>
  ),
  info: (props: any) => (
    <View className="bg-blue-500 mx-4 p-4 rounded-2xl shadow-lg" style={{ maxWidth: '90%', minWidth: 300 }}>
      <Text className="text-white font-bold text-base mb-1">{props.text1}</Text>
      <Text className="text-white text-sm" numberOfLines={5}>{props.text2}</Text>
    </View>
  ),
};

// Component Navigation riêng để có thể sử dụng Redux hooks
function AppNavigation() {
  const dispatch = useAppDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { recipes } = useSelector((state: RootState) => state.recipes);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Fetch recipes ngay khi app khởi động (chỉ fetch nếu chưa có data)
  useEffect(() => {
    if (recipes.length === 0) {
      console.log('🚀 App started - Fetching all recipes...');
      dispatch(fetchRecipes());
    } else {
      console.log('✅ Recipes already loaded:', recipes.length, 'recipes');
    }
  }, [dispatch, recipes.length]);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    if (user && token) {
      setInitialRoute("Home");
    } else {
      setInitialRoute("Login");
    }
  }, [user, token]);

  // Chờ xác định initial route
if (!initialRoute) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#F97316" />
    </View>
  );
}


  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="AccountManagement" component={AccountManagementPage} />
        <Stack.Screen name="Notifications" component={NotificationsPage} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailPage} />
        <Stack.Screen name="Favorites" component={FavoritesPage} />
        <Stack.Screen name="MyReviews" component={MyReviewsPage} />
        <Stack.Screen name="Settings" component={SettingsPage} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyPage} />
        <Stack.Screen name="Contact" component={ContactPage} />
        <Stack.Screen 
          name="AllRecipes" 
          component={AllRecipesPage}
          options={{
            animation: "fade_from_bottom",
          }}
        />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        } 
        persistor={persistor}
      >
        <SafeAreaProvider>
          <AppNavigation />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}