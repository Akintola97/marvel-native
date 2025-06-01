import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TapGestureHandler } from "react-native-gesture-handler";

const localPlaceholder = require("../../assets/images/placeholder.png");

// Helper to force HTTPS on thumbnails; returns null when no thumbnail
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return null;
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function CharacterCard({ item, onOpen, onToggleSave, isSaved }) {
  const singleTapRef = useRef();
  const doubleTapRef = useRef();

  // Try to build a remote URI; fall back to null if no thumbnail
  const remoteUri = getSecureImageUrl(item.thumbnail);

  // If remoteUri exists, use { uri: remoteUri }, otherwise use the local placeholder
  const imageSource = remoteUri ? { uri: remoteUri } : localPlaceholder;

  return (
    <View className="w-40 mr-4">
      <View className="relative w-full h-60 rounded-lg overflow-hidden">
        {/* Double‑tap to save, single‑tap to open */}
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
              {/* Render either the TMDB image or your local placeholder */}
              <Image
                source={imageSource}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        {/* Heart icon with semi‑transparent backdrop */}
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
        {item.name}
      </Text>
    </View>
  );
}