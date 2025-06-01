import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TapGestureHandler } from "react-native-gesture-handler";

// Locally bundled placeholder image
const localPlaceholder = require("../../assets/images/placeholder.png");

// Force HTTPS & build full URL if thumbnail exists
const getSecureImageUrl = (thumbnail) => {
  // If there's no thumbnail object, return null so we fall back to localPlaceholder
  if (!thumbnail) {
    return null;
  }

  // Otherwise, ensure it's HTTPS
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function ComicCard({ item, onOpen, onToggleSave, isSaved }) {
  const singleTapRef = useRef();
  const doubleTapRef = useRef();

  // Attempt to build a remote URL; if getSecureImageUrl returns null, we'll use the local placeholder
  const remoteUri = getSecureImageUrl(item.thumbnail);

  // Decide which source to hand to <Image>
  // • If `remoteUri` is non-null, wrap it in { uri: remoteUri } 
  // • Otherwise use localPlaceholder (the require(...) object)
  const imageSource = remoteUri
    ? { uri: remoteUri }
    : localPlaceholder;

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
              {/* Render either the TMDB image or your local placeholder */}
              <Image
                source={imageSource}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        {/* Heart icon with dark backdrop */}
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