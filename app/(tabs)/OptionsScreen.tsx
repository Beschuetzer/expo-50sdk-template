import {
  Button,
  ButtonText,
  Heading,
  HStack,
  Text,
  VStack,
} from '@gluestack-ui/themed';

export default function SettingsScreen() {
  return (
    <VStack flex={1} p="$4" space="lg">
      <Heading size="lg">Settings</Heading>

      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <Text>Dark mode</Text>
          <Button variant="outline" size="sm">
            <ButtonText>Toggle</ButtonText>
          </Button>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text>Notifications</Text>
          <Button variant="outline" size="sm">
            <ButtonText>Manage</ButtonText>
          </Button>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text>Privacy</Text>
          <Button variant="outline" size="sm">
            <ButtonText>Review</ButtonText>
          </Button>
        </HStack>
      </VStack>

      <Button>
        <ButtonText>Save Settings</ButtonText>
      </Button>
    </VStack>
  );
}
