import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TapGestureHandler } from "react-native-gesture-handler";

// Fallback if no thumbnail
const PLACEHOLDER_URI = "https://your-cdn.com/placeholder.png";

// Force HTTPS & fallback
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) {
    return PLACEHOLDER_URI;
  }
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function ComicCard({ item, onOpen, onToggleSave, isSaved }) {
  const singleTapRef = useRef();
  const doubleTapRef = useRef();
  const uri = getSecureImageUrl(item.thumbnail);

  return (
    <View className="w-40 mr-4">
      <View className="relative w-full h-60 rounded-lg overflow-hidden">
        {/* Gesture handlers for single & double tap */}
        <TapGestureHandler
          ref={doubleTapRef}
          numberOfTaps={2}
          onActivated={() => onToggleSave(item)}
        >
          <TapGestureHandler
            ref={singleTapRef}
            numberOfTaps={1}
            waitFor={doubleTapRef}
            onActivated={() => onOpen(item)}
          >
            <View className="flex-1">
              {/* Ensure image always renders at full size */}
              <Image
                source={{ uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        {/* Heart icon with its own dark backdrop */}
        <TouchableOpacity
          onPress={() => onToggleSave(item)}
          className="absolute top-2 right-2 z-10"
        >
          <View className="bg-black bg-opacity-50 rounded-full p-1">
            {isSaved(item.id) ? (
              <FontAwesome name="heart" size={20} color="white" />
            ) : (
              <FontAwesome name="heart-o" size={20} color="white" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Text className="mt-2 text-center font-semibold text-gray-800">
        {item.title}
      </Text>
    </View>
  );
}
