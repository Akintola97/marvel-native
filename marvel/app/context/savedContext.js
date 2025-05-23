// SavedContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SavedContext = createContext();

export const SavedProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState([]);

  // Load saved items when context mounts:
  useEffect(() => {
    const loadSavedItems = async () => {
      try {
        const stored = await AsyncStorage.getItem("savedItems"); // Use the same key everywhere!
        if (stored) {
          setSavedItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading saved items", error);
      }
    };
    loadSavedItems();
  }, []);

  const toggleSaveItem = async (item) => {
    let updatedSaved;
    if (savedItems.some((i) => i.id === item.id)) {
      updatedSaved = savedItems.filter((i) => i.id !== item.id);
    } else {
      updatedSaved = [...savedItems, item];
    }
    setSavedItems(updatedSaved);
    try {
      await AsyncStorage.setItem("savedItems", JSON.stringify(updatedSaved));
    } catch (error) {
      console.error("Error saving items", error);
    }
  };

  return (
    <SavedContext.Provider value={{ savedItems, toggleSaveItem }}>
      {children}
    </SavedContext.Provider>
  );
};
