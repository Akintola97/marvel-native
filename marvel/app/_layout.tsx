import { Stack } from "expo-router";
import "./global.css";
import { PaperProvider } from "react-native-paper";
import { SavedProvider } from "./context/savedContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <PaperProvider>
        <SavedProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SavedProvider>
    </PaperProvider>
    </GestureHandlerRootView>
  );
}
