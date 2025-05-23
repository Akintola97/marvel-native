import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TapGestureHandler } from "react-native-gesture-handler";

// Helper to force HTTPS on thumbnails
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return "";
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function CharacterCard({
  item,
  onOpen,
  onToggleSave,
  isSaved
}) {
  const singleTapRef = useRef();
  const doubleTapRef = useRef();

  return (
    <View style={{ width: 160, marginRight: 16 }}>
      <View style={styles.cardWrapper}>
        {/* Only the image container is wrapped in gesture handlers */}
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
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: getSecureImageUrl(item.thumbnail) }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.overlay} />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

        {/* Heart icon sits above the image and captures its own taps */}
        <TouchableOpacity
          onPress={() => onToggleSave(item)}
          style={styles.heartIconContainer}
        >
          {isSaved(item.id) ? (
            <FontAwesome name="heart" size={24} color="red" />
          ) : (
            <FontAwesome name="heart-o" size={24} color="red" />
          )}
        </TouchableOpacity>
      </View>

      {/* Title is outside any gesture handler */}
      <Text style={styles.cardTitle}>{item.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
    width: "100%",
    height: 240,
    borderRadius: 8,
    overflow: "hidden"
  },
  imageContainer: {
    flex: 1
  },
  cardImage: {
    width: "100%",
    height: "100%"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)"
  },
  heartIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10
  },
  cardTitle: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    color: "#2D3748"
  }
});