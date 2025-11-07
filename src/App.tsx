import "@/global.css";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AccountManagementPage from "./pages/AccountManagementPage";
import MainTabs from "./navigation/MainTabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor, RootState } from "./redux/store";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();

// Component Navigation riêng để có thể sử dụng Redux hooks
function AppNavigation() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

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
      </Stack.Navigator>
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