// import React, { useRef } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { TapGestureHandler } from "react-native-gesture-handler";

// // Helper to force HTTPS on thumbnails
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return "";
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")
//     : thumbnail.path;
//   return `${path}.${thumbnail.extension}`;
// };

// export default function ComicCard({
//   item,
//   onOpen,
//   onToggleSave,
//   isSaved
// }) {
//   const singleTapRef = useRef();
//   const doubleTapRef = useRef();

//   return (
//     <View style={{ width: 160, marginRight: 16 }}>
//       {/* wrap image area only */}
//       <View style={styles.cardWrapper}>
//         <TapGestureHandler
//           ref={doubleTapRef}
//           numberOfTaps={2}
//           onActivated={() => onToggleSave(item)}
//         >
//           <TapGestureHandler
//             ref={singleTapRef}
//             numberOfTaps={1}
//             waitFor={doubleTapRef}
//             onActivated={() => onOpen(item)}
//           >
//             <View style={styles.cardImageContainer}>
//               <Image
//                 source={{ uri: getSecureImageUrl(item.thumbnail) }}
//                 style={styles.cardImage}
//                 resizeMode="contain"
//               />
//               <View style={styles.overlay} />
//             </View>
//           </TapGestureHandler>
//         </TapGestureHandler>

//         {/* Heart icon sits on top, but outside the gesture handler */}
//         <TouchableOpacity
//           onPress={() => onToggleSave(item)}
//           style={styles.heartIconContainer}
//         >
//           {isSaved(item.id) ? (
//             <FontAwesome name="heart" size={24} color="red" />
//           ) : (
//             <FontAwesome name="heart-o" size={24} color="red" />
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Title is outside any gesture handler */}
//       <Text style={styles.cardTitle}>{item.title}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   cardWrapper: {
//     position: "relative",
//     width: "100%",
//     height: 240,
//     borderRadius: 8,
//     overflow: "hidden"
//   },
//   cardImageContainer: {
//     flex: 1
//   },
//   cardImage: {
//     width: "100%",
//     height: "100%"
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.25)"
//   },
//   heartIconContainer: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     zIndex: 10  // ensure it's above the overlay
//   },
//   cardTitle: {
//     marginTop: 8,
//     textAlign: "center",
//     fontWeight: "600",
//     color: "#2D3748"
//   }
// });



// ComicCard.js
import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
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

  // always non-empty
  const uri = getSecureImageUrl(item.thumbnail);

  return (
    <View style={{ width: 160, marginRight: 16 }}>
      <View style={styles.cardWrapper}>
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
            <View style={styles.cardImageContainer}>
              <Image
                source={{ uri }}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <View style={styles.overlay} />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>

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

      <Text style={styles.cardTitle}>{item.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
    width: "100%",
    height: 240,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardImageContainer: {
    flex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heartIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  cardTitle: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    color: "#2D3748",
  },
});