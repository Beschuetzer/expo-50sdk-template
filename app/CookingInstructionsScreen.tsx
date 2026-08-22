import { useRoute, useNavigation } from '@react-navigation/native';
import { Heading, Row, Text, useTheme } from 'native-base';
import { useLayoutEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import { ImageRenderer } from '@/components/ImageRenderer';
import { CookingInstructionsEditor } from '@/components/forms/CookingInstructionsEditor';
import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { CookingInstructions, Item } from '@/types/Item';
import {
  getCookingCallback,
  removeCookingCallback,
} from '@/utils/cookingInstructionsCallbackRegistry';

type ViewParams = { item: Item };
type EditParams = {
  cookingInstructions: CookingInstructions;
  callbackKey: string;
};

export default function CookingInstructionsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const params = (route.params || {}) as ViewParams | EditParams;
  const isEditMode = 'callbackKey' in params;

  const [localInstructions, setLocalInstructions] =
    useState<CookingInstructions>(
      isEditMode
        ? (params as EditParams).cookingInstructions ?? {
            steps: [],
            images: [],
          }
        : (params as ViewParams).item?.cookingInstructions ?? {
            steps: [],
            images: [],
          },
    );

  // Set a header "Done" button in edit mode
  useLayoutEffect(() => {
    if (!isEditMode) return;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            const key = (params as EditParams).callbackKey;
            const cb = getCookingCallback(key);
            cb?.(localInstructions);
            removeCookingCallback(key);
            navigation.goBack();
          }}
          style={{ marginRight: 16 }}
        >
          <Text color="blue.500" fontWeight="600">
            Done
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [isEditMode, localInstructions, navigation, params]);

  if (isEditMode) {
    return (
      <CookingInstructionsEditor
        value={localInstructions}
        onChange={setLocalInstructions}
      />
    );
  }

  // View mode (from tiles)
  const viewItem = (params as ViewParams).item;
  const steps = viewItem?.cookingInstructions?.steps ?? [];
  const images = viewItem?.cookingInstructions?.images ?? [];

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.space[4],
        paddingBottom: 32,
        margin: theme.space[2],
      }}
    >
      {images.length > 0 && (
        <>
          <Heading size="xs" mb={theme.space[FORM_INTER_ITEM_SPACING]}>
            Photo
          </Heading>
          <Row flexWrap="wrap" mb={theme.space[FORM_INTER_ITEM_SPACING]}>
            {images.map((uri, i) => (
              <ImageRenderer
                key={`${uri}-${i}`}
                source={uri}
                showFullscreenOnPress
                cachePolicy="memory"
                item={
                  {
                    images: [uri],
                    imageToUseIndex: 0,
                  } as unknown as Item
                }
              />
            ))}
          </Row>
        </>
      )}

      {steps.length > 0 && (
        <>
          <Heading size="xs" mb={theme.space[FORM_INTER_ITEM_SPACING]}>
            Steps
          </Heading>
          {steps.map((step, i) => (
            <Row
              key={i}
              space={FORM_INTER_ITEM_SPACING}
              mb={theme.space[2]}
              alignItems="flex-start"
            >
              <Text fontWeight="bold" color="gray.600" minW={5}>
                {i + 1}.
              </Text>
              <Text flex={1}>{step}</Text>
            </Row>
          ))}
        </>
      )}

      {images.length === 0 && steps.length === 0 && (
        <Text color="gray.400" fontStyle="italic">
          No instructions added yet.
        </Text>
      )}
    </ScrollView>
  );
}
