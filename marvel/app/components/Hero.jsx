import { View, Text, Image } from "react-native";
import React from "react";
const heroImage = require("../../assets/images/marvel-home.jpg");

const Hero = () => {
  return (
    <View>
      <Image source={heroImage} className="w-full h-[30vh]" />
    </View>
  );
};

export default Hero;
