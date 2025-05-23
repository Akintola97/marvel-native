import React, { useEffect, useState, useContext } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import { Button, Dialog, Portal, ActivityIndicator } from "react-native-paper";
import YoutubePlayer from "react-native-youtube-iframe";
import { FontAwesome } from "@expo/vector-icons";
import { SavedContext } from "../context/savedContext";
import EntertainmentCard from "../components/EntertainmentCard";

const screenWidth = Dimensions.get("window").width;
const playerWidth = screenWidth - 32;
const playerHeight = playerWidth * (9 / 16);

export default function Entertainment() {
  const [entertainment, setEntertainment] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [visibleEntertainment, setVisible] = useState(10);

  const [open, setOpen] = useState(false);
  const [selectedEntertainment, setSelected] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecoLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  const { savedItems, toggleSaveItem } = useContext(SavedContext);

  // Fetch main entertainment list
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          // "https://hero.boltluna.io/api/entertainment"
          `${process.env.EXPO_PUBLIC_BASE_URL}/entertainment`

        );
        setEntertainment(data);
      } catch (err) {
        console.error("Error fetching entertainment:", err);
      }
    })();
  }, []);

  const isEntertainmentSaved = (id) =>
    savedItems.some((item) => item.id === id);

  const toggleView = () => {
    setShowAll((prev) => {
      const next = !prev;
      setVisible(next ? entertainment.length : 10);
      return next;
    });
  };

  // Always normalize to "movie" or "tv" and pick the right TMDB id
  const fetchTrailer = async (item) => {
    const tmdbId = item.id ?? item.details?.id;
    if (!tmdbId) {
      console.warn("Skipping trailer fetch—no TMDB id");
      return;
    }
    const lowerType = (item.type ?? "").toLowerCase();
    const mediaType = lowerType.includes("tv") ? "tv" : "movie";

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

  // Fetch AI recommendations, then flatten out TMDB details into top-level fields
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

      // flatten: pull id, overview, poster_path off of .details if needed
      const recs = data.recommendations.map((r) => {
        const tmdbId = r.id ?? r.details?.id;
        const overview = r.overview ?? r.details?.overview;
        const posterPath = r.poster_path ?? r.details?.poster_path;
        return {
          ...r,
          id: tmdbId,
          overview,
          poster_path: posterPath,
        };
      });

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
    <View style={{ padding: 16, flex: 1, backgroundColor: "#F7FAFC" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Browse Featured <Text style={styles.titleBold}>Titles</Text>
        </Text>
        <Button mode="contained" onPress={toggleView}>
          {showAll ? "View Less" : "View All"}
        </Button>
      </View>

      {/* Main list */}
      <FlatList
        data={entertainment.slice(0, visibleEntertainment)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        renderItem={({ item }) => (
          <EntertainmentCard
            item={item}
            onOpen={handleOpen}
            onToggleSave={toggleSaveItem}
            isSaved={isEntertainmentSaved}
          />
        )}
      />

      {/* Modal */}
      <Portal>
        <Dialog
          visible={open}
          onDismiss={handleClose}
          style={{ width: "90%", alignSelf: "center" }}
        >
          <View style={styles.modalHeader}>
            <Dialog.Title>
              {selectedEntertainment?.title || selectedEntertainment?.name}
            </Dialog.Title>
            {selectedEntertainment && (
              <TouchableOpacity
                onPress={() => toggleSaveItem(selectedEntertainment)}
              >
                <FontAwesome
                  name={
                    isEntertainmentSaved(selectedEntertainment.id)
                      ? "heart"
                      : "heart-o"
                  }
                  size={24}
                  color="red"
                />
              </TouchableOpacity>
            )}
          </View>

          <Dialog.Content>
            {selectedEntertainment && (
              <ScrollView>
                {trailerKey ? (
                  <YoutubePlayer
                    height={playerHeight}
                    width={playerWidth}
                    play={false}
                    videoId={trailerKey}
                  />
                ) : selectedEntertainment.poster_path ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/original${selectedEntertainment.poster_path}`,
                    }}
                    style={[
                      styles.modalImage,
                      { width: playerWidth, height: playerHeight },
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: playerWidth,
                      height: playerHeight,
                      backgroundColor: "#E2E8F0",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Text>No image available</Text>
                  </View>
                )}

                <Text style={styles.description}>
                  {selectedEntertainment.overview ??
                    selectedEntertainment.description ??
                    "No description available"}
                </Text>

                <Text style={styles.recommendHeader}>You Might Also Like</Text>
                {recommendationsLoading ? (
                  <ActivityIndicator animating />
                ) : (
                  <FlatList
                    data={recommendations}
                    horizontal
                    keyExtractor={(_, i) => i.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    renderItem={({ item }) => (
                      <EntertainmentCard
                        item={item}
                        onOpen={handleOpen}
                        onToggleSave={toggleSaveItem}
                        isSaved={isEntertainmentSaved}
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
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 16,
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


