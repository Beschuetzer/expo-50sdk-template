import React from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { unsubscribeFromKeyboardEvents } from "react-native-reanimated/lib/typescript/reanimated2/core";

type ObjectRendererProps<T> = {
  object: T;
};

export function ObjectRenderer<T>(props: ObjectRendererProps<T>) {
  const { object } = props;

  // Render each item in the list
  // Render each item in the list
  const renderObj = () => {
    const renderObjectProperties = Object.keys(object || {}).map((key) => {
      const value = (object as any)[key];

      if (typeof value === "object") {
        return <ObjectRenderer object={value} />;
      } else {
        return (
          <View key={key} style={styles.property}>
            <Text style={styles.propertyName}>{key}:</Text>
            <Text>{(object as any)[key]}</Text>
          </View>
        );
      }
    });

    return <View style={styles.item}>{renderObjectProperties}</View>;
  };

  return <View style={styles.container}>{renderObj()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  property: {
    flexDirection: "row",
    marginBottom: 8,
  },
  propertyName: {
    fontWeight: "bold",
    marginRight: 5,
  },
});

export default ObjectRenderer;
