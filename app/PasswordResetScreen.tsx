import { Button, Input, Row, Stack, theme } from 'native-base';
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
  const isCurrentPasswordValid = useMemo(() => {
    return currentPasswordParseResult.success;
  }, [currentPasswordParseResult]);
  const isNewPasswordValid = useMemo(() => {
    return newPasswordParseResult.success;
  }, [newPasswordParseResult]);

  const onChangePasswordPress = useCallback(() => {
    dispatch(changePassword(newPassword));
    setCurrentPassword(EMPTY_STRING);
  }, [newPassword]);

  return (
    <AbsolutePositionedScreen>
      <Stack p={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
          <InputText>Current Password</InputText>
          <Row>
            <Input
              flex={1}
              variant="outline"
              type="password"
              p={theme.space[1]}
              placeholder="the current password"
              value={currentPassword}
              onChangeText={(newText) => {
                setCurrentPassword(newText.trim());
              }}
              isInvalid={!isCurrentPasswordValid}
            />
          </Row>
          <InputValidationMessage
            isValid={account.password === currentPassword}
            message={
              currentPasswordParseResult.error?.errors[
                currentPasswordParseResult.error?.errors.length - 1
              ].message || 'The current password is incorrect.'
            }
          />
        </Stack>
        <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
          <InputText>Password</InputText>
          <Row>
            <Input
              flex={1}
              variant="outline"
              p={theme.space[1]}
              placeholder="the new password"
              value={newPassword}
              onChangeText={(newText) => {
                setNewPassword(newText.trim());
              }}
              isInvalid={!isNewPasswordValid}
            />
          </Row>
          <InputValidationMessage
            isValid={isNewPasswordValid}
            message={
              newPasswordParseResult.error?.errors[
                newPasswordParseResult.error?.errors.length - 1
              ].message || 'Invalid password.'
            }
          />
        </Stack>
      </Stack>
      <Row>
        <Button onPress={onChangePasswordPress}>Change Password</Button>
      </Row>
    </AbsolutePositionedScreen>
  );
}
