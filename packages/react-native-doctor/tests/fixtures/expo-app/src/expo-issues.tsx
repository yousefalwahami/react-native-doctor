import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// rn-no-legacy-expo-packages: @expo/vector-icons is deprecated
const icon = <Ionicons name="home" size={24} />;

// expo-constants-misuse: Constants.manifest is deprecated since SDK 46
import Constants from "expo-constants";
const appVersion = Constants.manifest?.version;

// expo-missing-dark-mode-support: hardcoded black/white without useColorScheme
const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  text: { color: "black" },
});

export function ExpoIssuesComponent() {
  return <View style={styles.container}>{icon}</View>;
}

export { appVersion };
