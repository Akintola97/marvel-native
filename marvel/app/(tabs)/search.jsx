// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   StyleSheet
// } from 'react-native';
// import { Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
// import { FontAwesome } from '@expo/vector-icons';
// import YoutubePlayer from 'react-native-youtube-iframe';
// import { SavedContext } from '../context/savedContext';

// // Helper function to return a secure Marvel image URL
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return "";
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")
//     : thumbnail.path;
//   return `${path}.${thumbnail.extension}`;
// };

// export default function Search() {
//   // Query state
//   const [query, setQuery] = useState('');

//   // Results
//   const [characters, setCharacters] = useState([]);
//   const [comics, setComics] = useState([]);
//   const [entertainment, setEntertainment] = useState([]);

//   // Show/hide "View All" toggles
//   const [showAllCharacters, setShowAllCharacters] = useState(false);
//   const [showAllComics, setShowAllComics] = useState(false);
//   const [showAllEntertainment, setShowAllEntertainment] = useState(false);

//   // Modal state
//   const [open, setOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   // Recommendations
//   const [recommendations, setRecommendations] = useState([]);
//   const [recommendationsLoading, setRecommendationsLoading] = useState(false);

//   // Trailer key for Entertainment items
//   const [trailerKey, setTrailerKey] = useState(null);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Global saved items context
//   const { savedItems, toggleSaveItem } = useContext(SavedContext);

//   // Perform the three searches in parallel
//   const handleSearch = async () => {
//     if (!query.trim()) {
//       // Clear if empty
//       setCharacters([]);
//       setComics([]);
//       setEntertainment([]);
//       setError('');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const [characterData, comicData, entertainmentData] = await Promise.all([
//         fetch('https://hero.boltluna.io/api/charactersearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ characterSearch: query })
//         }).then((res) => res.json()),

//         fetch('https://hero.boltluna.io/api/comicsearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ query })
//         }).then((res) => res.json()),

//         fetch('https://hero.boltluna.io/api/entertainmentsearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ entertainmentSearch: query })
//         }).then((res) => res.json())
//       ]);

//       setCharacters(characterData || []);
//       setComics(comicData || []);
//       setEntertainment(entertainmentData || []);
//     } catch (err) {
//       console.error('Error performing search:', err);
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Decide how many items to show for each row
//   const charactersToRender = showAllCharacters ? characters : characters.slice(0, 10);
//   const comicsToRender = showAllComics ? comics : comics.slice(0, 10);
//   const entertainmentToRender = showAllEntertainment
//     ? entertainment
//     : entertainment.slice(0, 10);

//   // Helper: check if item is saved
//   const isItemSaved = (item) =>
//     !!item?.id && savedItems.some((saved) => saved.id === item.id);

//   // --- RECOMMENDATIONS LOGIC ---
//   const fetchRecommendations = async (item) => {
//     if (!item) return;

//     setRecommendations([]);
//     setRecommendationsLoading(true);

//     try {
//       let endpoint = '';
//       let body = {};

//       // If it's an entertainment item
//       if (item.poster_path || item.overview) {
//         endpoint = 'https://hero.boltluna.io/api/entertainmentrecommendation';
//         body = {
//           itemDetails: {
//             title: item.title || item.name,
//             type: 'Entertainment',
//             description: item.overview || ''
//           }
//         };
//       }
//       // If it's a comic
//       else if (item.title && item.thumbnail) {
//         endpoint = 'https://hero.boltluna.io/api/comicrecommendation';
//         body = {
//           itemDetails: {
//             title: item.title,
//             type: 'Comic',
//             description: item.description || ''
//           }
//         };
//       }
//       // Otherwise assume it's a character
//       else {
//         endpoint = 'https://hero.boltluna.io/api/characterrecommendation';
//         body = {
//           itemDetails: {
//             title: item.name,
//             type: 'Character',
//             description: item.description || ''
//           }
//         };
//       }

//       if (!endpoint) {
//         setRecommendationsLoading(false);
//         return;
//       }

//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });
//       const data = await res.json();
//       setRecommendations(data?.recommendations || []);
//     } catch (error) {
//       console.error('Failed to fetch recommendations:', error);
//     } finally {
//       setRecommendationsLoading(false);
//     }
//   };

//   // --- TRAILER LOGIC ---
//   const fetchTrailerForEntertainment = async (item) => {
//     if (!item || !item.poster_path) return;

//     try {
//       const response = await fetch('https://hero.boltluna.io/api/trailer', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           media_type: item.type || 'movie',
//           id: item.id
//         })
//       });
//       const data = await response.json();
//       setTrailerKey(data?.trailerKey || null);
//     } catch (error) {
//       console.error('Error fetching trailer key:', error);
//       setTrailerKey(null);
//     }
//   };

//   // Open modal
//   const openDetailsModal = (item) => {
//     setSelectedItem(item);
//     setOpen(true);
//     setRecommendations([]);
//     setTrailerKey(null);

//     // Fetch recommendations
//     fetchRecommendations(item);

//     // If entertainment item, attempt trailer fetch
//     if (item?.poster_path) {
//       fetchTrailerForEntertainment(item);
//     }
//   };

//   // Close modal
//   const closeDetailsModal = () => {
//     setOpen(false);
//     setSelectedItem(null);
//     setRecommendations([]);
//     setTrailerKey(null);
//   };

//   // Tapping a recommended item in the modal
//   const handleRecommendationPress = (recItem) => {
//     setSelectedItem(recItem);
//     setRecommendations([]);
//     setTrailerKey(null);
//     fetchRecommendations(recItem);

//     if (recItem?.poster_path) {
//       fetchTrailerForEntertainment(recItem);
//     }
//   };

//   // RENDER for each horizontal row
//   const renderHorizontalItem = ({ item }) => (
//     <TouchableOpacity onPress={() => openDetailsModal(item)}>
//       <View style={{ width: 160, marginRight: 16 }}>
//         <View style={{ position: 'relative' }}>
//           {/* Marvel item (using thumbnail & helper) or TMDb item */}
//           {item?.thumbnail?.path && item?.thumbnail?.extension ? (
//             <Image
//               source={{ uri: getSecureImageUrl(item.thumbnail) }}
//               style={{ width: '100%', height: 240, borderRadius: 8 }}
//               resizeMode="cover"
//             />
//           ) : item?.poster_path ? (
//             <Image
//               source={{ uri: `https://image.tmdb.org/t/p/original${item.poster_path}` }}
//               style={{ width: '100%', height: 240, borderRadius: 8 }}
//               resizeMode="cover"
//             />
//           ) : (
//             <View
//               style={{
//                 width: '100%',
//                 height: 240,
//                 borderRadius: 8,
//                 backgroundColor: '#ccc',
//                 justifyContent: 'center',
//                 alignItems: 'center'
//               }}
//             >
//               <Text>No Image</Text>
//             </View>
//           )}

//           {/* Heart overlay */}
//           <TouchableOpacity
//             onPress={() => toggleSaveItem(item)}
//             style={{ position: 'absolute', top: 8, right: 8 }}
//           >
//             {isItemSaved(item) ? (
//               <FontAwesome name="heart" size={24} color="red" />
//             ) : (
//               <FontAwesome name="heart-o" size={24} color="red" />
//             )}
//           </TouchableOpacity>
//         </View>
//         <Text
//           style={{
//             marginTop: 8,
//             textAlign: 'center',
//             fontWeight: '600',
//             color: '#2D3748'
//           }}
//         >
//           {item.name || item.title || 'Untitled'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
//       {/* Container with padding */}
//       <View style={{ padding: 16, flex: 1 }}>
//         {/* Header / Title */}
//         <View style={{ marginBottom: 16 }}>
//           <Text style={{ fontSize: 24, fontWeight: '700', color: '#4A5568' }}>
//             Search
//           </Text>
//         </View>

//         {/* Search Row */}
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TextInput
//             style={{
//               flex: 1,
//               borderWidth: 1,
//               borderColor: '#ccc',
//               borderRadius: 8,
//               paddingHorizontal: 8,
//               paddingVertical: 6,
//               marginRight: 8,
//               backgroundColor: '#fff'
//             }}
//             placeholder="Search (e.g. 'Wolverine')"
//             value={query}
//             onChangeText={(text) => setQuery(text)}
//             onSubmitEditing={handleSearch}
//           />
//           <TouchableOpacity
//             style={{
//               backgroundColor: '#007bff',
//               borderRadius: 8,
//               paddingHorizontal: 12,
//               paddingVertical: 8
//             }}
//             onPress={handleSearch}
//           >
//             <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Loading indicator */}
//         {loading && (
//           <View style={{ marginTop: 16 }}>
//             <ActivityIndicator animating size="large" color="#000" />
//           </View>
//         )}

//         {/* Error text */}
//         {!!error && (
//           <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
//             {error}
//           </Text>
//         )}

//         {/* Scrollable area for the 3 categories */}
//         <ScrollView style={{ marginTop: 16 }}>
//           {/* Characters */}
//           {characters.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Characters
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllCharacters(!showAllCharacters)}
//                 >
//                   {showAllCharacters ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={charactersToRender}
//                 keyExtractor={(item, idx) => `char-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}

//           {/* Comics */}
//           {comics.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Comics
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllComics(!showAllComics)}
//                 >
//                   {showAllComics ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={comicsToRender}
//                 keyExtractor={(item, idx) => `comic-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}

//           {/* Entertainment */}
//           {entertainment.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Entertainment
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllEntertainment(!showAllEntertainment)}
//                 >
//                   {showAllEntertainment ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={entertainmentToRender}
//                 keyExtractor={(item, idx) => `ent-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}
//         </ScrollView>

//         {/* Modal */}
//         <Portal>
//           <Dialog visible={open} onDismiss={closeDetailsModal}>
//             {/* Header with Title + Heart icon */}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 paddingHorizontal: 16,
//                 paddingTop: 16
//               }}
//             >
//               <Dialog.Title style={{ flex: 1 }}>
//                 {selectedItem?.name || selectedItem?.title || 'Details'}
//               </Dialog.Title>
//               {selectedItem && (
//                 <TouchableOpacity onPress={() => toggleSaveItem(selectedItem)}>
//                   {isItemSaved(selectedItem) ? (
//                     <FontAwesome name="heart" size={24} color="red" />
//                   ) : (
//                     <FontAwesome name="heart-o" size={24} color="red" />
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//             <Dialog.Content>
//               {selectedItem && (
//                 <ScrollView>
//                   {/* Trailer or Image */}
//                   {trailerKey ? (
//                     <YoutubePlayer height={200} play={false} videoId={trailerKey} />
//                   ) : selectedItem?.thumbnail?.path && selectedItem?.thumbnail?.extension ? (
//                     <Image
//                       source={{ uri: getSecureImageUrl(selectedItem.thumbnail) }}
//                       style={{
//                         width: '100%',
//                         height: 200,
//                         borderRadius: 8,
//                         marginBottom: 8
//                       }}
//                       resizeMode="cover"
//                     />
//                   ) : selectedItem?.poster_path ? (
//                     <Image
//                       source={{ uri: `https://image.tmdb.org/t/p/original${selectedItem.poster_path}` }}
//                       style={{
//                         width: '100%',
//                         height: 200,
//                         borderRadius: 8,
//                         marginBottom: 8
//                       }}
//                       resizeMode="cover"
//                     />
//                   ) : (
//                     <View
//                       style={{
//                         width: '100%',
//                         height: 200,
//                         borderRadius: 8,
//                         backgroundColor: '#ccc',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         marginBottom: 8
//                       }}
//                     >
//                       <Text>No Image</Text>
//                     </View>
//                   )}

//                   {/* Description */}
//                   <Text style={{ marginBottom: 8 }}>
//                     {selectedItem.description ||
//                       selectedItem.overview ||
//                       'No description available'}
//                   </Text>

//                   {/* Recommendations */}
//                   <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
//                     You Might Also Like
//                   </Text>
//                   {recommendationsLoading ? (
//                     <ActivityIndicator animating={true} />
//                   ) : (
//                     <FlatList
//                       data={recommendations}
//                       keyExtractor={(_, i) => `rec-${i}`}
//                       horizontal
//                       showsHorizontalScrollIndicator={false}
//                       renderItem={({ item: recItem }) => (
//                         <TouchableOpacity onPress={() => handleRecommendationPress(recItem)}>
//                           <View style={{ width: 120, marginRight: 16 }}>
//                             {/* Recommendation image */}
//                             {recItem?.thumbnail?.path && recItem?.thumbnail?.extension ? (
//                               <Image
//                                 source={{ uri: getSecureImageUrl(recItem.thumbnail) }}
//                                 style={{ width: '100%', height: 100, borderRadius: 8 }}
//                                 resizeMode="cover"
//                               />
//                             ) : recItem?.poster_path ? (
//                               <Image
//                                 source={{ uri: `https://image.tmdb.org/t/p/original${recItem.poster_path}` }}
//                                 style={{ width: '100%', height: 100, borderRadius: 8 }}
//                                 resizeMode="cover"
//                               />
//                             ) : (
//                               <View
//                                 style={{
//                                   width: '100%',
//                                   height: 100,
//                                   borderRadius: 8,
//                                   backgroundColor: '#ccc',
//                                   justifyContent: 'center',
//                                   alignItems: 'center'
//                                 }}
//                               >
//                                 <Text>No Image</Text>
//                               </View>
//                             )}
//                             <Text style={{ marginTop: 4, textAlign: 'center' }}>
//                               {recItem?.title || recItem?.name}
//                             </Text>
//                           </View>
//                         </TouchableOpacity>
//                       )}
//                     />
//                   )}
//                 </ScrollView>
//               )}
//             </Dialog.Content>
//             <Dialog.Actions>
//               <Button onPress={closeDetailsModal}>Close</Button>
//             </Dialog.Actions>
//           </Dialog>
//         </Portal>
//       </View>
//     </SafeAreaView>
//   );
// }





// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Dimensions
// } from 'react-native';
// import { Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
// import { FontAwesome } from '@expo/vector-icons';
// import YoutubePlayer from 'react-native-youtube-iframe';
// import { SavedContext } from '../context/savedContext';

// // Helper function to return a secure Marvel image URL
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return "";
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")
//     : thumbnail.path;
//   return `${path}.${thumbnail.extension}`;
// };

// export default function Search() {
//   // Query state
//   const [query, setQuery] = useState('');

//   // Results
//   const [characters, setCharacters] = useState([]);
//   const [comics, setComics] = useState([]);
//   const [entertainment, setEntertainment] = useState([]);

//   // Show/hide "View All" toggles
//   const [showAllCharacters, setShowAllCharacters] = useState(false);
//   const [showAllComics, setShowAllComics] = useState(false);
//   const [showAllEntertainment, setShowAllEntertainment] = useState(false);

//   // Modal state
//   const [open, setOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   // Recommendations
//   const [recommendations, setRecommendations] = useState([]);
//   const [recommendationsLoading, setRecommendationsLoading] = useState(false);

//   // Trailer key for Entertainment items
//   const [trailerKey, setTrailerKey] = useState(null);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Global saved items context
//   const { savedItems, toggleSaveItem } = useContext(SavedContext);

//   // Determine responsive dimensions for trailer / image in modal.
//   // Assume a total horizontal padding of 32 (i.e. 16 on each side)
//   const screenWidth = Dimensions.get("window").width;
//   const trailerWidth = screenWidth - 32;
//   const trailerHeight = trailerWidth * (9 / 16);

//   // Perform the three searches in parallel
//   const handleSearch = async () => {
//     if (!query.trim()) {
//       // Clear if empty
//       setCharacters([]);
//       setComics([]);
//       setEntertainment([]);
//       setError('');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const [characterData, comicData, entertainmentData] = await Promise.all([
//         fetch('https://hero.boltluna.io/api/charactersearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ characterSearch: query })
//         }).then((res) => res.json()),

//         fetch('https://hero.boltluna.io/api/comicsearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ query })
//         }).then((res) => res.json()),

//         fetch('https://hero.boltluna.io/api/entertainmentsearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ entertainmentSearch: query })
//         }).then((res) => res.json())
//       ]);

//       setCharacters(characterData || []);
//       setComics(comicData || []);
//       setEntertainment(entertainmentData || []);
//     } catch (err) {
//       console.error('Error performing search:', err);
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Decide how many items to show for each row
//   const charactersToRender = showAllCharacters ? characters : characters.slice(0, 10);
//   const comicsToRender = showAllComics ? comics : comics.slice(0, 10);
//   const entertainmentToRender = showAllEntertainment ? entertainment : entertainment.slice(0, 10);

//   // Helper: check if item is saved
//   const isItemSaved = (item) =>
//     !!item?.id && savedItems.some((saved) => saved.id === item.id);

//   // --- RECOMMENDATIONS LOGIC ---
//   const fetchRecommendations = async (item) => {
//     if (!item) return;

//     setRecommendations([]);
//     setRecommendationsLoading(true);

//     try {
//       let endpoint = '';
//       let body = {};

//       // If it's an entertainment item
//       if (item.poster_path || item.overview) {
//         endpoint = 'https://hero.boltluna.io/api/entertainmentrecommendation';
//         body = {
//           itemDetails: {
//             title: item.title || item.name,
//             type: 'Entertainment',
//             description: item.overview || ''
//           }
//         };
//       }
//       // If it's a comic
//       else if (item.title && item.thumbnail) {
//         endpoint = 'https://hero.boltluna.io/api/comicrecommendation';
//         body = {
//           itemDetails: {
//             title: item.title,
//             type: 'Comic',
//             description: item.description || ''
//           }
//         };
//       }
//       // Otherwise assume it's a character
//       else {
//         endpoint = 'https://hero.boltluna.io/api/characterrecommendation';
//         body = {
//           itemDetails: {
//             title: item.name,
//             type: 'Character',
//             description: item.description || ''
//           }
//         };
//       }

//       if (!endpoint) {
//         setRecommendationsLoading(false);
//         return;
//       }

//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });
//       const data = await res.json();
//       setRecommendations(data?.recommendations || []);
//     } catch (error) {
//       console.error('Failed to fetch recommendations:', error);
//     } finally {
//       setRecommendationsLoading(false);
//     }
//   };

//   // --- TRAILER LOGIC ---
//   const fetchTrailerForEntertainment = async (item) => {
//     if (!item || !item.poster_path) return;

//     try {
//       const response = await fetch('https://hero.boltluna.io/api/trailer', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           media_type: item.type || 'movie',
//           id: item.id
//         })
//       });
//       const data = await response.json();
//       setTrailerKey(data?.trailerKey || null);
//     } catch (error) {
//       console.error('Error fetching trailer key:', error);
//       setTrailerKey(null);
//     }
//   };

//   // Open modal
//   const openDetailsModal = (item) => {
//     setSelectedItem(item);
//     setOpen(true);
//     setRecommendations([]);
//     setTrailerKey(null);

//     // Fetch recommendations
//     fetchRecommendations(item);

//     // If entertainment item, attempt trailer fetch
//     if (item?.poster_path) {
//       fetchTrailerForEntertainment(item);
//     }
//   };

//   // Close modal
//   const closeDetailsModal = () => {
//     setOpen(false);
//     setSelectedItem(null);
//     setRecommendations([]);
//     setTrailerKey(null);
//   };

//   // Tapping a recommended item in the modal
//   const handleRecommendationPress = (recItem) => {
//     setSelectedItem(recItem);
//     setRecommendations([]);
//     setTrailerKey(null);
//     fetchRecommendations(recItem);

//     if (recItem?.poster_path) {
//       fetchTrailerForEntertainment(recItem);
//     }
//   };

//   // RENDER for each horizontal row
//   const renderHorizontalItem = ({ item }) => (
//     <TouchableOpacity onPress={() => openDetailsModal(item)}>
//       <View style={{ width: 160, marginRight: 16 }}>
//         <View style={{ position: 'relative' }}>
//           {/* Marvel item (using thumbnail & helper) or TMDb item */}
//           {item?.thumbnail?.path && item?.thumbnail?.extension ? (
//             <Image
//               source={{ uri: getSecureImageUrl(item.thumbnail) }}
//               style={{ width: '100%', height: 240, borderRadius: 8 }}
//               resizeMode="cover"
//             />
//           ) : item?.poster_path ? (
//             <Image
//               source={{ uri: `https://image.tmdb.org/t/p/original${item.poster_path}` }}
//               style={{ width: '100%', height: 240, borderRadius: 8 }}
//               resizeMode="cover"
//             />
//           ) : (
//             <View
//               style={{
//                 width: '100%',
//                 height: 240,
//                 borderRadius: 8,
//                 backgroundColor: '#ccc',
//                 justifyContent: 'center',
//                 alignItems: 'center'
//               }}
//             >
//               <Text>No Image</Text>
//             </View>
//           )}

//           {/* Heart overlay */}
//           <TouchableOpacity
//             onPress={() => toggleSaveItem(item)}
//             style={{ position: 'absolute', top: 8, right: 8 }}
//           >
//             {isItemSaved(item) ? (
//               <FontAwesome name="heart" size={24} color="red" />
//             ) : (
//               <FontAwesome name="heart-o" size={24} color="red" />
//             )}
//           </TouchableOpacity>
//         </View>
//         <Text
//           style={{
//             marginTop: 8,
//             textAlign: 'center',
//             fontWeight: '600',
//             color: '#2D3748'
//           }}
//         >
//           {item.name || item.title || 'Untitled'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
//       {/* Container with padding */}
//       <View style={{ padding: 16, flex: 1 }}>
//         {/* Header / Title */}
//         <View style={{ marginBottom: 16 }}>
//           <Text style={{ fontSize: 24, fontWeight: '700', color: '#4A5568' }}>
//             Search
//           </Text>
//         </View>

//         {/* Search Row */}
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TextInput
//             style={{
//               flex: 1,
//               borderWidth: 1,
//               borderColor: '#ccc',
//               borderRadius: 8,
//               paddingHorizontal: 8,
//               paddingVertical: 6,
//               marginRight: 8,
//               backgroundColor: '#fff'
//             }}
//             placeholder="Search (e.g. 'Wolverine')"
//             value={query}
//             onChangeText={(text) => setQuery(text)}
//             onSubmitEditing={handleSearch}
//           />
//           <TouchableOpacity
//             style={{
//               backgroundColor: '#007bff',
//               borderRadius: 8,
//               paddingHorizontal: 12,
//               paddingVertical: 8
//             }}
//             onPress={handleSearch}
//           >
//             <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Loading indicator */}
//         {loading && (
//           <View style={{ marginTop: 16 }}>
//             <ActivityIndicator animating size="large" color="#000" />
//           </View>
//         )}

//         {/* Error text */}
//         {!!error && (
//           <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
//             {error}
//           </Text>
//         )}

//         {/* Scrollable area for the 3 categories */}
//         <ScrollView style={{ marginTop: 16 }}>
//           {/* Characters */}
//           {characters.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Characters
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllCharacters(!showAllCharacters)}
//                 >
//                   {showAllCharacters ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={charactersToRender}
//                 keyExtractor={(item, idx) => `char-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}

//           {/* Comics */}
//           {comics.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Comics
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllComics(!showAllComics)}
//                 >
//                   {showAllComics ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={comicsToRender}
//                 keyExtractor={(item, idx) => `comic-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}

//           {/* Entertainment */}
//           {entertainment.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Entertainment
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllEntertainment(!showAllEntertainment)}
//                 >
//                   {showAllEntertainment ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={entertainmentToRender}
//                 keyExtractor={(item, idx) => `ent-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}
//         </ScrollView>

//         {/* Modal */}
//         <Portal>
//           <Dialog visible={open} onDismiss={closeDetailsModal}>
//             {/* Header with Title + Heart icon */}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 paddingHorizontal: 16,
//                 paddingTop: 16
//               }}
//             >
//               <Dialog.Title style={{ flex: 1, fontSize:36, color:'#2D3748' }}>
//                 {selectedItem?.name || selectedItem?.title || 'Details'}
//               </Dialog.Title>
//               {selectedItem && (
//                 <TouchableOpacity onPress={() => toggleSaveItem(selectedItem)}>
//                   {isItemSaved(selectedItem) ? (
//                     <FontAwesome name="heart" size={24} color="red" />
//                   ) : (
//                     <FontAwesome name="heart-o" size={24} color="red" />
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//             <Dialog.Content>
//               {selectedItem && (
//                 <ScrollView>
//                   {/* Trailer or Image */}
//                   {trailerKey ? (
//                     <YoutubePlayer
//                       height={trailerHeight}
//                       width={trailerWidth}
//                       play={false}
//                       videoId={trailerKey}
//                     />
//                   ) : selectedItem?.thumbnail?.path && selectedItem?.thumbnail?.extension ? (
//                     <Image
//                       source={{ uri: getSecureImageUrl(selectedItem.thumbnail) }}
//                       style={{
//                         width: '100%',
//                         height: trailerHeight,
//                         borderRadius: 8,
//                         marginBottom: 8
//                       }}
//                       resizeMode="cover"
//                     />
//                   ) : selectedItem?.poster_path ? (
//                     <Image
//                       source={{ uri: `https://image.tmdb.org/t/p/original${selectedItem.poster_path}` }}
//                       style={{
//                         width: '100%',
//                         height: trailerHeight,
//                         borderRadius: 8,
//                         marginBottom: 8
//                       }}
//                       resizeMode="cover"
//                     />
//                   ) : (
//                     <View
//                       style={{
//                         width: '100%',
//                         height: trailerHeight,
//                         borderRadius: 8,
//                         backgroundColor: '#ccc',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         marginBottom: 8
//                       }}
//                     >
//                       <Text>No Image</Text>
//                     </View>
//                   )}

//                   {/* Description */}
//                   <Text style={{ marginBottom: 8, marginTop:20, fontSize: 26 }}>
//                     {selectedItem.description ||
//                       selectedItem.overview ||
//                       'No description available'}
//                   </Text>

//                   {/* Recommendations */}
//                   <Text style={{ fontSize: 25, fontWeight: '700', marginBottom: 8, marginTop: 25 }}>
//                     You Might Also Like
//                   </Text>
//                   {recommendationsLoading ? (
//                     <ActivityIndicator animating={true} />
//                   ) : (
//                     <FlatList
//                       data={recommendations}
//                       keyExtractor={(_, i) => `rec-${i}`}
//                       horizontal
//                       showsHorizontalScrollIndicator={false}
//                       renderItem={({ item: recItem }) => (
//                         <TouchableOpacity onPress={() => handleRecommendationPress(recItem)}>
//                           <View style={{ width: 120, marginRight: 16 }}>
//                             {/* Recommendation image */}
//                             {recItem?.thumbnail?.path && recItem?.thumbnail?.extension ? (
//                               <Image
//                                 source={{ uri: getSecureImageUrl(recItem.thumbnail) }}
//                                 style={{ width: '100%', height: 100, borderRadius: 8 }}
//                                 resizeMode="cover"
//                               />
//                             ) : recItem?.poster_path ? (
//                               <Image
//                                 source={{ uri: `https://image.tmdb.org/t/p/original${recItem.poster_path}` }}
//                                 style={{ width: '100%', height: 100, borderRadius: 8 }}
//                                 resizeMode="cover"
//                               />
//                             ) : (
//                               <View
//                                 style={{
//                                   width: '100%',
//                                   height: 100,
//                                   borderRadius: 8,
//                                   backgroundColor: '#ccc',
//                                   justifyContent: 'center',
//                                   alignItems: 'center'
//                                 }}
//                               >
//                                 <Text>No Image</Text>
//                               </View>
//                             )}
//                             <Text style={{ marginTop: 4, fontSize:25, textAlign: 'center' }}>
//                               {recItem?.title || recItem?.name}
//                             </Text>
//                           </View>
//                         </TouchableOpacity>
//                       )}
//                     />
//                   )}
//                 </ScrollView>
//               )}
//             </Dialog.Content>
//             <Dialog.Actions>
//               <Button className="p-5"  onPress={closeDetailsModal}><Text className="text-[2vh]">Close</Text></Button>
//             </Dialog.Actions>
//           </Dialog>
//         </Portal>
//       </View>
//     </SafeAreaView>
//   );
// }






// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Dimensions
// } from 'react-native';
// import { Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
// import { FontAwesome } from '@expo/vector-icons';
// import YoutubePlayer from 'react-native-youtube-iframe';
// import { SavedContext } from '../context/savedContext';

// // Helper function to return a secure Marvel image URL
// const getSecureImageUrl = (thumbnail) => {
//   if (!thumbnail) return "";
//   const path = thumbnail.path.startsWith("http:")
//     ? thumbnail.path.replace("http:", "https:")
//     : thumbnail.path;
//   return `${path}.${thumbnail.extension}`;
// };

// export default function Search() {
//   // Query state
//   const [query, setQuery] = useState('');

//   // Results
//   const [characters, setCharacters] = useState([]);
//   const [comics, setComics] = useState([]);
//   const [entertainment, setEntertainment] = useState([]);

//   // Show/hide "View All" toggles
//   const [showAllCharacters, setShowAllCharacters] = useState(false);
//   const [showAllComics, setShowAllComics] = useState(false);
//   const [showAllEntertainment, setShowAllEntertainment] = useState(false);

//   // Modal state
//   const [open, setOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   // Recommendations
//   const [recommendations, setRecommendations] = useState([]);
//   const [recommendationsLoading, setRecommendationsLoading] = useState(false);

//   // Trailer key for Entertainment items
//   const [trailerKey, setTrailerKey] = useState(null);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Global saved items context
//   const { savedItems, toggleSaveItem } = useContext(SavedContext);

//   // Determine responsive dimensions for trailer / image in modal.
//   // Assume a total horizontal padding of 32 (i.e. 16 on each side)
//   const screenWidth = Dimensions.get("window").width;
//   const trailerWidth = screenWidth - 32;
//   const trailerHeight = trailerWidth * (9 / 16);

//   // Perform the three searches in parallel
//   const handleSearch = async () => {
//     if (!query.trim()) {
//       // Clear if empty
//       setCharacters([]);
//       setComics([]);
//       setEntertainment([]);
//       setError('');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const [characterData, comicData, entertainmentData] = await Promise.all([
//         fetch('https://hero.boltluna.io/api/charactersearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ characterSearch: query })
//         }).then((res) => res.json()),

//         fetch('https://hero.boltluna.io/api/comicsearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ query })
//         }).then((res) => res.json()),

//         fetch('https://hero.boltluna.io/api/entertainmentsearch', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ entertainmentSearch: query })
//         }).then((res) => res.json())
//       ]);

//       setCharacters(characterData || []);
//       setComics(comicData || []);
//       setEntertainment(entertainmentData || []);
//     } catch (err) {
//       console.error('Error performing search:', err);
//       setError('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Decide how many items to show for each row
//   const charactersToRender = showAllCharacters ? characters : characters.slice(0, 10);
//   const comicsToRender = showAllComics ? comics : comics.slice(0, 10);
//   const entertainmentToRender = showAllEntertainment ? entertainment : entertainment.slice(0, 10);

//   // Helper: check if item is saved
//   const isItemSaved = (item) =>
//     !!item?.id && savedItems.some((saved) => saved.id === item.id);

//   // --- RECOMMENDATIONS LOGIC ---
//   const fetchRecommendations = async (item) => {
//     if (!item) return;

//     setRecommendations([]);
//     setRecommendationsLoading(true);

//     try {
//       let endpoint = '';
//       let body = {};

//       // If it's an entertainment item
//       if (item.poster_path || item.overview) {
//         endpoint = 'https://hero.boltluna.io/api/entertainmentrecommendation';
//         body = {
//           itemDetails: {
//             title: item.title || item.name,
//             type: 'Entertainment',
//             description: item.overview || ''
//           }
//         };
//       }
//       // If it's a comic
//       else if (item.title && item.thumbnail) {
//         endpoint = 'https://hero.boltluna.io/api/comicrecommendation';
//         body = {
//           itemDetails: {
//             title: item.title,
//             type: 'Comic',
//             description: item.description || ''
//           }
//         };
//       }
//       // Otherwise assume it's a character
//       else {
//         endpoint = 'https://hero.boltluna.io/api/characterrecommendation';
//         body = {
//           itemDetails: {
//             title: item.name,
//             type: 'Character',
//             description: item.description || ''
//           }
//         };
//       }

//       if (!endpoint) {
//         setRecommendationsLoading(false);
//         return;
//       }

//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       });
//       const data = await res.json();
//       setRecommendations(data?.recommendations || []);
//     } catch (error) {
//       console.error('Failed to fetch recommendations:', error);
//     } finally {
//       setRecommendationsLoading(false);
//     }
//   };

//   // --- TRAILER LOGIC ---
//   const fetchTrailerForEntertainment = async (item) => {
//     if (!item || !item.poster_path) return;

//     try {
//       const response = await fetch('https://hero.boltluna.io/api/trailer', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           media_type: item.type || 'movie',
//           id: item.id
//         })
//       });
//       const data = await response.json();
//       setTrailerKey(data?.trailerKey || null);
//     } catch (error) {
//       console.error('Error fetching trailer key:', error);
//       setTrailerKey(null);
//     }
//   };

//   // Open modal
//   const openDetailsModal = (item) => {
//     setSelectedItem(item);
//     setOpen(true);
//     setRecommendations([]);
//     setTrailerKey(null);

//     // Fetch recommendations
//     fetchRecommendations(item);

//     // If entertainment item, attempt trailer fetch
//     if (item?.poster_path) {
//       fetchTrailerForEntertainment(item);
//     }
//   };

//   // Close modal
//   const closeDetailsModal = () => {
//     setOpen(false);
//     setSelectedItem(null);
//     setRecommendations([]);
//     setTrailerKey(null);
//   };

//   // Tapping a recommended item in the modal
//   const handleRecommendationPress = (recItem) => {
//     setSelectedItem(recItem);
//     setRecommendations([]);
//     setTrailerKey(null);
//     fetchRecommendations(recItem);

//     if (recItem?.poster_path) {
//       fetchTrailerForEntertainment(recItem);
//     }
//   };

//   // RENDER for each horizontal row
//   const renderHorizontalItem = ({ item }) => (
//     <TouchableOpacity onPress={() => openDetailsModal(item)}>
//       <View style={{ width: 160, marginRight: 16 }}>
//         <View style={{ position: 'relative' }}>
//           {/* Marvel item (using thumbnail & helper) or TMDb item */}
//           {item?.thumbnail?.path && item?.thumbnail?.extension ? (
//             <Image
//               source={{ uri: getSecureImageUrl(item.thumbnail) }}
//               style={{ width: '100%', height: 240, borderRadius: 8 }}
//               resizeMode="cover"
//             />
//           ) : item?.poster_path ? (
//             <Image
//               source={{ uri: `https://image.tmdb.org/t/p/original${item.poster_path}` }}
//               style={{ width: '100%', height: 240, borderRadius: 8 }}
//               resizeMode="cover"
//             />
//           ) : (
//             <View
//               style={{
//                 width: '100%',
//                 height: 240,
//                 borderRadius: 8,
//                 backgroundColor: '#ccc',
//                 justifyContent: 'center',
//                 alignItems: 'center'
//               }}
//             >
//               <Text>No Image</Text>
//             </View>
//           )}

//           {/* Heart overlay */}
//           <TouchableOpacity
//             onPress={() => toggleSaveItem(item)}
//             style={{ position: 'absolute', top: 8, right: 8 }}
//           >
//             {isItemSaved(item) ? (
//               <FontAwesome name="heart" size={24} color="red" />
//             ) : (
//               <FontAwesome name="heart-o" size={24} color="red" />
//             )}
//           </TouchableOpacity>
//         </View>
//         <Text
//           style={{
//             marginTop: 8,
//             textAlign: 'center',
//             fontWeight: '600',
//             color: '#2D3748'
//           }}
//         >
//           {item.name || item.title || 'Untitled'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
//       {/* Container with padding */}
//       <View style={{ padding: 16, flex: 1 }}>
//         {/* Header / Title */}
//         <View style={{ marginBottom: 16 }}>
//           <Text style={{ fontSize: 24, fontWeight: '700', color: '#4A5568' }}>
//             Search
//           </Text>
//         </View>

//         {/* Search Row */}
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TextInput
//             style={{
//               flex: 1,
//               borderWidth: 1,
//               borderColor: '#ccc',
//               borderRadius: 8,
//               paddingHorizontal: 8,
//               paddingVertical: 6,
//               marginRight: 8,
//               backgroundColor: '#fff'
//             }}
//             placeholder="Search (e.g. 'Wolverine')"
//             value={query}
//             onChangeText={(text) => setQuery(text)}
//             onSubmitEditing={handleSearch}
//           />
//           <TouchableOpacity
//             style={{
//               backgroundColor: '#007bff',
//               borderRadius: 8,
//               paddingHorizontal: 12,
//               paddingVertical: 8
//             }}
//             onPress={handleSearch}
//           >
//             <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Loading indicator */}
//         {loading && (
//           <View style={{ marginTop: 16 }}>
//             <ActivityIndicator animating size="large" color="#000" />
//           </View>
//         )}

//         {/* Error text */}
//         {!!error && (
//           <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
//             {error}
//           </Text>
//         )}

//         {/* Scrollable area for the 3 categories */}
//         <ScrollView style={{ marginTop: 16 }}>
//           {/* Characters */}
//           {characters.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Characters
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllCharacters(!showAllCharacters)}
//                 >
//                   {showAllCharacters ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={charactersToRender}
//                 keyExtractor={(item, idx) => `char-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}

//           {/* Comics */}
//           {comics.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Comics
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllComics(!showAllComics)}
//                 >
//                   {showAllComics ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={comicsToRender}
//                 keyExtractor={(item, idx) => `comic-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}

//           {/* Entertainment */}
//           {entertainment.length > 0 && (
//             <View style={{ marginBottom: 24 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
//                   Entertainment
//                 </Text>
//                 <Button
//                   mode="contained"
//                   onPress={() => setShowAllEntertainment(!showAllEntertainment)}
//                 >
//                   {showAllEntertainment ? 'View Less' : 'View All'}
//                 </Button>
//               </View>
//               <FlatList
//                 data={entertainmentToRender}
//                 keyExtractor={(item, idx) => `ent-${item.id || idx}`}
//                 renderItem={renderHorizontalItem}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ marginTop: 16 }}
//                 ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
//               />
//             </View>
//           )}
//         </ScrollView>

//         {/* Modal */}
//         <Portal>
//           <Dialog visible={open} onDismiss={closeDetailsModal}>
//             {/* Header with Title + Heart icon */}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 paddingHorizontal: 16,
//                 paddingTop: 16
//               }}
//             >
//               <Dialog.Title style={{ flex: 1, fontWeight: "bold", color: '#2D3748' }}>
//                 {selectedItem?.name || selectedItem?.title || 'Details'}
//               </Dialog.Title>
//               {selectedItem && (
//                 <TouchableOpacity onPress={() => toggleSaveItem(selectedItem)}>
//                   {isItemSaved(selectedItem) ? (
//                     <FontAwesome name="heart" size={24} color="red" />
//                   ) : (
//                     <FontAwesome name="heart-o" size={24} color="red" />
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//             <Dialog.Content>
//               {selectedItem && (
//                 <ScrollView>
//                   {/* Trailer or Image */}
//                   {trailerKey ? (
//                     <YoutubePlayer
//                       height={trailerHeight}
//                       width={trailerWidth}
//                       play={false}
//                       videoId={trailerKey}
//                     />
//                   ) : selectedItem?.thumbnail?.path && selectedItem?.thumbnail?.extension ? (
//                     <Image
//                       source={{ uri: getSecureImageUrl(selectedItem.thumbnail) }}
//                       style={{
//                         width: '100%',
//                         height: trailerHeight,
//                         borderRadius: 8,
//                         marginBottom: 8
//                       }}
//                       resizeMode="cover"
//                     />
//                   ) : selectedItem?.poster_path ? (
//                     <Image
//                       source={{ uri: `https://image.tmdb.org/t/p/original${selectedItem.poster_path}` }}
//                       style={{
//                         width: '100%',
//                         height: trailerHeight,
//                         borderRadius: 8,
//                         marginBottom: 8
//                       }}
//                       resizeMode="cover"
//                     />
//                   ) : (
//                     <View
//                       style={{
//                         width: '100%',
//                         height: trailerHeight,
//                         borderRadius: 8,
//                         backgroundColor: '#ccc',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         marginBottom: 8
//                       }}
//                     >
//                       <Text>No Image</Text>
//                     </View>
//                   )}

//                   {/* Description */}
//                   <Text style={{ marginBottom: 8, marginTop: 20 }}>
//                     {selectedItem.description ||
//                       selectedItem.overview ||
//                       'No description available'}
//                   </Text>

//                   {/* Recommendations */}
//                   <Text style={{fontWeight: '700', marginBottom: 8, marginTop: 25 }}>
//                     You Might Also Like
//                   </Text>
//                   {recommendationsLoading ? (
//                     <ActivityIndicator animating={true} />
//                   ) : (
//                     <FlatList
//                       data={recommendations}
//                       keyExtractor={(_, i) => `rec-${i}`}
//                       horizontal
//                       showsHorizontalScrollIndicator={false}
//                       renderItem={({ item: recItem }) => (
//                         <TouchableOpacity onPress={() => handleRecommendationPress(recItem)}>
//                           <View style={{ width: 120, marginRight: 16 }}>
//                             {/* Recommendation image */}
//                             {recItem?.thumbnail?.path && recItem?.thumbnail?.extension ? (
//                               <Image
//                                 source={{ uri: getSecureImageUrl(recItem.thumbnail) }}
//                                 style={{ width: '100%', height: 100, borderRadius: 8 }}
//                                 resizeMode="cover"
//                               />
//                             ) : recItem?.poster_path ? (
//                               <Image
//                                 source={{ uri: `https://image.tmdb.org/t/p/original${recItem.poster_path}` }}
//                                 style={{ width: '100%', height: 100, borderRadius: 8 }}
//                                 resizeMode="cover"
//                               />
//                             ) : (
//                               <View
//                                 style={{
//                                   width: '100%',
//                                   height: 100,
//                                   borderRadius: 8,
//                                   backgroundColor: '#ccc',
//                                   justifyContent: 'center',
//                                   alignItems: 'center'
//                                 }}
//                               >
//                                 <Text>No Image</Text>
//                               </View>
//                             )}
//                             <Text style={{ marginTop: 4, textAlign: 'center' }}>
//                               {recItem?.title || recItem?.name}
//                             </Text>
//                           </View>
//                         </TouchableOpacity>
//                       )}
//                     />
//                   )}
//                 </ScrollView>
//               )}
//             </Dialog.Content>
//             {/* Added bottom padding to ensure the Close button is fully visible */}
//             <Dialog.Actions style={{ paddingBottom: 20 }}>
//               <Button onPress={closeDetailsModal}>
//                 <Text style={{ fontSize: 15 }}>Close</Text>
//               </Button>
//             </Dialog.Actions>
//           </Dialog>
//         </Portal>
//       </View>
//     </SafeAreaView>
//   );
// }



import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { SavedContext } from '../context/savedContext';

// Helper function to return a secure Marvel image URL
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return "";
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function Search() {
  // Query state
  const [query, setQuery] = useState('');

  // Results
  const [characters, setCharacters] = useState([]);
  const [comics, setComics] = useState([]);
  const [entertainment, setEntertainment] = useState([]);

  // Show/hide "View All" toggles
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [showAllComics, setShowAllComics] = useState(false);
  const [showAllEntertainment, setShowAllEntertainment] = useState(false);

  // Modal state
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Trailer key for Entertainment items
  const [trailerKey, setTrailerKey] = useState(null);

  // Loading / Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Global saved items context
  const { savedItems, toggleSaveItem } = useContext(SavedContext);

  // Determine responsive dimensions for trailer / image in modal.
  const screenWidth = Dimensions.get("window").width;
  const trailerWidth = screenWidth - 32; // 16px horizontal padding on each side
  const trailerHeight = trailerWidth * (9 / 16);

  // Perform the three searches in parallel
  const handleSearch = async () => {
    if (!query.trim()) {
      // Clear if empty
      setCharacters([]);
      setComics([]);
      setEntertainment([]);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [charRes, comicRes, entRes] = await Promise.all([
        fetch('https://hero.boltluna.io/api/charactersearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterSearch: query })
        }),
        fetch('https://hero.boltluna.io/api/comicsearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        }),
        fetch('https://hero.boltluna.io/api/entertainmentsearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entertainmentSearch: query })
        })
      ]);

      // Only parse JSON if the HTTP response was OK; otherwise default to empty array
      const characterData = charRes.ok
        ? await charRes.json()
        : [];
      const comicData = comicRes.ok
        ? await comicRes.json()
        : [];
      const entertainmentData = entRes.ok
        ? await entRes.json()
        : [];

      // Ensure we only set actual arrays
      setCharacters(Array.isArray(characterData) ? characterData : []);
      setComics(Array.isArray(comicData) ? comicData : []);
      setEntertainment(Array.isArray(entertainmentData) ? entertainmentData : []);
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Something went wrong. Please try again.');

      // Reset to empty arrays on any error
      setCharacters([]);
      setComics([]);
      setEntertainment([]);
    } finally {
      setLoading(false);
    }
  };

  // Safety wrappers: ensure we always have true arrays
  const safeCharacters = Array.isArray(characters) ? characters : [];
  const safeComics = Array.isArray(comics) ? comics : [];
  const safeEntertainment = Array.isArray(entertainment) ? entertainment : [];

  // Decide how many items to show for each row
  const charactersToRender = showAllCharacters
    ? safeCharacters
    : safeCharacters.slice(0, 10);
  const comicsToRender = showAllComics
    ? safeComics
    : safeComics.slice(0, 10);
  const entertainmentToRender = showAllEntertainment
    ? safeEntertainment
    : safeEntertainment.slice(0, 10);

  // Helper: check if item is saved
  const isItemSaved = (item) =>
    !!item?.id && savedItems.some((saved) => saved.id === item.id);

  // --- RECOMMENDATIONS LOGIC ---
  const fetchRecommendations = async (item) => {
    if (!item) return;

    setRecommendations([]);
    setRecommendationsLoading(true);

    try {
      let endpoint = '';
      let body = {};

      if (item.poster_path || item.overview) {
        endpoint = 'https://hero.boltluna.io/api/entertainmentrecommendation';
        body = {
          itemDetails: {
            title: item.title || item.name,
            type: 'Entertainment',
            description: item.overview || ''
          }
        };
      } else if (item.title && item.thumbnail) {
        endpoint = 'https://hero.boltluna.io/api/comicrecommendation';
        body = {
          itemDetails: {
            title: item.title,
            type: 'Comic',
            description: item.description || ''
          }
        };
      } else {
        endpoint = 'https://hero.boltluna.io/api/characterrecommendation';
        body = {
          itemDetails: {
            title: item.name,
            type: 'Character',
            description: item.description || ''
          }
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setRecommendations(data?.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // --- TRAILER LOGIC ---
  const fetchTrailerForEntertainment = async (item) => {
    if (!item || !item.poster_path) return;
    try {
      const response = await fetch('https://hero.boltluna.io/api/trailer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: item.type || 'movie',
          id: item.id
        })
      });
      const data = await response.json();
      setTrailerKey(data?.trailerKey || null);
    } catch (err) {
      console.error('Error fetching trailer key:', err);
      setTrailerKey(null);
    }
  };

  // Open modal
  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setOpen(true);
    setRecommendations([]);
    setTrailerKey(null);
    fetchRecommendations(item);
    if (item?.poster_path) {
      fetchTrailerForEntertainment(item);
    }
  };

  // Close modal
  const closeDetailsModal = () => {
    setOpen(false);
    setSelectedItem(null);
    setRecommendations([]);
    setTrailerKey(null);
  };

  // Handle tapping a recommendation
  const handleRecommendationPress = (recItem) => {
    setSelectedItem(recItem);
    setRecommendations([]);
    setTrailerKey(null);
    fetchRecommendations(recItem);
    if (recItem?.poster_path) {
      fetchTrailerForEntertainment(recItem);
    }
  };

  // Render for each horizontal item
  const renderHorizontalItem = ({ item }) => (
    <TouchableOpacity onPress={() => openDetailsModal(item)}>
      <View style={{ width: 160, marginRight: 16 }}>
        <View style={{ position: 'relative' }}>
          {item?.thumbnail?.path && item?.thumbnail?.extension ? (
            <Image
              source={{ uri: getSecureImageUrl(item.thumbnail) }}
              style={{ width: '100%', height: 240, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : item?.poster_path ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/original${item.poster_path}` }}
              style={{ width: '100%', height: 240, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 240,
                borderRadius: 8,
                backgroundColor: '#ccc',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text>No Image</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => toggleSaveItem(item)}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            {isItemSaved(item) ? (
              <FontAwesome name="heart" size={24} color="red" />
            ) : (
              <FontAwesome name="heart-o" size={24} color="red" />
            )}
          </TouchableOpacity>
        </View>
        <Text
          style={{
            marginTop: 8,
            textAlign: 'center',
            fontWeight: '600',
            color: '#2D3748'
          }}
        >
          {item.name || item.title || 'Untitled'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
      <View style={{ padding: 16, flex: 1 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#4A5568' }}>
            Search
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 6,
              marginRight: 8,
              backgroundColor: '#fff'
            }}
            placeholder="Search (e.g. 'Wolverine')"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}
            onPress={handleSearch}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={{ marginTop: 16 }}>
            <ActivityIndicator animating size="large" color="#000" />
          </View>
        )}
        {!!error && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
            {error}
          </Text>
        )}
        <ScrollView style={{ marginTop: 16 }}>
          {safeCharacters.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
                  Characters
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setShowAllCharacters(!showAllCharacters)}
                >
                  {showAllCharacters ? 'View Less' : 'View All'}
                </Button>
              </View>
              <FlatList
                data={charactersToRender}
                keyExtractor={(item, idx) => `char-${item.id || idx}`}
                renderItem={renderHorizontalItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 16 }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              />
            </View>
          )}
          {safeComics.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
                  Comics
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setShowAllComics(!showAllComics)}
                >
                  {showAllComics ? 'View Less' : 'View All'}
                </Button>
              </View>
              <FlatList
                data={comicsToRender}
                keyExtractor={(item, idx) => `comic-${item.id || idx}`}
                renderItem={renderHorizontalItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 16 }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              />
            </View>
          )}
          {safeEntertainment.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#4A5568' }}>
                  Entertainment
                </Text>
                <Button
                  mode="contained"
                  onPress={() => setShowAllEntertainment(!showAllEntertainment)}
                >
                  {showAllEntertainment ? 'View Less' : 'View All'}
                </Button>
              </View>
              <FlatList
                data={entertainmentToRender}
                keyExtractor={(item, idx) => `ent-${item.id || idx}`}
                renderItem={renderHorizontalItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginTop: 16 }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              />
            </View>
          )}
        </ScrollView>
        <Portal>
          <Dialog visible={open} onDismiss={closeDetailsModal}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingTop: 16
              }}
            >
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
                  ) : selectedItem?.thumbnail?.path && selectedItem?.thumbnail?.extension ? (
                    <Image
                      source={{ uri: getSecureImageUrl(selectedItem.thumbnail) }}
                      style={{ width: '100%', height: trailerHeight, borderRadius: 8, marginBottom: 8 }}
                      resizeMode="cover"
                    />
                  ) : selectedItem?.poster_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/original${selectedItem.poster_path}` }}
                      style={{ width: '100%', height: trailerHeight, borderRadius: 8, marginBottom: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        height: trailerHeight,
                        borderRadius: 8,
                        backgroundColor: '#ccc',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 8
                      }}
                    >
                      <Text>No Image</Text>
                    </View>
                  )}
                  <Text style={{ marginBottom: 8, marginTop: 20 }}>
                    {selectedItem.description || selectedItem.overview || 'No description available'}
                  </Text>
                  <Text style={{ fontWeight: '700', marginBottom: 8, marginTop: 25 }}>
                    You Might Also Like
                  </Text>
                  {recommendationsLoading ? (
                    <ActivityIndicator animating size="large" />
                  ) : (
                    <FlatList
                      data={recommendations}
                      keyExtractor={(_, i) => `rec-${i}`}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item: recItem }) => (
                        <TouchableOpacity onPress={() => handleRecommendationPress(recItem)}>
                          <View style={{ width: 120, marginRight: 16 }}>
                            {recItem?.thumbnail?.path && recItem?.thumbnail?.extension ? (
                              <Image
                                source={{ uri: getSecureImageUrl(recItem.thumbnail) }}
                                style={{ width: '100%', height: 100, borderRadius: 8 }}
                                resizeMode="cover"
                              />
                            ) : recItem?.poster_path ? (
                              <Image
                                source={{ uri: `https://image.tmdb.org/t/p/original${recItem.poster_path}` }}
                                style={{ width: '100%', height: 100, borderRadius: 8 }}
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                style={{
                                  width: '100%',
                                  height: 100,
                                  borderRadius: 8,
                                  backgroundColor: '#ccc',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}
                              >
                                <Text>No Image</Text>
                              </View>
                            )}
                            <Text style={{ marginTop: 4, textAlign: 'center' }}>
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
            <Dialog.Actions style={{ paddingBottom: 20 }}>
              <Button onPress={closeDetailsModal}>
                <Text style={{ fontSize: 15 }}>Close</Text>
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </SafeAreaView>
  );
}
