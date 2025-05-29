import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TapGestureHandler } from "react-native-gesture-handler";

export default function EntertainmentCard({
  item,
  onOpen,
  onToggleSave,
  isSaved
}) {
  const singleTapRef = useRef();
  const doubleTapRef = useRef();
  const uri = `https://image.tmdb.org/t/p/original${item.poster_path}`;

  return (
    <View className="w-40 mr-4 pb-10">
      <View className="relative w-full h-60 rounded-lg overflow-hidden mb-2">
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
              {/* Fallback to explicit sizing in case Tailwind classes don’t apply */}
              <Image
                source={{ uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        {/* Heart icon with its own semi‑transparent backdrop */}
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

      <Text className="text-center font-semibold text-gray-800">
        {item.title || item.name}
      </Text>
    </View>
  );
}
