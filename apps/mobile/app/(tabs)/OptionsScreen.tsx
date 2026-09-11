import { Heading, HStack, Text, VStack } from '@gluestack-ui/themed';

import { ThemeAwareButton } from '@/components/ui/ThemeAwareButton';
import { useI18n } from '@/utils/i18n';
import { useThemeMode } from '@/utils/theme';

export default function SettingsScreen() {
  const { locale, locales, setLocale, t } = useI18n();
  const { mode, modes, setMode } = useThemeMode();

  return (
    <VStack flex={1} p="$4" space="lg">
      <Heading size="lg">{t('settings.title')}</Heading>

      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('theme.label')}</Text>
          <HStack space="sm">
            {(Object.keys(modes) as (keyof typeof modes)[]).map(
              (availableMode) => (
                <ThemeAwareButton
                  key={availableMode}
                  variant={mode === availableMode ? 'solid' : 'outline'}
                  size="sm"
                  onPress={() => setMode(availableMode)}
                >
                  {t(`theme.${availableMode}`)}
                </ThemeAwareButton>
              ),
            )}
          </HStack>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('settings.notifications')}</Text>
          <ThemeAwareButton variant="outline" size="sm">
            {t('settings.manage')}
          </ThemeAwareButton>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('settings.privacy')}</Text>
          <ThemeAwareButton variant="outline" size="sm">
            {t('settings.review')}
          </ThemeAwareButton>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text>{t('language.label')}</Text>
          <HStack space="sm">
            {(Object.keys(locales) as (keyof typeof locales)[]).map(
              (availableLocale) => (
                <ThemeAwareButton
                  key={availableLocale}
                  variant={locale === availableLocale ? 'solid' : 'outline'}
                  size="sm"
                  onPress={() => setLocale(availableLocale)}
                >
                  {locales[availableLocale]}
                </ThemeAwareButton>
              ),
            )}
          </HStack>
        </HStack>
      </VStack>

      <ThemeAwareButton>{t('actions.saveSettings')}</ThemeAwareButton>
    </VStack>
  );
}
