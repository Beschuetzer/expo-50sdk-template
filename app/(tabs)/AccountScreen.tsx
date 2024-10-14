import { Button, Heading, Input, Row, Stack, useTheme } from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { InputValidationMessage } from '@/components/InputValidationMessage';
import { UserAccountRenderer } from '@/components/UserAccountRenderer';
import { InputText } from '@/components/forms/InputText';
import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import { BFF_SERVICE, UserAccount } from '@/components/services/BffService';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { EMAIL_SCHEMA, PASSWORD_SCHEMA } from '@/constants/schema';
import {
  ACCOUNT_INITIAL,
  accountSelector,
  setAccount,
} from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';
import { createUser, deleteUser, login } from '@/state/thunks';
import { resetConfirmModalProps } from '@/utils/helpers';

type UsernameAvailability = {
  isAvailable: boolean;
} & Pick<UserAccount, 'email'>;

export default function AccountScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const userAccount = useSelector(accountSelector);

  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    { isVisible: false } as ConfirmModalProps,
  );
  const [email, setEmail] = useState(userAccount.email || EMPTY_STRING);
  const [password, setPassword] = useState(
    userAccount.password || EMPTY_STRING,
  );
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailability>({
      email: EMPTY_STRING,
      isAvailable: false,
    });
  const emailParseResult = useMemo(
    () => EMAIL_SCHEMA.safeParse(email),
    [email],
  );
  const passwordParseResult = useMemo(
    () => PASSWORD_SCHEMA.safeParse(password),
    [password],
  );
  const isEmailValid = useMemo(() => {
    return emailParseResult.success;
  }, [emailParseResult]);
  const isPasswordValid = useMemo(() => {
    return passwordParseResult.success;
  }, [passwordParseResult]);

  const onCheckUsernameAvailability = useCallback(async () => {
    const isEmailAvailable = await BFF_SERVICE.checkIsEmailAvailable({
      email,
      dispatch,
    });
    setUsernameAvailability({ email, isAvailable: !!isEmailAvailable });
  }, [email]);

  const onDeletePress = useCallback(async () => {
    setConfirmModalProps({
      title: `Are You Sure?`,
      message: `Deleting the account for '${userAccount.email}' cannot be undone and will delete all data associated with this account.`,
      isVisible: true,
      onCancel: () => {
        resetConfirmModalProps(setConfirmModalProps);
      },
      onConfirm: async () => {
        dispatch(deleteUser());
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  }, [userAccount]);

  const onLoginPress = useCallback(() => {
    dispatch(login({ email, password }));
  }, [email, password]);

  const onLogoutPress = useCallback(() => {
    dispatch(setAccount(ACCOUNT_INITIAL));
  }, []);

  const onRegisterPress = useCallback(async () => {
    dispatch(createUser({ email, password }));
  }, [email, password]);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <Row space={theme.space[FORM_INTER_ITEM_SPACING]}>
          <Button
            isDisabled={!isEmailValid || !isPasswordValid}
            onPress={onRegisterPress}
          >
            Register
          </Button>
          <Button isDisabled={!userAccount._id} onPress={onDeletePress}>
            Delete
          </Button>
          <Button
            isDisabled={!!userAccount._id || !isEmailValid || !isPasswordValid}
            onPress={onLoginPress}
          >
            Login
          </Button>
          <Button isDisabled={!userAccount._id} onPress={onLogoutPress}>
            Logout
          </Button>
        </Row>
      }
    >
      <Stack p={theme.space[FORM_INTER_ITEM_SPACING]}>
        {usernameAvailability.email ? (
          <Heading>
            '{usernameAvailability.email}' is
            {usernameAvailability.isAvailable ? '' : ' not'} available
          </Heading>
        ) : null}
        <Button onPress={onCheckUsernameAvailability}>
          Check Availability
        </Button>
        <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
          <InputText>Email</InputText>
          <Row>
            <Input
              flex={1}
              variant="outline"
              p={theme.space[1]}
              placeholder="myemail@domain.com"
              value={email}
              onChangeText={(newText) => {
                setEmail(newText.trim());
              }}
              isInvalid={!isEmailValid}
            />
          </Row>
          <InputValidationMessage
            isValid={isEmailValid}
            message={
              emailParseResult.error?.errors[
                emailParseResult.error.errors.length - 1
              ].message || 'Invalid Email Format'
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
              placeholder="SuperSecretPassword!@#4"
              value={password}
              onChangeText={(newText) => {
                setPassword(newText.trim());
              }}
              isInvalid={!isPasswordValid}
            />
          </Row>
          <InputValidationMessage
            isValid={isPasswordValid}
            message={
              passwordParseResult.error?.errors[
                passwordParseResult.error?.errors.length - 1
              ].message || 'Invalid password'
            }
          />
        </Stack>
        <UserAccountRenderer />
      </Stack>
      <ConfirmModal {...confirmModalProps} />
    </AbsolutePositionedScreen>
  );
}
