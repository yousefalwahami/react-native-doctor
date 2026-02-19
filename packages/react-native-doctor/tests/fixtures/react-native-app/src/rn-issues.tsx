import React from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// rn-no-deprecated-modules: SafeAreaView was removed from react-native
const DeprecatedSafeArea = () => (
  <SafeAreaView>
    <View />
  </SafeAreaView>
);

// rn-prefer-reanimated: Animated imported from react-native
const AnimatedBox = () => <Animated.View style={{ opacity: 1 }} />;

// rn-no-dimensions-get: Dimensions.get() doesn't update on rotation
const screenWidth = Dimensions.get("window").width;

// rn-touchable-missing-accessibility-label + rn-missing-accessibility-role
export function BadTouchable() {
  return (
    <TouchableOpacity onPress={() => {}}>
      <View />
    </TouchableOpacity>
  );
}

// rn-image-missing-accessible + rn-image-missing-dimensions
export function BadImage() {
  return <Image source={{ uri: "https://example.com/img.png" }} />;
}

// rn-inline-style-in-render (fires because StyleSheet is imported above)
export function InlineStyleComponent() {
  return <View style={{ flex: 1, padding: 16 }} />;
}

// rn-no-inline-flatlist-renderitem + rn-flatlist-missing-keyextractor
export function InlineFlatList({ items }: { items: string[] }) {
  return <FlatList data={items} renderItem={({ item }) => <View />} />;
}

// rn-scrollview-for-long-lists
export function ScrollMapList({ items }: { items: string[] }) {
  return (
    <ScrollView>
      {items.map((item) => (
        <View key={item} />
      ))}
    </ScrollView>
  );
}

// rn-avoid-anonymous-functions-in-jsx
export function AnonymousHandler() {
  return (
    <TouchableOpacity
      accessibilityLabel="Submit"
      accessibilityRole="button"
      onPress={() => console.log("pressed")}
    >
      <View />
    </TouchableOpacity>
  );
}

// rn-missing-memo-on-list-item: exported component with list-item suffix, no memo
export const UserCard = () => <View />;
export const ItemRow = () => <View />;

// rn-hardcoded-colors: 3+ unique hex colors triggers the rule
export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderColor: "#ff0000",
    shadowColor: "#000000",
  },
  text: { color: "#333333" },
});

export { screenWidth, DeprecatedSafeArea, AnimatedBox };
