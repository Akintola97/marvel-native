import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { SavedContext } from "../context/savedContext";
import CharacterCard from "../components/CharacterCard";

// Helper to force HTTPS on thumbnails
const getSecureImageUrl = (thumbnail) => {
  if (!thumbnail) return "";
  const path = thumbnail.path.startsWith("http:")
    ? thumbnail.path.replace("http:", "https:")
    : thumbnail.path;
  return `${path}.${thumbnail.extension}`;
};

export default function Characters() {
  const [characters, setCharacters] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [visibleCharacters, setVisibleCharacters] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const { savedItems, toggleSaveItem } = useContext(SavedContext);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/characters`
        );
        setCharacters(data);
      } catch (err) {
        console.error("Error fetching characters:", err);
      }
    })();
  }, []);

  const isCharacterSaved = (id) => savedItems.some((c) => c.id === id);

  const fetchCharacterRecommendations = async (character) => {
    setRecommendationsLoading(true);
    try {
      const res = await axios.post(
        "https://hero.boltluna.io/api/characterrecommendation",
        {
          itemDetails: {
            title: character.name,
            type: "Character",
            description: character.description || "",
          },
        }
      );
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error("Failed to fetch character recommendations:", err);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleClickOpen = (character) => {
    setSelectedCharacter(character);
    setOpen(true);
    setRecommendations([]);
    fetchCharacterRecommendations(character);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCharacter(null);
    setRecommendations([]);
  };

  const toggleView = () => {
    setShowAll((prev) => {
      const next = !prev;
      setVisibleCharacters(next ? characters.length : 10);
      return next;
    });
  };

  return (
    <View className="p-4 flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-semibold text-gray-600">
          Discover{" "}
          <Text className="font-bold text-black">Characters</Text>
        </Text>
        <Button mode="contained" onPress={toggleView}>
          {showAll ? "View Less" : "View All"}
        </Button>
      </View>

      {/* Character list */}
      <FlatList
        data={characters.slice(0, visibleCharacters)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
        ItemSeparatorComponent={() => <View className="w-4" />}
        renderItem={({ item }) => (
          <CharacterCard
            item={item}
            onOpen={handleClickOpen}
            onToggleSave={toggleSaveItem}
            isSaved={isCharacterSaved}
          />
        )}
      />

      {/* Modal */}
      <Portal>
        <Dialog visible={open} onDismiss={handleClose}>
          {/* Modal header with heart */}
          <View className="flex-row justify-between items-center px-4 pt-4">
            <Dialog.Title>{selectedCharacter?.name}</Dialog.Title>
            {selectedCharacter && (
              <TouchableOpacity onPress={() => toggleSaveItem(selectedCharacter)}>
                {isCharacterSaved(selectedCharacter.id) ? (
                  <FontAwesome name="heart" size={24} color="red" />
                ) : (
                  <FontAwesome name="heart-o" size={24} color="red" />
                )}
              </TouchableOpacity>
            )}
          </View>

          <Dialog.Content>
            {selectedCharacter && (
              <ScrollView>
                <Image
                  source={{
                    uri: getSecureImageUrl(selectedCharacter.thumbnail),
                  }}
                  className="w-full aspect-square rounded-lg mb-2"
                  resizeMode="contain"
                />
                <Text className="my-2">
                  {selectedCharacter.description ||
                    "No description available"}
                </Text>
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
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    renderItem={({ item }) => (
                      <CharacterCard
                        item={item}
                        onOpen={handleClickOpen}
                        onToggleSave={toggleSaveItem}
                        isSaved={isCharacterSaved}
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
