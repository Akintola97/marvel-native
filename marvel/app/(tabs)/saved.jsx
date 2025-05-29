import React, { useContext, useState, useEffect, useCallback } from "react";
// Core RN components
import {
  View,           // container for layout
  Text,           // for rendering text
  TextInput,      // for user text input
  FlatList,       // performant list rendering
  TouchableOpacity, // touchable wrapper for buttons/items
  Image,          // for displaying images
  Modal,          // for modal dialogs
  SafeAreaView,   // ensures content avoids notches
  Dimensions,     // for getting screen dimensions
} from "react-native";
// HTTP client
import axios from "axios";
// YouTube player component
import YoutubePlayer from "react-native-youtube-iframe";
// Icon library
import { FontAwesome } from "@expo/vector-icons";
// Material UI components
import { Button, ActivityIndicator } from "react-native-paper";
// Context for saved items
import { SavedContext } from "../context/savedContext";

// Helper to convert Marvel thumbnail URLs to https
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return "";                                              // no thumbnail → empty string
  const path = thumbnail.path.startsWith("http:")                          // check if URL starts with http:
    ? thumbnail.path.replace("http:", "https:")                           // replace with https:
    : thumbnail.path;                                                      // already https
  return `${path}.${thumbnail.extension}`;                                 // append file extension
};

export default function Saved() {
  const { savedItems, toggleSaveItem } = useContext(SavedContext);         // pull saved items & toggle fn

  const [filteredItems, setFilteredItems] = useState([]);                  // items after search filter
  const [searchQuery, setSearchQuery] = useState("");                      // current search text
  const [currentPage, setCurrentPage] = useState(1);                       // pagination page
  const [selectedItem, setSelectedItem] = useState(null);                  // item for modal detail
  const [modalVisible, setModalVisible] = useState(false);                 // modal open/closed
  const [loading, setLoading] = useState(false);                           // loading spinner
  const [trailerKey, setTrailerKey] = useState(null);                      // YouTube key

  // Screen dimensions to tailor layout
  const screenWidth = Dimensions.get("window").width;                       
  const itemsPerPage = screenWidth > 600 ? 20 : 6;                         
  const trailerWidth = screenWidth - 32;                                   
  const trailerHeight = trailerWidth * (9 / 16);                            

  const numColumns = screenWidth > 600 ? 5 : 2;                             

  // Whenever savedItems changes, reset filteredItems
  useCallback(() => {
    setFilteredItems(savedItems);
  }, [savedItems]);

  // Filter savedItems by searchQuery
  useEffect(() => {
    if (!searchQuery.trim()) {                                            
      setFilteredItems(savedItems);                                       
    } else {
      const q = searchQuery.toLowerCase();                                
      const filtered = savedItems.filter((item) => {
        const title = (item.title || item.name || "").toLowerCase();       
        const desc = (item.overview || item.description || "").toLowerCase(); 
        return title.includes(q) || desc.includes(q);                      
      });
      setFilteredItems(filtered);                                          
      setCurrentPage(1);                                                   
    }
  }, [searchQuery, savedItems]);

  // Compute pagination indices
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);       
  const start = (currentPage - 1) * itemsPerPage;                          
  const pageItems = filteredItems.slice(start, start + itemsPerPage);      

  // Fetch trailer key from your API
  const fetchTrailerKey = async (item) => {
    try {
      const res = await axios.post("https://hero.boltluna.io/api/trailer", {
        media_type: item.type,                                             
        id: item.id,                                                       
      });
      setTrailerKey(res.data.trailerKey);                                  
    } catch {
      setTrailerKey(null);                                                 
    }
  };

  // When selectedItem changes, fetch its trailer
  useEffect(() => {
    if (selectedItem) {
      setTrailerKey(null);                                                 
      fetchTrailerKey(selectedItem);                                      
    }
  }, [selectedItem]);

  // Renderer for each saved-item card
  const renderItem = ({ item }) => {
    // Determine image URL from either TMDB or Marvel thumbnail
    const imgUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/original${item.poster_path}`
      : getSecureImageUrl(item.thumbnail);

    return (
      <TouchableOpacity
        onPress={() => {                                                    
          setSelectedItem(item);
          setModalVisible(true);
        }}
        className="m-2 w-40 bg-white rounded-lg overflow-hidden shadow"
      >
        {imgUrl ? (
          <Image
            source={{ uri: imgUrl }}                                        
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-300 items-center justify-center">
            <Text className="text-gray-700">No Image</Text>               
          </View>
        )}

        <TouchableOpacity
          onPress={() => toggleSaveItem(item)}                             
          className="absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded-full"
        >
          <FontAwesome name="heart" size={22} color="red" />                
        </TouchableOpacity>

        <View className="p-2">
          <Text className="text-sm font-bold text-gray-800">
            {item.title || item.name}                                       
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // While loading, show spinner
  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator animating />                                 
        </View>
      </SafeAreaView>
    );
  }

  // Main UI
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-5 pb-20">
        <Text className="text-3xl font-bold text-gray-900 mb-5">
          Saved Items                                                     
        </Text>

        <View className="mb-5">
          <TextInput
            placeholder="Search saved items..."
            value={searchQuery}                                         
            onChangeText={setSearchQuery}
            className="border border-gray-300 bg-white rounded-lg px-3 py-2.5 shadow"
            placeholderTextColor="#a0aec0"
          />
        </View>

        {filteredItems.length === 0 ? (                                 
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-600">
              No saved items found                                      
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={pageItems}                                        
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}                                
              numColumns={numColumns}                                
              key={`${numColumns}-${itemsPerPage}`}                   
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center", paddingBottom: 80 }}
              className="mb-5"
            />

            <View className="flex-row justify-center items-center">
              <Button
                mode="text"
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((p) => p - 1)}           
              >
                Prev
              </Button>
              <Text className="text-base text-gray-800 mx-2.5">
                {currentPage} / {totalPages}                           
              </Text>
              <Button
                mode="text"
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage((p) => p + 1)}           
              >
                Next
              </Button>
            </View>
          </>
        )}

        <Modal
          visible={modalVisible}                                      
          transparent
          animationType="slide"
        >
          <View className="flex-1 justify-center p-4 bg-black bg-opacity-60">
            <View className="bg-white rounded-lg p-4">
              {selectedItem && (
                <>
                  <Text className="text-3xl font-bold text-gray-900 mb-4">
                    {selectedItem.title || selectedItem.name}          
                  </Text>

                  {trailerKey ? (                                     
                    <YoutubePlayer
                      height={trailerHeight}                         
                      width={trailerWidth}
                      play={false}
                      videoId={trailerKey}
                    />
                  ) : imgUrl ? (                                      
                    <Image
                      source={{ uri: imgUrl }}
                      className="rounded-lg mb-4"
                      style={{ width: trailerWidth, height: trailerHeight }}
                      resizeMode="contain"
                    />
                  ) : null}

                  <Text className="text-2xl text-gray-700 my-4">
                    {selectedItem.overview ||
                      selectedItem.description ||
                      "No description available"}                      
                  </Text>

                  <Button
                    mode="contained"
                    onPress={() => setModalVisible(false)}            
                  >
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
}
