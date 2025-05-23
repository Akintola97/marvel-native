import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
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
          // "https://hero.boltluna.io/api/characters"
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
    <View style={{ padding: 16, flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Discover <Text style={styles.titleBold}>Characters</Text>
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
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
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
          <View style={styles.modalHeader}>
            <Dialog.Title>{selectedCharacter?.name}</Dialog.Title>
            {selectedCharacter && (
              <TouchableOpacity
                onPress={() => toggleSaveItem(selectedCharacter)}
              >
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
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.description}>
                  {selectedCharacter.description || "No description available"}
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
