// import React, { useEffect, useState, useContext } from "react";
// import {
//   View,
//   FlatList,
//   ScrollView,
//   Image,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import axios from "axios";
// import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper";
// import { FontAwesome } from "@expo/vector-icons";
// import { SavedContext } from "../context/savedContext";
// import ComicCard from "../components/ComicCard";

// // Helper to force HTTPS on thumbnails
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return "";
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")
//     : thumbnail.path;
//   return `${path}.${thumbnail.extension}`;
// };

// export default function Comics() {
//   const [comics, setComics] = useState([]);
//   const [showAll, setShowAll] = useState(false);
//   const [visibleComics, setVisibleComics] = useState(10);
//   const [open, setOpen] = useState(false);
//   const [selectedComic, setSelectedComic] = useState(null);
//   const [recommendations, setRecommendations] = useState([]);
//   const [recommendationsLoading, setRecommendationsLoading] = useState(false);

//   const { savedItems, toggleSaveItem } = useContext(SavedContext);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await axios.get(
//           // "https://hero.boltluna.io/api/comics"
//           `${process.env.EXPO_PUBLIC_BASE_URL}/comics`

//         );
//         setComics(data);
//       } catch (err) {
//         console.error("Error fetching comics:", err);
//       }
//     })();
//   }, []);

//   const isComicSaved = (id) => savedItems.some((c) => c.id === id);

//   const toggleView = () => {
//     setShowAll((prev) => {
//       const next = !prev;
//       setVisibleComics(next ? comics.length : 10);
//       return next;
//     });
//   };

//   const fetchComicRecommendations = async (comic) => {
//     setRecommendationsLoading(true);
//     try {
//       const res = await axios.post(
//         "https://hero.boltluna.io/api/comicrecommendation",
//         {
//           itemDetails: {
//             title: comic.title,
//             type: "Comic",
//             description: comic.description || "",
//           },
//         }
//       );
//       console.log("Recommendations:", res.data.recommendations);
//       setRecommendations(res.data.recommendations);
//     } catch (err) {
//       console.error("Failed to fetch recommendations:", err);
//     } finally {
//       setRecommendationsLoading(false);
//     }
//   };

//   const handleClickOpen = (comic) => {
//     setSelectedComic(comic);
//     setOpen(true);
//     setRecommendations([]);
//     fetchComicRecommendations(comic);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelectedComic(null);
//     setRecommendations([]);
//   };

//   return (
//     <View style={{ padding: 16, flex: 1 }}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>
//           Discover <Text style={styles.titleBold}>Comics</Text>
//         </Text>
//         <Button mode="contained" onPress={toggleView}>
//           {showAll ? "View Less" : "View All"}
//         </Button>
//       </View>

//       {/* Comics list */}
//       <FlatList
//         data={comics.slice(0, visibleComics)}
//         keyExtractor={(item) => item.id.toString()}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
//         ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//         renderItem={({ item }) => (
//           <ComicCard
//             item={item}
//             onOpen={handleClickOpen}
//             onToggleSave={toggleSaveItem}
//             isSaved={isComicSaved}
//           />
//         )}
//       />

//       {/* Modal/Dialog */}
//       <Portal>
//         <Dialog visible={open} onDismiss={handleClose}>
//           {/* Modal header with heart icon */}
//           <View style={styles.modalHeader}>
//             <Dialog.Title>{selectedComic?.title}</Dialog.Title>
//             {selectedComic && (
//               <TouchableOpacity onPress={() => toggleSaveItem(selectedComic)}>
//                 {isComicSaved(selectedComic.id) ? (
//                   <FontAwesome name="heart" size={24} color="red" />
//                 ) : (
//                   <FontAwesome name="heart-o" size={24} color="red" />
//                 )}
//               </TouchableOpacity>
//             )}
//           </View>

//           <Dialog.Content>
//             {selectedComic && (
//               <ScrollView>
//                 <Image
//                   source={{
//                     uri: getSecureImageUrl(selectedComic.thumbnail),
//                   }}
//                   style={styles.modalImage}
//                   resizeMode="contain"
//                 />
//                 <Text style={styles.description}>
//                   {selectedComic.description || "No description available"}
//                 </Text>
//                 <Text style={styles.recommendHeader}>You Might Also Like</Text>
//                 {recommendationsLoading ? (
//                   <ActivityIndicator />
//                 ) : (
//                   <FlatList
//                     data={recommendations}
//                     horizontal
//                     keyExtractor={(_, i) => i.toString()}
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={{ paddingHorizontal: 8 }}
//                     renderItem={({ item }) => (
//                       <ComicCard
//                         item={item}
//                         onOpen={handleClickOpen}
//                         onToggleSave={toggleSaveItem}
//                         isSaved={isComicSaved}
//                       />
//                     )}
//                   />
//                 )}
//               </ScrollView>
//             )}
//           </Dialog.Content>

//           <Dialog.Actions>
//             <Button onPress={handleClose}>Close</Button>
//           </Dialog.Actions>
//         </Dialog>
//       </Portal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "600",
//     color: "#4A5568",
//   },
//   titleBold: {
//     fontWeight: "700",
//     color: "#000",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   modalImage: {
//     width: "100%",
//     height: undefined,
//     aspectRatio: 1,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   description: {
//     marginVertical: 8,
//   },
//   recommendHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginVertical: 8,
//   },
// });


// Comics.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { SavedContext } from "../context/savedContext";
import ComicCard from "../components/ComicCard";

// Fallback URI if no thumbnail present:
const PLACEHOLDER_URI = "https://your-cdn.com/placeholder.png";

// Helper to force HTTPS on thumbnails (returns placeholder if missing)
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) {
    return PLACEHOLDER_URI;
  }
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function Comics() {
  const [comics, setComics] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [visibleComics, setVisibleComics] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedComic, setSelectedComic] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const { savedItems, toggleSaveItem } = useContext(SavedContext);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/comics`
        );
        setComics(data);
      } catch (err) {
        console.error("Error fetching comics:", err);
      }
    })();
  }, []);

  const isComicSaved = (id) => savedItems.some((c) => c.id === id);

  const toggleView = () => {
    setShowAll((prev) => {
      const next = !prev;
      setVisibleComics(next ? comics.length : 10);
      return next;
    });
  };

  const fetchComicRecommendations = async (comic) => {
    setRecommendationsLoading(true);
    try {
      const res = await axios.post(
        "https://hero.boltluna.io/api/comicrecommendation",
        {
          itemDetails: {
            title: comic.title,
            type: "Comic",
            description: comic.description || "",
          },
        }
      );
      setRecommendations(res.data.recommendations);
      console.log("Recommendations:", res.data.recommendations);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleClickOpen = (comic) => {
    setSelectedComic(comic);
    setOpen(true);
    setRecommendations([]);
    fetchComicRecommendations(comic);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedComic(null);
    setRecommendations([]);
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Discover <Text style={styles.titleBold}>Comics</Text>
        </Text>
        <Button mode="contained" onPress={toggleView}>
          {showAll ? "View Less" : "View All"}
        </Button>
      </View>

      {/* Comics list */}
      <FlatList
        data={comics.slice(0, visibleComics)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        renderItem={({ item }) => (
          <ComicCard
            item={{
              ...item,
              // ensure every card has thumbnail data for the card-level tap image,
              // but ComicCard’s getSecureImageUrl already handles null too.
              thumbnail: item.thumbnail,
            }}
            onOpen={handleClickOpen}
            onToggleSave={toggleSaveItem}
            isSaved={isComicSaved}
          />
        )}
      />

      {/* Modal/Dialog */}
      <Portal>
        <Dialog visible={open} onDismiss={handleClose}>
          <View style={styles.modalHeader}>
            <Dialog.Title>{selectedComic?.title}</Dialog.Title>
            {selectedComic && (
              <TouchableOpacity onPress={() => toggleSaveItem(selectedComic)}>
                {isComicSaved(selectedComic.id) ? (
                  <FontAwesome name="heart" size={24} color="red" />
                ) : (
                  <FontAwesome name="heart-o" size={24} color="red" />
                )}
              </TouchableOpacity>
            )}
          </View>

          <Dialog.Content>
            {selectedComic && (
              <ScrollView>
                <Image
                  source={{
                    uri: getSecureImageUrl(selectedComic.thumbnail),
                  }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.description}>
                  {selectedComic.description || "No description available"}
                </Text>
                <Text style={styles.recommendHeader}>You Might Also Like</Text>
                {recommendationsLoading ? (
                  <ActivityIndicator />
                ) : (
                  <FlatList
                    data={recommendations}
                    horizontal
                    keyExtractor={(_, i) => i.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    renderItem={({ item }) => (
                      <ComicCard
                        item={item}
                        onOpen={handleClickOpen}
                        onToggleSave={toggleSaveItem}
                        isSaved={isComicSaved}
                      />
                    )}
                  />
                )}
              </ScrollView>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={handleClose}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A5568",
  },
  titleBold: {
    fontWeight: "700",
    color: "#000",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  description: {
    marginVertical: 8,
  },
  recommendHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 8,
  },
});
