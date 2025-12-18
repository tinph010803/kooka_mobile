import "@/global.css";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AccountManagementPage from "./pages/AccountManagementPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import AllRecipesPage from "./pages/AllRecipesPage";
import { NotificationPage } from "./pages/NotificationPage";
import SuggestRecipePage from "./pages/SuggestRecipePage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import MainTabs from "./navigation/MainTabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Provider, useSelector, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, RootState } from "./redux/store";
import { ActivityIndicator, View, Text } from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthData } from "./redux/slices/authSlice";

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
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi app khởi động
    const checkAuthStatus = async () => {
      try {
        if (user && token) {
          // Verify token bằng cách gọi API
          const axiosInstance = (await import('./utils/axiosInstance')).default;
          await axiosInstance.get("/auth/verify");
          setInitialRoute("Home");
        } else {
          setInitialRoute("Login");
        }
      } catch (error) {
        // Token không hợp lệ hoặc hết hạn
        setInitialRoute("Login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [user, token]);

  // Handle deep linking for Google OAuth callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log("Deep link received:", url);
      
      // Parse the URL: kookamobile://auth/google/callback?token=XXX&user=YYY
      const parsed = Linking.parse(url);
      
      // Check if this is a Google OAuth callback
      if (parsed.path === "auth/google/callback") {
        const params = parsed.queryParams;
        const token = params?.token as string;
        const userJson = params?.user as string;
        const error = params?.error as string;
        
        // Handle error from backend
        if (error) {
          console.error("❌ Google login failed:", error);
          Toast.show({
            type: "error",
            text1: "Đăng nhập thất bại",
            text2: error === "auth_failed" ? "Xác thực Google thất bại" : error,
          });
          return;
        }
        
        // Handle success
        if (token && userJson) {
          try {
            // Save token to AsyncStorage
            await AsyncStorage.setItem("token", token);
            
            // Parse user data
            const userData = JSON.parse(decodeURIComponent(userJson));
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            
            // Dispatch to Redux store
            dispatch(setAuthData({ user: userData, token }));
            
            console.log("✅ Login thành công!");
            
            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Đăng nhập Google thành công!",
            });
          } catch (error) {
            console.error("❌ Lỗi khi xử lý login:", error);
            Toast.show({
              type: "error",
              text1: "Lỗi",
              text2: "Không thể xử lý đăng nhập Google",
            });
          }
        }
      }
    };

    // Listen for deep links when app is open
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle initial deep link when app is opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  // Chờ xác định initial route
  if (isCheckingAuth || !initialRoute) {
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
        <Stack.Screen
          name="Notifications"
          component={NotificationPage}
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="SuggestRecipe"
          component={SuggestRecipePage}
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="MySubmissions"
          component={MySubmissionsPage}
          options={{
            animation: "slide_from_right",
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