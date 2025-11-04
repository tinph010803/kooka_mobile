import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Search, PlusCircle, Bell, User } from "lucide-react-native";
import HomeTabPage from "../pages/HomeTabPage";
import SearchPage from "../pages/SearchPage";
import AddPage from "../pages/AddPage";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
import colors from "tailwindcss/colors";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Ẩn label, chỉ hiện icon
        tabBarActiveTintColor: colors.orange[500], // orange-500
        tabBarInactiveTintColor: colors.gray[400], // gray-400
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray[200], // gray-200
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
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
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddPage}
        options={{
          tabBarLabel: "Add",
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsPage}
        options={{
          tabBarLabel: "Notifications",
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
