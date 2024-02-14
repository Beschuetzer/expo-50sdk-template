import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { View, useTheme } from "native-base";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";

import { StoreManager } from "@/components/StoreManager";
import { StoresList } from "@/components/lists/StoresList";
import { Routes } from "@/constants/navigation";

export default function StoreScreen() {
  const theme = useTheme();

  return (
    <View
      flex={1}
      backgroundColor={theme.colors.white}
      justifyContent="space-between"
    >
      <StoresList />
    </View>
  );
}
