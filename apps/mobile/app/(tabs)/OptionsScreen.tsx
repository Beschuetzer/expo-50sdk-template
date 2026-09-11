import {
  Button,
  ButtonText,
  Heading,
  HStack,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { useI18n } from '@/utils/i18n';

export default function SettingsScreen() {
  const { locale, locales, setLocale, t } = useI18n();

  return (
    <VStack flex={1} p="$4" space="lg">
      <Heading size="lg">{t('settings.title')}</Heading>

      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('settings.darkMode')}</Text>
          <Button variant="outline" size="sm">
            <ButtonText>{t('settings.toggle')}</ButtonText>
          </Button>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('settings.notifications')}</Text>
          <Button variant="outline" size="sm">
            <ButtonText>{t('settings.manage')}</ButtonText>
          </Button>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('settings.privacy')}</Text>
          <Button variant="outline" size="sm">
            <ButtonText>{t('settings.review')}</ButtonText>
          </Button>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('language.label')}</Text>
          <HStack space="sm">
            {(Object.keys(locales) as (keyof typeof locales)[]).map(
              (availableLocale) => (
                <Button
                  key={availableLocale}
                  variant={locale === availableLocale ? 'solid' : 'outline'}
                  size="sm"
                  onPress={() => setLocale(availableLocale)}
                >
                  <ButtonText>{locales[availableLocale]}</ButtonText>
                </Button>
              ),
            )}
          </HStack>
        </HStack>
      </VStack>

      <Button>
        <ButtonText>{t('actions.saveSettings')}</ButtonText>
      </Button>
    </VStack>
  );
}
