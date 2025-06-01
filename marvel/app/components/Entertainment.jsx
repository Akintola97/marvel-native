// import React, { useEffect, useState, useContext } from "react";
// import {
//   View,
//   FlatList,
//   ScrollView,
//   Image,
//   Text,
//   TouchableOpacity,
//   Dimensions,
// } from "react-native";
// import axios from "axios";
// import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper";
// import YoutubePlayer from "react-native-youtube-iframe";
// import { FontAwesome } from "@expo/vector-icons";
// import { SavedContext } from "../context/savedContext";
// import EntertainmentCard from "../components/EntertainmentCard";

// const screenWidth = Dimensions.get("window").width;
// const playerWidth = screenWidth - 32;
// const playerHeight = (playerWidth * 9) / 16;

// export default function Entertainment() {
//   const [entertainment, setEntertainment] = useState([]);
//   const [showAll, setShowAll] = useState(false);
//   const [visible, setVisible] = useState(10);
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [recommendations, setRecommendations] = useState([]);
//   const [recoLoading, setRecoLoading] = useState(false);
//   const [trailerKey, setTrailerKey] = useState(null);

//   const { savedItems, toggleSaveItem } = useContext(SavedContext);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await axios.get(
//           `${process.env.EXPO_PUBLIC_BASE_URL}/entertainment`
//         );
//         setEntertainment(data);
//       } catch (err) {
//         console.error("Error fetching entertainment:", err);
//       }
//     })();
//   }, []);

//   const isSaved = (id) => savedItems.some((item) => item.id === id);

//   const toggleView = () => {
//     setShowAll((prev) => {
//       const next = !prev;
//       setVisible(next ? entertainment.length : 10);
//       return next;
//     });
//   };

//   const fetchTrailer = async (item) => {
//     const tmdbId = item.id ?? item.details?.id;
//     if (!tmdbId) return;
//     const mediaType = (item.type ?? "").toLowerCase().includes("tv")
//       ? "tv"
//       : "movie";
//     try {
//       const res = await axios.post("https://hero.boltluna.io/api/trailer", {
//         media_type: mediaType,
//         id: tmdbId,
//       });
//       setTrailerKey(res.data.trailerKey);
//     } catch (err) {
//       console.error("Error fetching trailer:", err);
//     }
//   };

//   const fetchRecommendations = async (item) => {
//     setRecoLoading(true);
//     try {
//       const { data } = await axios.post(
//         "https://hero.boltluna.io/api/entertainmentrecommendation",
//         {
//           itemDetails: {
//             title: item.title || item.name,
//             type: item.type,
//             description: item.overview || item.description || "",
//           },
//         }
//       );
//       const recs = data.recommendations.map((r) => ({
//         ...r,
//         id: r.id ?? r.details?.id,
//         overview: r.overview ?? r.details?.overview,
//         poster_path: r.poster_path ?? r.details?.poster_path,
//       }));
//       setRecommendations(recs);
//     } catch (err) {
//       console.error("Failed to fetch recommendations:", err);
//     } finally {
//       setRecoLoading(false);
//     }
//   };

//   const handleOpen = (item) => {
//     setSelected(item);
//     setOpen(true);
//     setRecommendations([]);
//     setTrailerKey(null);
//     fetchTrailer(item);
//     fetchRecommendations(item);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelected(null);
//     setRecommendations([]);
//     setTrailerKey(null);
//   };

//   return (
//     <View className="p-4 flex-1 bg-gray-100">
//       {/* Header */}
//       <View className="flex-row justify-between items-center">
//         <Text className="text-2xl font-semibold text-gray-600">
//           Browse Featured <Text className="font-bold text-black">Titles</Text>
//         </Text>
//         <Button mode="contained" onPress={toggleView}>
//           {showAll ? "View Less" : "View All"}
//         </Button>
//       </View>

//       {/* Main list */}
//       <FlatList
//         data={entertainment.slice(0, visible)}
//         keyExtractor={(item) => item.id.toString()}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
//         ItemSeparatorComponent={() => <View className="w-4" />}
//         renderItem={({ item }) => (
//           <EntertainmentCard
//             item={item}
//             onOpen={handleOpen}
//             onToggleSave={toggleSaveItem}
//             isSaved={isSaved}
//           />
//         )}
//       />

//       {/* Modal */}
//       <Portal>
//         <Dialog
//           visible={open}
//           onDismiss={handleClose}
//           className="w-11/12 self-center"
//         >
//           <View className="flex-row justify-between items-center px-4 pt-4">
//             <Dialog.Title>
//               {selected?.title || selected?.name}
//             </Dialog.Title>
//             {selected && (
//               <TouchableOpacity onPress={() => toggleSaveItem(selected)}>
//                 <FontAwesome
//                   name={isSaved(selected.id) ? "heart" : "heart-o"}
//                   size={24}
//                   color="red"
//                 />
//               </TouchableOpacity>
//             )}
//           </View>

//           <Dialog.Content>
//             {selected && (
//               <ScrollView>
//                 {trailerKey ? (
//                   <YoutubePlayer
//                     height={playerHeight}
//                     width={playerWidth}
//                     play={false}
//                     videoId={trailerKey}
//                   />
//                 ) : selected.poster_path ? (
//                   <Image
//                     source={{
//                       uri: `https://image.tmdb.org/t/p/original${selected.poster_path}`,
//                     }}
//                     className="self-center rounded-lg mb-4"
//                     style={{ width: playerWidth, height: playerHeight }}
//                     resizeMode="cover"
//                   />
//                 ) : (
//                   <View
//                     className="self-center justify-center items-center rounded-lg mb-4"
//                     style={{
//                       width: playerWidth,
//                       height: playerHeight,
//                       backgroundColor: "#E2E8F0",
//                     }}
//                   >
//                     <Text>No image available</Text>
//                   </View>
//                 )}

//                 <Text className="my-2">
//                   {selected.overview ||
//                     selected.description ||
//                     "No description available"}
//                 </Text>

//                 <Text className="text-lg font-bold my-2">
//                   You Might Also Like
//                 </Text>

//                 {recoLoading ? (
//                   <ActivityIndicator />
//                 ) : (
//                   <FlatList
//                     data={recommendations}
//                     horizontal
//                     keyExtractor={(_, i) => i.toString()}
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={{ paddingHorizontal: 8 }}
//                     ItemSeparatorComponent={() => <View className="w-2" />}
//                     renderItem={({ item }) => (
//                       <EntertainmentCard
//                         item={item}
//                         onOpen={handleOpen}
//                         onToggleSave={toggleSaveItem}
//                         isSaved={isSaved}
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



// screens/Entertainment.js

import React, { useEffect, useState, useContext } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import axios from "axios";
import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import YoutubePlayer from "react-native-youtube-iframe";
import { FontAwesome } from "@expo/vector-icons";
import { SavedContext } from "../context/savedContext";
import EntertainmentCard from "../components/EntertainmentCard";

// Import your local placeholder image
const localPlaceholder = require("../../assets/images/placeholder.png");

const screenWidth = Dimensions.get("window").width;
const playerWidth = screenWidth - 32;
const playerHeight = (playerWidth * 9) / 16;

export default function Entertainment() {
  const [entertainment, setEntertainment] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [visible, setVisible] = useState(10);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  const { savedItems, toggleSaveItem } = useContext(SavedContext);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/entertainment`
        );
        setEntertainment(data);
      } catch (err) {
        console.error("Error fetching entertainment:", err);
      }
    })();
  }, []);

  const isSaved = (id) => savedItems.some((item) => item.id === id);

  const toggleView = () => {
    setShowAll((prev) => {
      const next = !prev;
      setVisible(next ? entertainment.length : 10);
      return next;
    });
  };

  const fetchTrailer = async (item) => {
    const tmdbId = item.id ?? item.details?.id;
    if (!tmdbId) return;
    const mediaType = (item.type ?? "").toLowerCase().includes("tv")
      ? "tv"
      : "movie";
    try {
      const res = await axios.post("https://hero.boltluna.io/api/trailer", {
        media_type: mediaType,
        id: tmdbId,
      });
      setTrailerKey(res.data.trailerKey);
    } catch (err) {
      console.error("Error fetching trailer:", err);
    }
  };

  const fetchRecommendations = async (item) => {
    setRecoLoading(true);
    try {
      const { data } = await axios.post(
        "https://hero.boltluna.io/api/entertainmentrecommendation",
        {
          itemDetails: {
            title: item.title || item.name,
            type: item.type,
            description: item.overview || item.description || "",
          },
        }
      );
      const recs = data.recommendations.map((r) => ({
        ...r,
        id: r.id ?? r.details?.id,
        overview: r.overview ?? r.details?.overview,
        poster_path: r.poster_path ?? r.details?.poster_path,
      }));
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setRecoLoading(false);
    }
  };

  const handleOpen = (item) => {
    setSelected(item);
    setOpen(true);
    setRecommendations([]);
    setTrailerKey(null);
    fetchTrailer(item);
    fetchRecommendations(item);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setRecommendations([]);
    setTrailerKey(null);
  };

  return (
    <View className="p-4 flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-semibold text-gray-600">
          Browse Featured <Text className="font-bold text-black">Titles</Text>
        </Text>
        <Button mode="contained" onPress={toggleView}>
          {showAll ? "View Less" : "View All"}
        </Button>
      </View>

      {/* Main list */}
      <FlatList
        data={entertainment.slice(0, visible)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
        ItemSeparatorComponent={() => <View className="w-4" />}
        renderItem={({ item }) => (
          <EntertainmentCard
            item={item}
            onOpen={handleOpen}
            onToggleSave={toggleSaveItem}
            isSaved={isSaved}
          />
        )}
      />

      {/* Modal */}
      <Portal>
        <Dialog
          visible={open}
          onDismiss={handleClose}
          className="w-11/12 self-center"
        >
          <View className="flex-row justify-between items-center px-4 pt-4">
            <Dialog.Title>
              {selected?.title || selected?.name}
            </Dialog.Title>
            {selected && (
              <TouchableOpacity onPress={() => toggleSaveItem(selected)}>
                <FontAwesome
                  name={isSaved(selected.id) ? "heart" : "heart-o"}
                  size={24}
                  color="red"
                />
              </TouchableOpacity>
            )}
          </View>

          <Dialog.Content>
            {selected && (
              <ScrollView>
                {trailerKey ? (
                  <YoutubePlayer
                    height={playerHeight}
                    width={playerWidth}
                    play={false}
                    videoId={trailerKey}
                  />
                ) : (
                  // Use Image with local placeholder fallback
                  <Image
                    source={
                      selected.poster_path
                        ? {
                            uri: `https://image.tmdb.org/t/p/original${selected.poster_path}`,
                          }
                        : localPlaceholder
                    }
                    className="self-center rounded-lg mb-4"
                    style={{ width: playerWidth, height: playerHeight }}
                    resizeMode="cover"
                  />
                )}

                <Text className="my-2">
                  {selected.overview ||
                    selected.description ||
                    "No description available"}
                </Text>

                <Text className="text-lg font-bold my-2">
                  You Might Also Like
                </Text>

                {recoLoading ? (
                  <ActivityIndicator />
                ) : (
                  <FlatList
                    data={recommendations}
                    horizontal
                    keyExtractor={(_, i) => i.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    ItemSeparatorComponent={() => <View className="w-2" />}
                    renderItem={({ item }) => (
                      <EntertainmentCard
                        item={item}
                        onOpen={handleOpen}
                        onToggleSave={toggleSaveItem}
                        isSaved={isSaved}
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