import React, { useState, useEffect, useContext } from 'react';                // import React and hooks
// Core React Native components
import {
  View,            // basic container
  Text,            // text display
  Image,           // image display
  SafeAreaView,    // handles device safe area
  TextInput,       // text input field
  TouchableOpacity,// touchable wrapper
  FlatList,        // optimized list
  ScrollView,      // scroll container
  Dimensions       // get screen dimensions
} from 'react-native';
// Paper UI components
import { Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper'; // import UI library
// Icon library
import { FontAwesome } from '@expo/vector-icons';                               // import icon pack
// YouTube player
import YoutubePlayer from 'react-native-youtube-iframe';                        // embed YouTube
// Saved items context
import { SavedContext } from '../context/savedContext';                         // global saved-items

// Helper: ensure Marvel thumbnail URL is HTTPS
const getSecureImageUrl = (thumbnail) => {                                     
  if (!thumbnail) return "";                                                    // no thumbnail → empty
  const path = thumbnail.path.startsWith('http:')                               
    ? thumbnail.path.replace('http:', 'https:')                                 // force https
    : thumbnail.path;                                                          
  return `${path}.${thumbnail.extension}`;                                       // add extension
};

export default function Search() {                                             
  // search query state
  const [query, setQuery] = useState('');                                       

  // results state
  const [characters, setCharacters] = useState([]);                             
  const [comics, setComics] = useState([]);                                     
  const [entertainment, setEntertainment] = useState([]);                       

  // toggles for “View All”
  const [showAllCharacters, setShowAllCharacters] = useState(false);            
  const [showAllComics, setShowAllComics] = useState(false);                    
  const [showAllEntertainment, setShowAllEntertainment] = useState(false);      

  // modal state
  const [open, setOpen] = useState(false);                                      
  const [selectedItem, setSelectedItem] = useState(null);                       

  // recommendations state
  const [recommendations, setRecommendations] = useState([]);                  
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);  

  // trailer key for entertainment
  const [trailerKey, setTrailerKey] = useState(null);                           

  // loading & error
  const [loading, setLoading] = useState(false);                                
  const [error, setError] = useState('');                                       

  // context for saved items
  const { savedItems, toggleSaveItem } = useContext(SavedContext);              

  // responsive dimensions for trailer/image
  const screenWidth = Dimensions.get('window').width;                           
  const trailerWidth = screenWidth - 32;      // account for 16px padding each side
  const trailerHeight = trailerWidth * (9 / 16); // 16:9 aspect ratio

  // perform parallel searches
  const handleSearch = async () => {                                            
    if (!query.trim()) {                                                         
      setCharacters([]); setComics([]); setEntertainment([]); setError('');       
      return;                                                                    
    }
    setLoading(true); setError('');                                              

    try {
      const [charRes, comicRes, entRes] = await Promise.all([                    
        fetch('https://hero.boltluna.io/api/charactersearch', {                  
          method: 'POST', headers: {'Content-Type':'application/json'},          
          body: JSON.stringify({ characterSearch: query })                      
        }),
        fetch('https://hero.boltluna.io/api/comicsearch', {                      
          method: 'POST', headers: {'Content-Type':'application/json'},          
          body: JSON.stringify({ query })                                        
        }),
        fetch('https://hero.boltluna.io/api/entertainmentsearch', {               
          method: 'POST', headers: {'Content-Type':'application/json'},          
          body: JSON.stringify({ entertainmentSearch: query })                   
        })
      ]);

      const characterData = charRes.ok ? await charRes.json() : [];             
      const comicData     = comicRes.ok ? await comicRes.json()     : [];      
      const entData       = entRes.ok ? await entRes.json()        : [];       

      setCharacters(Array.isArray(characterData) ? characterData : []);        
      setComics(Array.isArray(comicData)         ? comicData     : []);        
      setEntertainment(Array.isArray(entData)    ? entData       : []);        
    } catch (err) {
      console.error('Error performing search:', err);                          
      setError('Something went wrong. Please try again.');                     
      setCharacters([]); setComics([]); setEntertainment([]);                   
    } finally {
      setLoading(false);                                                        
    }
  };

  // ensure arrays
  const safeCharacters    = Array.isArray(characters)    ? characters    : []; 
  const safeComics        = Array.isArray(comics)        ? comics        : []; 
  const safeEntertainment = Array.isArray(entertainment) ? entertainment : []; 

  // slice for “View All”
  const charactersToRender    = showAllCharacters ? safeCharacters    : safeCharacters.slice(0,10);
  const comicsToRender        = showAllComics     ? safeComics        : safeComics.slice(0,10);
  const entertainmentToRender = showAllEntertainment? safeEntertainment: safeEntertainment.slice(0,10);

  // check if item is saved
  const isItemSaved = (item) => !!item?.id && savedItems.some((s) => s.id === item.id);

  // fetch recommendations
  const fetchRecommendations = async (item) => {
    if (!item) return;                                                        
    setRecommendations([]); setRecommendationsLoading(true);                 

    try {
      let endpoint = '', body = {};
      if (item.poster_path || item.overview) {
        endpoint = 'https://hero.boltluna.io/api/entertainmentrecommendation';
        body = { itemDetails: { title: item.title||item.name, type:'Entertainment', description:item.overview||'' }};
      } else if (item.title && item.thumbnail) {
        endpoint = 'https://hero.boltluna.io/api/comicrecommendation';
        body = { itemDetails: { title: item.title, type:'Comic', description:item.description||'' }};
      } else {
        endpoint = 'https://hero.boltluna.io/api/characterrecommendation';
        body = { itemDetails: { title: item.name, type:'Character', description:item.description||'' }};
      }
      const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json();                                         
      setRecommendations(data?.recommendations||[]);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);               
    } finally {
      setRecommendationsLoading(false);                                      
    }
  };

  // fetch trailer for entertainment
  const fetchTrailerForEntertainment = async (item) => {
    if (!item?.poster_path) return;                                           
    try {
      const response = await fetch('https://hero.boltluna.io/api/trailer', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ media_type:item.type||'movie', id:item.id })
      });
      const data = await response.json();                                    
      setTrailerKey(data?.trailerKey||null);                                 
    } catch (err) {
      console.error('Error fetching trailer key:', err);                      
      setTrailerKey(null);                                                    
    }
  };

  // open detail modal
  const openDetailsModal = (item) => {
    setSelectedItem(item); setOpen(true);                                    
    setRecommendations([]); setTrailerKey(null);                              
    fetchRecommendations(item);                                               
    if (item?.poster_path) fetchTrailerForEntertainment(item);                
  };

  // close detail modal
  const closeDetailsModal = () => {
    setOpen(false); setSelectedItem(null);                                    
    setRecommendations([]); setTrailerKey(null);                              
  };

  // handle tapping a recommendation
  const handleRecommendationPress = (recItem) => {
    setSelectedItem(recItem); setRecommendations([]); setTrailerKey(null);    
    fetchRecommendations(recItem);                                            
    if (recItem?.poster_path) fetchTrailerForEntertainment(recItem);          
  };

  // render each horizontal card
  const renderHorizontalItem = ({ item }) => (
    <TouchableOpacity 
      className="w-40 mr-4"                                           
      onPress={() => openDetailsModal(item)}                       
    >
      <View className="relative">                                     {/* wrapper for image & icon */}
        {item.thumbnail?.path && item.thumbnail?.extension ? (     
          <Image
            source={{ uri:getSecureImageUrl(item.thumbnail) }}     
            className="w-full h-60 rounded-lg"                      
            resizeMode="cover"
          />
        ) : item.poster_path ? (
          <Image
            source={{ uri:`https://image.tmdb.org/t/p/original${item.poster_path}` }}
            className="w-full h-60 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-60 bg-gray-300 items-center justify-center rounded-lg">
            <Text>No Image</Text>                                  
          </View>
        )}
        <TouchableOpacity
          className="absolute top-2 right-2"
          onPress={() => toggleSaveItem(item)}
        >
          {isItemSaved(item) ? (
            <FontAwesome name="heart" size={24} color="red" />      
          ) : (
            <FontAwesome name="heart-o" size={24} color="red" />    
          )}
        </TouchableOpacity>
      </View>
      <Text className="mt-2 text-center font-semibold text-gray-800">
        {item.name || item.title || 'Untitled'}                     
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">                         
      <View className="flex-1 p-4">                                      
        <View className="mb-4">                                         
          <Text className="text-2xl font-bold text-gray-600">Search</Text> 
        </View>

        <View className="flex-row items-center">                        
          <TextInput
            className="flex-1 border border-gray-300 bg-white rounded-lg px-2 py-1 mr-2"
            placeholder="Search (e.g. 'Wolverine')"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            className="bg-blue-600 rounded-lg px-3 py-2"
            onPress={handleSearch}
          >
            <Text className="text-white font-bold">Search</Text>        
          </TouchableOpacity>
        </View>

        {loading && (                                                   
          <ActivityIndicator className="mt-4" animating size="large" color="#000" />
        )}

        {!!error && (                                                   
          <Text className="text-red-600 text-center mt-2">{error}</Text>
        )}

        <ScrollView className="mt-4">                                  
          {/* Characters row */}
          {safeCharacters.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-semibold text-gray-600">Characters</Text>
                <Button mode="contained" onPress={() => setShowAllCharacters(!showAllCharacters)}>
                  {showAllCharacters ? 'View Less' : 'View All'}
                </Button>
              </View>
              <FlatList
                data={charactersToRender}
                keyExtractor={(item,idx) => `char-${item.id||idx}`}
                renderItem={renderHorizontalItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 16 }}
                ItemSeparatorComponent={() => <View className="w-4" />}
              />
            </View>
          )}

          {/* Comics row */}
          {safeComics.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-semibold text-gray-600">Comics</Text>
                <Button mode="contained" onPress={() => setShowAllComics(!showAllComics)}>
                  {showAllComics ? 'View Less' : 'View All'}
                </Button>
              </View>
              <FlatList
                data={comicsToRender}
                keyExtractor={(item,idx) => `comic-${item.id||idx}`}
                renderItem={renderHorizontalItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 16 }}
                ItemSeparatorComponent={() => <View className="w-4" />}
              />
            </View>
          )}

          {/* Entertainment row */}
          {safeEntertainment.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-semibold text-gray-600">Entertainment</Text>
                <Button mode="contained" onPress={() => setShowAllEntertainment(!showAllEntertainment)}>
                  {showAllEntertainment ? 'View Less' : 'View All'}
                </Button>
              </View>
              <FlatList
                data={entertainmentToRender}
                keyExtractor={(item,idx) => `ent-${item.id||idx}`}
                renderItem={renderHorizontalItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 16 }}
                ItemSeparatorComponent={() => <View className="w-4" />}
              />
            </View>
          )}
        </ScrollView>

        {/* Detail modal */}
        <Portal>
          <Dialog visible={open} onDismiss={closeDetailsModal}>
            <View className="flex-row items-center justify-between px-4 pt-4">
              <Dialog.Title style={{ flex: 1, fontWeight: 'bold', color: '#2D3748' }}>
                {selectedItem?.name || selectedItem?.title || 'Details'}
              </Dialog.Title>
              {selectedItem && (
                <TouchableOpacity onPress={() => toggleSaveItem(selectedItem)}>
                  {isItemSaved(selectedItem) ? (
                    <FontAwesome name="heart" size={24} color="red" />
                  ) : (
                    <FontAwesome name="heart-o" size={24} color="red" />
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Dialog.Content>
              {selectedItem && (
                <ScrollView>
                  {trailerKey ? (
                    <YoutubePlayer
                      height={trailerHeight}
                      width={trailerWidth}
                      play={false}
                      videoId={trailerKey}
                    />
                  ) : selectedItem.thumbnail?.path && selectedItem.thumbnail?.extension ? (
                    <Image
                      source={{ uri: getSecureImageUrl(selectedItem.thumbnail) }}
                      className="rounded-lg mb-4"
                      style={{ width: '100%', height: trailerHeight }}
                      resizeMode="cover"
                    />
                  ) : selectedItem.poster_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/original${selectedItem.poster_path}` }}
                      className="rounded-lg mb-4"
                      style={{ width: '100%', height: trailerHeight }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-[${trailerHeight}px] bg-gray-300 rounded-lg mb-4 items-center justify-center">
                      <Text>No Image</Text>
                    </View>
                  )}
                  <Text className="my-2">
                    {selectedItem.description || selectedItem.overview || 'No description available'}
                  </Text>
                  <Text className="text-lg font-bold my-2">You Might Also Like</Text>
                  {recommendationsLoading ? (
                    <ActivityIndicator animating size="large" />
                  ) : (
                    <FlatList
                      data={recommendations}
                      keyExtractor={(_,i) => `rec-${i}`}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ marginTop: 16 }}
                      ItemSeparatorComponent={() => <View className="w-4" />}
                      renderItem={({ item: recItem }) => (
                        <TouchableOpacity onPress={() => handleRecommendationPress(recItem)}>
                          <View className="w-32 mr-4">
                            {recItem.thumbnail?.path && recItem.thumbnail?.extension ? (
                              <Image
                                source={{ uri: getSecureImageUrl(recItem.thumbnail) }}
                                className="w-full h-24 rounded-lg"
                                resizeMode="cover"
                              />
                            ) : recItem.poster_path ? (
                              <Image
                                source={{ uri: `https://image.tmdb.org/t/p/original${recItem.poster_path}` }}
                                className="w-full h-24 rounded-lg"
                                resizeMode="cover"
                              />
                            ) : (
                              <View className="w-full h-24 bg-gray-300 rounded-lg items-center justify-center">
                                <Text>No Image</Text>
                              </View>
                            )}
                            <Text className="mt-1 text-center">
                              {recItem.title || recItem.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </ScrollView>
              )}
            </Dialog.Content>
            <Dialog.Actions className="pb-4">
              <Button onPress={closeDetailsModal}>
                <Text className="text-base">Close</Text>
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </SafeAreaView>
  );
}
