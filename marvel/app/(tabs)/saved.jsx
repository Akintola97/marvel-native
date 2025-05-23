// import React, { useContext, useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   Modal,
//   SafeAreaView,
//   Dimensions,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { Button, ActivityIndicator } from "react-native-paper";
// import { SavedContext } from "../context/savedContext";

// // Helper function to force Marvel thumbnail URLs to HTTPS
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return "";
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")
//     : thumbnail.path;
//   return `${path}.${thumbnail.extension}`;
// };

// const Saved = () => {
//   const { savedItems, toggleSaveItem } = useContext(SavedContext);
//   const [filteredItems, setFilteredItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Determine the screen width
//   const screenWidth = Dimensions.get("window").width;
//   // Set itemsPerPage: if screen width exceeds 600, show 24 items per page; otherwise, show 6.
//   const itemsPerPage = screenWidth > 600 ? 24 : 6;

//   // Update filtered items when savedItems changes
//   useCallback(() => {
//     setFilteredItems(savedItems);
//   }, [savedItems]);

//   // Filter items by search query
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setFilteredItems(savedItems);
//     } else {
//       const lowerQuery = searchQuery.toLowerCase();
//       const filtered = savedItems.filter((item) => {
//         const title = (item.title || item.name || "").toLowerCase();
//         const description = (item.overview || item.description || "").toLowerCase();
//         return title.includes(lowerQuery) || description.includes(lowerQuery);
//       });
//       setFilteredItems(filtered);
//       setCurrentPage(1);
//     }
//   }, [searchQuery, savedItems]);

//   const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   // Modified to use getSecureImageUrl for Marvel items
//   const getImageUrl = (item) => {
//     if (item.poster_path) {
//       return `https://image.tmdb.org/t/p/original${item.poster_path}`;
//     } else if (item.thumbnail) {
//       return getSecureImageUrl(item.thumbnail);
//     }
//     return null;
//   };

//   const numColumns = screenWidth > 600 ? 6 : 2;

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => {
//         setSelectedItem(item);
//         setModalVisible(true);
//       }}
//       className="m-2 w-40 bg-white rounded-xl overflow-hidden shadow-md"
//     >
//       {getImageUrl(item) ? (
//         <Image
//           source={{ uri: getImageUrl(item) }}
//           className="w-full h-40"
//           resizeMode="cover"
//         />
//       ) : (
//         <View className="w-full h-40 bg-gray-300 items-center justify-center">
//           <Text className="text-gray-700">No Image</Text>
//         </View>
//       )}

//       <TouchableOpacity
//         onPress={() => toggleSaveItem(item)}
//         className="absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded-full"
//       >
//         <FontAwesome name="heart" size={22} color="red" />
//       </TouchableOpacity>

//       <View className="p-3">
//         <Text className="text-base font-semibold text-gray-800">
//           {item.title || item.name}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView className="flex-1">
//         <View className="flex-1 items-center justify-center">
//           <ActivityIndicator animating={true} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       {/* Add bottom padding so the pagination row won't be blocked by the tab bar */}
//       <View className="flex-1 p-5 pb-20">
//         {/* Header */}
//         <Text className="text-3xl font-bold text-gray-900 mb-5">
//           Saved Items
//         </Text>

//         {/* Search Input */}
//         <View className="mb-5">
//           <TextInput
//             placeholder="Search saved items..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             className="border border-gray-300 bg-white rounded-lg px-4 py-3 shadow"
//             placeholderTextColor="#a0aec0"
//           />
//         </View>

//         {filteredItems.length === 0 ? (
//           <View className="flex-1 items-center justify-center">
//             <Text className="text-lg text-gray-600">No saved items found</Text>
//           </View>
//         ) : (
//           <>
//             <FlatList
//               data={paginatedItems}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderItem}
//               numColumns={numColumns}
//               key={numColumns + "-" + itemsPerPage}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{
//                 alignItems: "center",
//                 paddingBottom: 80,
//               }}
//               className="mb-6"
//             />

//             {/* Pagination Row */}
//             <View className="flex-row justify-center items-center space-x-6">
//               <Button
//                 mode="text"
//                 disabled={currentPage === 1}
//                 onPress={() => handlePageChange(currentPage - 1)}
//               >
//                 Prev
//               </Button>
//               <Text className="text-base text-gray-800">
//                 {currentPage} / {totalPages}
//               </Text>
//               <Button
//                 mode="text"
//                 disabled={currentPage === totalPages}
//                 onPress={() => handlePageChange(currentPage + 1)}
//               >
//                 Next
//               </Button>
//             </View>
//           </>
//         )}

//         {/* Modal for item details */}
//         <Modal visible={modalVisible} transparent={true} animationType="slide">
//           <View className="flex-1 bg-black bg-opacity-60 justify-center p-4">
//             <View className="bg-white rounded-xl p-6">
//               {selectedItem && (
//                 <>
//                   <Text className="text-2xl font-bold text-gray-900 mb-4">
//                     {selectedItem.title || selectedItem.name}
//                   </Text>
//                   {getImageUrl(selectedItem) && (
//                     <Image
//                       source={{ uri: getImageUrl(selectedItem) }}
//                       style={{
//                         width: "100%",
//                         height: undefined, // Dynamic height
//                         aspectRatio: 1.0, // Adjust based on your image dimensions
//                         borderRadius: 8,
//                         marginBottom: 16,
//                       }}
//                       resizeMode="contain"
//                     />
//                   )}
//                   <Text className="text-base text-gray-700 mb-4">
//                     {selectedItem.overview ||
//                       selectedItem.description ||
//                       "No description available"}
//                   </Text>
//                   <Button mode="contained" onPress={() => setModalVisible(false)}>
//                     Close
//                   </Button>
//                 </>
//               )}
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Saved;





import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import axios from "axios";
import YoutubePlayer from "react-native-youtube-iframe";
import { FontAwesome } from "@expo/vector-icons";
import { Button, ActivityIndicator } from "react-native-paper";
import { SavedContext } from "../context/savedContext";

// Helper function to force Marvel thumbnail URLs to HTTPS
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return "";
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

const Saved = () => {
  const { savedItems, toggleSaveItem } = useContext(SavedContext);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New state for trailer key
  const [trailerKey, setTrailerKey] = useState(null);

  // Determine the screen width
  const screenWidth = Dimensions.get("window").width;
  // Set itemsPerPage: if screen width exceeds 600, show 24 items per page; otherwise, show 6.
  const itemsPerPage = screenWidth > 600 ? 20 : 6;
  
  // Responsive trailer dimensions (assuming 16:9 ratio)
  const trailerWidth = screenWidth - 32; // assuming 16px padding on each side within modal
  const trailerHeight = trailerWidth * (9 / 16);

  // Update filtered items when savedItems changes
  useCallback(() => {
    setFilteredItems(savedItems);
  }, [savedItems]);

  // Filter items by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(savedItems);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = savedItems.filter((item) => {
        const title = (item.title || item.name || "").toLowerCase();
        const description = (item.overview || item.description || "").toLowerCase();
        return title.includes(lowerQuery) || description.includes(lowerQuery);
      });
      setFilteredItems(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, savedItems]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Modified to use getSecureImageUrl for Marvel items
  const getImageUrl = (item) => {
    if (item.poster_path) {
      return `https://image.tmdb.org/t/p/original${item.poster_path}`;
    } else if (item.thumbnail) {
      return getSecureImageUrl(item.thumbnail);
    }
    return null;
  };

  const numColumns = screenWidth > 600 ? 5 : 2;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}
      style={{
        margin: 8,
        width: 160,
        backgroundColor: "#fff",
        borderRadius: 8,
        overflow: "hidden",
        elevation: 2,
      }}
    >
      {getImageUrl(item) ? (
        <Image
          source={{ uri: getImageUrl(item) }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: "100%", height: 160, backgroundColor: "#ccc", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#555" }}>No Image</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => toggleSaveItem(item)}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: 4,
          borderRadius: 16,
        }}
      >
        <FontAwesome name="heart" size={22} color="red" />
      </TouchableOpacity>

      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
          {item.title || item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Fetch trailer key for selected item when selectedItem changes
  const fetchTrailerKey = async (item) => {
    try {
      const res = await axios.post("https://hero.boltluna.io/api/trailer", {
        media_type: item?.type,
        id: item?.id,
      });
      setTrailerKey(res.data.trailerKey);
    } catch (error) {
      console.error("Error fetching trailer key:", error);
      setTrailerKey(null);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      // Reset trailer key before fetching
      setTrailerKey(null);
      fetchTrailerKey(selectedItem);
    }
  }, [selectedItem]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator animating={true} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Main Content */}
      <View style={{ flex: 1, padding: 20, paddingBottom: 80 }}>
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 20 }}>
          Saved Items
        </Text>

        {/* Search Input */}
        <View style={{ marginBottom: 20 }}>
          <TextInput
            placeholder="Search saved items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              backgroundColor: "#fff",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
            placeholderTextColor="#888"
          />
        </View>

        {filteredItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18, color: "#666" }}>No saved items found</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={paginatedItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              numColumns={numColumns}
              key={numColumns + "-" + itemsPerPage}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
                paddingBottom: 80,
              }}
              style={{ marginBottom: 20 }}
            />

            {/* Pagination Row */}
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Button
                mode="text"
                disabled={currentPage === 1}
                onPress={() => handlePageChange(currentPage - 1)}
              >
                Prev
              </Button>
              <Text style={{ fontSize: 16, color: "#333", marginHorizontal: 10 }}>
                {currentPage} / {totalPages}
              </Text>
              <Button
                mode="text"
                disabled={currentPage === totalPages}
                onPress={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </View>
          </>
        )}

        {/* Modal for item details */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 16 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 16 }}>
              {selectedItem && (
                <>
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 16 }}>
                    {selectedItem.title || selectedItem.name}
                  </Text>
                  {/* Trailer logic: if trailerKey available, show YoutubePlayer, otherwise fallback to image */}
                  {trailerKey ? (
                    <YoutubePlayer
                      height={trailerHeight}
                      width={trailerWidth}
                      play={false}
                      videoId={trailerKey}
                    />
                  ) : (
                    getImageUrl(selectedItem) && (
                      <Image
                        source={{ uri: getImageUrl(selectedItem) }}
                        style={{
                          width: trailerWidth,
                          height: trailerHeight,
                          borderRadius: 8,
                          marginBottom: 16,
                        }}
                        resizeMode="contain"
                      />
                    )
                  )}
                  <Text style={{ fontSize: 26, color: "#444", marginVertical: 16 }}>
                    {selectedItem.overview || selectedItem.description || "No description available"}
                  </Text>
                  <Button mode="contained" onPress={() => setModalVisible(false)}>
                    Close
                  </Button>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Saved;
