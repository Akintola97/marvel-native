import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TapGestureHandler } from "react-native-gesture-handler";

const heroImage = require("../../assets/images/placeholder.png");

export default function EntertainmentCard({
  item,
  onOpen,
  onToggleSave,
  isSaved,
}) {
  const singleTapRef = useRef();
  const doubleTapRef = useRef();

  // Only build this URI if poster_path is non-null/non-empty
  const uri = item.poster_path
    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
    : null;

  return (
    <View className="w-40 mr-4 pb-10">
      <View className="relative w-full h-60 rounded-lg overflow-hidden mb-2">
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
              {uri ? (
                <Image
                  source={{ uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                // use the local placeholder when uri is null
                <Image
                  source={heroImage}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
      </View>

      {/* Title and save icon */}
      <TouchableOpacity onPress={() => onOpen(item)}>
        <Text
          className="text-sm font-medium text-gray-700 mb-1"
          numberOfLines={1}
        >
          {item.title || item.name}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onToggleSave(item)}>
        <FontAwesome
          name={isSaved(item.id) ? "heart" : "heart-o"}
          size={20}
          color="red"
        />
      </TouchableOpacity>
    </View>
  );
}