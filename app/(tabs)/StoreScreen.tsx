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
  const navigation = useNavigation();
  const theme = useTheme();

  function onAddStorePress() {
    navigation.navigate(Routes.StoreModal);
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View paddingRight={theme.space[1]}>
          <TouchableOpacity onPress={onAddStorePress}>
            <FontAwesome name="plus" size={20} color="black" />
          </TouchableOpacity>
        </View>
      ),
      headerLeft: () => (
        <View pl={theme.space[1]}>
          <StoreManager useAbbreviatedVerbiage />
        </View>
      ),
      headerTitleAlign: "center",
    });
  }, [navigation]);

  return (
    <View>
      <StoresList />
    </View>
  );
}
