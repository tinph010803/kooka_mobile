import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Search, Calendar, User, Bot } from "lucide-react-native";
import HomeTabPage from "../pages/HomeTabPage";
import SearchPage from "../pages/SearchPage";
import MealPlanPage from "../pages/MealPlanPage";
import ProfilePage from "../pages/ProfilePage";
import AIChatBotPage from "../pages/AIChatBotPage";
import colors from "tailwindcss/colors";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.orange[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabPage}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchPage}
        options={{
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatBotPage}
        options={{
          tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanPage}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
