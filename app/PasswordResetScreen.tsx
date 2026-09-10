import {
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  VStack,
} from '@gluestack-ui/themed';
import { useCallback, useMemo, useState } from 'react';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { InputValidationMessage } from '@/components/InputValidationMessage';
import { InputText } from '@/components/forms/InputText';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { PASSWORD_SCHEMA } from '@/constants/schema';
import { accountSelector } from '@/state/slices/generalSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { changePassword } from '@/state/thunks';

export default function PasswordResetScreen() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(accountSelector);
  const [currentPassword, setCurrentPassword] = useState(EMPTY_STRING);
  const [newPassword, setNewPassword] = useState(EMPTY_STRING);
  const currentPasswordParseResult = useMemo(
    () => PASSWORD_SCHEMA.safeParse(currentPassword),
    [currentPassword],
  );
  const newPasswordParseResult = useMemo(
    () => PASSWORD_SCHEMA.safeParse(newPassword),
    [newPassword],
  );
  const isCurrentPasswordValid = useMemo(
    () => currentPasswordParseResult.success,
    [currentPasswordParseResult],
  );
  const isNewPasswordValid = useMemo(
    () => newPasswordParseResult.success,
    [newPasswordParseResult],
  );

  const onChangePasswordPress = useCallback(() => {
    dispatch(changePassword(newPassword));
    setCurrentPassword(EMPTY_STRING);
  }, [newPassword, dispatch]);

  return (
    <AbsolutePositionedScreen>
      <VStack p={FORM_INTER_ITEM_SPACING}>
        <VStack mt={FORM_INTER_ITEM_SPACING}>
          <InputText>Current Password</InputText>
          <Input flex={1} variant="outline" isInvalid={!isCurrentPasswordValid}>
            <InputField
              type="password"
              placeholder="the current password"
              value={currentPassword}
              onChangeText={(newText) => setCurrentPassword(newText.trim())}
            />
          </Input>
          <InputValidationMessage
            isValid={account.password === currentPassword}
            message={
              currentPasswordParseResult.error?.errors[
                currentPasswordParseResult.error?.errors.length - 1
              ].message || 'The current password is incorrect.'
            }
          />
        </VStack>
        <VStack mt={FORM_INTER_ITEM_SPACING}>
          <InputText>Password</InputText>
          <Input flex={1} variant="outline" isInvalid={!isNewPasswordValid}>
            <InputField
              placeholder="the new password"
              value={newPassword}
              onChangeText={(newText) => setNewPassword(newText.trim())}
            />
          </Input>
          <InputValidationMessage
            isValid={isNewPasswordValid}
            message={
              newPasswordParseResult.error?.errors[
                newPasswordParseResult.error?.errors.length - 1
              ].message || 'Invalid password.'
            }
          />
        </VStack>
      </VStack>
      <HStack>
        <Button onPress={onChangePasswordPress}>
          <ButtonText>Change Password</ButtonText>
        </Button>
      </HStack>
    </AbsolutePositionedScreen>
  );
}
