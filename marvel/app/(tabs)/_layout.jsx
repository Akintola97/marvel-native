import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Hide labels
        tabBarShowLabel: false,
        // Tab bar container styling
        tabBarStyle: {
          position: "absolute",
          bottom: 2,
          left: 16,
          right: 16,
          height: 70,
          backgroundColor: "#fff",
          borderRadius: 12,
          // Elevation/shadow for Android
          elevation: 4,
          // iOS shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        // Icon colors
        tabBarActiveTintColor: "#2563EB", // or your brand color
        tabBarInactiveTintColor: "#9CA3AF", // lighter gray
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "search-sharp" : "search-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Saved Tab */}
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}