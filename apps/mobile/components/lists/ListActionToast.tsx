import {
  Button,
  ButtonText,
  Divider,
  VStack,
  Text,
} from '@gluestack-ui/themed';

type ListActionToastProps = {
  message: string;
  onUndo?: () => void;
};

/**
 *A shared "snackbar"-style toast used to notify the user when a task changes (added, completed,
 *deleted, etc.), with an optional Undo action. Rendered via gluestack's `useToast()` (see
 *`TasksList`).
 **/
export function ListActionToast({ message, onUndo }: ListActionToastProps) {
  return (
    <VStack
      bg="$coolGray900"
      borderRadius="$lg"
      p="$4"
      mb="$4"
      maxWidth="90%"
      minWidth="$64"
    >
      <Text color="$white" size="sm">
        {message}
      </Text>
      {onUndo && (
        <>
          <Divider my="$2" bg="$coolGray700" />
          <Button
            alignSelf="flex-end"
            size="sm"
            variant="link"
            p="$1"
            onPress={onUndo}
          >
            <ButtonText color="$success400" bold size="xs">
              UNDO
            </ButtonText>
          </Button>
        </>
      )}
    </VStack>
  );
}
