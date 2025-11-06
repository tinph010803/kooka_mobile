import "@/global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MainTabs from "./navigation/MainTabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();

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
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="Login" component={LoginPage} />
              <Stack.Screen name="Register" component={RegisterPage} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
              <Stack.Screen name="Home" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}