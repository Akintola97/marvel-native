import { View, ScrollView, SafeAreaView } from "react-native";
import React from "react";

import Comics from "../components/Comics";
import Hero from "../components/Hero";
import Characters from "../components/Characters";
import Entertainment from "../components/Entertainment";

const Home = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView>
    <View>
      <Hero />
      <Comics />
      <Characters />
      <Entertainment />
    </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
