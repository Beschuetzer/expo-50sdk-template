import { Button, Divider, Stack, Text, useTheme } from 'native-base';

type ListActionToastProps = {
  message: string;
  onUndo?: () => void;
};

/**
 * A shared "snackbar"-style toast used to notify the user when items are
 * moved or removed from a shopping list, with an optional Undo action.
 */
export function ListActionToast({ message, onUndo }: ListActionToastProps) {
  const theme = useTheme();

  return (
    <Stack
      bg={theme.colors.coolGray[900]}
      borderRadius="lg"
      p={4}
      mb={4}
      maxW="90%"
      minW="64"
      shadow={6}
    >
      <Text color={theme.colors.white} fontSize="sm">
        {message}
      </Text>
      {onUndo && (
        <>
          <Divider my={2} bg={theme.colors.coolGray[700]} />
          <Button
            alignSelf="flex-end"
            size="sm"
            variant="ghost"
            p={1}
            _text={{
              color: theme.colors.success[400],
              fontWeight: 'bold',
              fontSize: 'xs',
            }}
            _pressed={{ bg: theme.colors.coolGray[800] }}
            onPress={onUndo}
          >
            UNDO
          </Button>
        </>
      )}
    </Stack>
  );
}
