import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import { ThemeAwareText } from '@/components/ui/ThemeAwareText';
import { useI18n } from '@/utils/i18n';

export default function NotFoundScreen() {
  const { t } = useI18n();

  return (
    <>
      <Stack.Screen options={{ title: t('errors.notFoundTitle') }} />
      <View style={styles.container}>
        <ThemeAwareText style={styles.title}>
          {t('errors.notFoundMessage')}
        </ThemeAwareText>

        <View style={styles.link}>
          <Link href="/">
            <ThemeAwareText style={styles.linkText}>
              {t('errors.goHome')}
            </ThemeAwareText>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});
