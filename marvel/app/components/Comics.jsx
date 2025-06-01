// import React, { useEffect, useState, useContext } from "react";               // React core + hooks
// import {
//   View,                                                                    // basic container
//   FlatList,                                                                // performant scroll list
//   ScrollView,                                                              // scrollable container
//   Image,                                                                   // image display
//   Text,                                                                    // text display
//   TouchableOpacity                                                         // touchable wrapper
// } from "react-native";
// import axios from "axios";                                                  // HTTP client
// import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper"; // UI components
// import { FontAwesome } from "@expo/vector-icons";                            // icon pack
// import { SavedContext } from "../context/savedContext";                     // global saved-items context
// import ComicCard from "../components/ComicCard";                            // our card component

// // Fallback if no thumbnail present
// const PLACEHOLDER_URI = "https://your-cdn.com/placeholder.png";

// // Ensure HTTPS on thumbnail URLs
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return PLACEHOLDER_URI;                                   // no thumbnail → placeholder
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")                             // force https
//     : thumbnail.path;                                                       // already https
//   return `${path}.${thumbnail.extension}`;                                   // add extension
// };

// export default function Comics() {
//   const [comics, setComics] = useState([]);                                  // list of comics
//   const [showAll, setShowAll] = useState(false);                             // toggle all vs slice
//   const [visibleComics, setVisibleComics] = useState(10);                    // how many to show
//   const [open, setOpen] = useState(false);                                   // dialog open?
//   const [selectedComic, setSelectedComic] = useState(null);                  // which comic in dialog
//   const [recommendations, setRecommendations] = useState([]);                // AI recs
//   const [recommendationsLoading, setRecommendationsLoading] = useState(false);// loading recs

//   const { savedItems, toggleSaveItem } = useContext(SavedContext);           // saved context

//   // fetch comics on mount
//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await axios.get(
//           `${process.env.EXPO_PUBLIC_BASE_URL}/comics`
//         );
//         setComics(data);                                                     // store comics
//       } catch (err) {
//         console.error("Error fetching comics:", err);
//       }
//     })();
//   }, []);

//   // check if a comic is saved
//   const isComicSaved = (id) => savedItems.some((c) => c.id === id);

//   // toggle between showing all or just the first 10
//   const toggleView = () => {
//     setShowAll((prev) => {
//       const next = !prev;
//       setVisibleComics(next ? comics.length : 10);                          // update count
//       return next;
//     });
//   };

//   // fetch AI recommendations for a comic
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
//       setRecommendations(res.data.recommendations);                         // store recs
//     } catch (err) {
//       console.error("Failed to fetch recommendations:", err);
//     } finally {
//       setRecommendationsLoading(false);                                    
//     }
//   };

//   // open dialog for a specific comic
//   const handleClickOpen = (comic) => {
//     setSelectedComic(comic);                                                
//     setOpen(true);                                                         
//     setRecommendations([]);                                                
//     fetchComicRecommendations(comic);                                      
//   };

//   // close the dialog & clear state
//   const handleClose = () => {
//     setOpen(false);                                                        
//     setSelectedComic(null);                                                
//     setRecommendations([]);                                                
//   };

//   return (
//     // full screen + padding
//     <View className="flex-1 p-4">
//       {/* Header */}
//       <View className="flex-row justify-between items-center">
//         <Text className="text-xl font-semibold text-gray-700">
//           Discover{" "}
//           <Text className="font-bold text-black">Comics</Text>
//         </Text>
//         <Button mode="contained" onPress={toggleView}>
//           {showAll ? "View Less" : "View All"}
//         </Button>
//       </View>

//       {/* Comics list */}
//       <View className="mt-4">
//         <FlatList
//           data={comics.slice(0, visibleComics)}                            // slice or full
//           keyExtractor={(item) => item.id.toString()}                      
//           horizontal                                                         // horizontal scroll
//           showsHorizontalScrollIndicator={false}                            
//           ItemSeparatorComponent={() => <View className="w-4" />}           // gap
//           renderItem={({ item }) => (
//             <ComicCard
//               item={item}
//               onOpen={handleClickOpen}                                     
//               onToggleSave={toggleSaveItem}                                
//               isSaved={isComicSaved}                                       
//             />
//           )}
//         />
//       </View>

//       {/* Modal/Dialog */}
//       <Portal>
//         <Dialog visible={open} onDismiss={handleClose}>
//           {/* Modal header */}
//           <View className="flex-row justify-between items-center px-4 pt-4">
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
//                 {/* Comic image */}
//                 <Image
//                   source={{ uri: getSecureImageUrl(selectedComic.thumbnail) }}
//                   className="w-full h-60 rounded-lg mb-2"
//                   resizeMode="cover"                                        // fill container
//                 />

//                 {/* Description */}
//                 <Text className="my-2">
//                   {selectedComic.description || "No description available"}
//                 </Text>

//                 {/* Recommendations header */}
//                 <Text className="text-lg font-bold my-2">
//                   You Might Also Like
//                 </Text>

//                 {recommendationsLoading ? (
//                   <ActivityIndicator />
//                 ) : (
//                   <FlatList
//                     data={recommendations}
//                     horizontal
//                     keyExtractor={(_, i) => i.toString()}
//                     showsHorizontalScrollIndicator={false}
//                     ItemSeparatorComponent={() => <View className="w-2" />}
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







// screens/Comics.js

import React, { useEffect, useState, useContext } from "react";
import {
  View,            // basic container
  FlatList,        // performant scroll list
  ScrollView,      // scrollable container
  Image,           // image display
  Text,            // text display
  TouchableOpacity // touchable wrapper
} from "react-native";
import axios from "axios";                                                    // HTTP client
import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper"; // UI components
import { FontAwesome } from "@expo/vector-icons";                              // icon pack
import { SavedContext } from "../context/savedContext";                       // global saved-items context
import ComicCard from "../components/ComicCard";                              // our card component

// Locally bundled placeholder image
const localPlaceholder = require("../../assets/images/placeholder.png");

// Ensure HTTPS on thumbnail URLs; return null if no thumbnail
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return null; // no thumbnail → we'll use localPlaceholder instead
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:") // force https
    : thumbnail.path;                           // already https
  return `${path}.${thumbnail.extension}`;      // add extension
};

export default function Comics() {
  const [comics, setComics] = useState([]);                                   // list of comics
  const [showAll, setShowAll] = useState(false);                              // toggle all vs slice
  const [visibleComics, setVisibleComics] = useState(10);                     // how many to show
  const [open, setOpen] = useState(false);                                    // dialog open?
  const [selectedComic, setSelectedComic] = useState(null);                   // which comic in dialog
  const [recommendations, setRecommendations] = useState([]);                 // AI recs
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);// loading recs

  const { savedItems, toggleSaveItem } = useContext(SavedContext);            // saved context

  // fetch comics on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/comics`
        );
        setComics(data);                                                     // store comics
      } catch (err) {
        console.error("Error fetching comics:", err);
      }
    })();
  }, []);

  // check if a comic is saved
  const isComicSaved = (id) => savedItems.some((c) => c.id === id);

  // toggle between showing all or just the first 10
  const toggleView = () => {
    setShowAll((prev) => {
      const next = !prev;
      setVisibleComics(next ? comics.length : 10);                          // update count
      return next;
    });
  };

  // fetch AI recommendations for a comic
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
      setRecommendations(res.data.recommendations);                         // store recs
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // open dialog for a specific comic
  const handleClickOpen = (comic) => {
    setSelectedComic(comic);
    setOpen(true);
    setRecommendations([]);
    fetchComicRecommendations(comic);
  };

  // close the dialog & clear state
  const handleClose = () => {
    setOpen(false);
    setSelectedComic(null);
    setRecommendations([]);
  };

  return (
    <View className="flex-1 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-semibold text-gray-700">
          Discover <Text className="font-bold text-black">Comics</Text>
        </Text>
        <Button mode="contained" onPress={toggleView}>
          {showAll ? "View Less" : "View All"}
        </Button>
      </View>

      {/* Comics list */}
      <View className="mt-4">
        <FlatList
          data={comics.slice(0, visibleComics)}                          // slice or full
          keyExtractor={(item) => item.id.toString()}
          horizontal                                                     // horizontal scroll
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-4" />}         // gap
          renderItem={({ item }) => (
            <ComicCard
              item={item}
              onOpen={handleClickOpen}
              onToggleSave={toggleSaveItem}
              isSaved={isComicSaved}
            />
          )}
        />
      </View>

      {/* Modal/Dialog */}
      <Portal>
        <Dialog visible={open} onDismiss={handleClose}>
          {/* Modal header */}
          <View className="flex-row justify-between items-center px-4 pt-4">
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
                {/* Comic image with placeholder fallback */}
                <Image
                  source={
                    getSecureImageUrl(selectedComic.thumbnail)
                      ? { uri: getSecureImageUrl(selectedComic.thumbnail) }
                      : localPlaceholder
                  }
                  className="w-full h-60 rounded-lg mb-2"
                  resizeMode="cover"  // fill container while preserving aspect
                />

                {/* Description */}
                <Text className="my-2">
                  {selectedComic.description || "No description available"}
                </Text>

                {/* Recommendations header */}
                <Text className="text-lg font-bold my-2">
                  You Might Also Like
                </Text>

                {recommendationsLoading ? (
                  <ActivityIndicator />
                ) : (
                  <FlatList
                    data={recommendations}
                    horizontal
                    keyExtractor={(_, i) => i.toString()}
                    showsHorizontalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View className="w-2" />}
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