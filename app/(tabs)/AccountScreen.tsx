import {
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  VStack,
} from '@gluestack-ui/themed';
import { type NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { AbsolutePositionedScreen } from '@/components/AbsolutelyPositionedScreen';
import { InputValidationMessage } from '@/components/InputValidationMessage';
import { UserAccountRenderer } from '@/components/UserAccountRenderer';
import { InputText } from '@/components/forms/InputText';
import { ListHeaderRight } from '@/components/header/ListHeaderRight';
import { useMenu } from '@/components/hooks/useMenu';
import {
  ConfirmModal,
  ConfirmModalProps,
} from '@/components/modals/ConfirmModal';
import { BFF_SERVICE } from '@/components/services/BffService';
import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { type AppParamList, Routes } from '@/constants/navigation';
import { EMAIL_SCHEMA, PASSWORD_SCHEMA } from '@/constants/schema';
import {
  ACCOUNT_INITIAL,
  accountSelector,
  setAccount,
} from '@/state/slices/generalSlice';
import { tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  createUser,
  deleteUser,
  loadAll,
  login,
  saveAll,
} from '@/state/thunks';
import { UserAccount } from '@/types/bffService';
import { resetConfirmModalProps } from '@/utils/helpers';

type UsernameAvailability = {
  isAvailable: boolean;
} & Pick<UserAccount, 'email'>;

const USERNAME_AVAILABILITY_INITIAL = Object.freeze({
  email: EMPTY_STRING,
  isAvailable: false,
});

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const dispatch = useAppDispatch();
  const userAccount = useSelector(accountSelector);
  const tasks = useAppSelector(tasksSelector);

  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    { isVisible: false } as ConfirmModalProps,
  );
  const [email, setEmail] = useState(userAccount.email || EMPTY_STRING);
  const [password, setPassword] = useState(
    userAccount.password || EMPTY_STRING,
  );
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailability>(USERNAME_AVAILABILITY_INITIAL);

  const emailParseResult = useMemo(
    () => EMAIL_SCHEMA.safeParse(email),
    [email],
  );
  const passwordParseResult = useMemo(
    () => PASSWORD_SCHEMA.safeParse(password),
    [password],
  );
  const isEmailValid = useMemo(
    () => emailParseResult.success,
    [emailParseResult],
  );
  const isPasswordValid = useMemo(
    () => passwordParseResult.success,
    [passwordParseResult],
  );

  const onCheckUsernameAvailability = useCallback(async () => {
    const isEmailAvailable = await BFF_SERVICE.checkIsEmailAvailable({
      email,
      dispatch,
    });
    setUsernameAvailability({ email, isAvailable: !!isEmailAvailable });
    setConfirmModalProps({
      title: isEmailAvailable ? 'Email is Free' : 'Email in Use',
      message: isEmailAvailable
        ? 'Click register to create an account'
        : `'${email}' already has an account. Try logging in instead.`,
      isVisible: true,
      cancelButton: { isVisible: false },
      confirmButton: { text: 'Ok' },
      onConfirm: async () => resetConfirmModalProps(setConfirmModalProps),
    });
  }, [email, dispatch]);

  const onDeletePress = useCallback(async () => {
    setUsernameAvailability(USERNAME_AVAILABILITY_INITIAL);
    setConfirmModalProps({
      title: 'Are You Sure?',
      message: `Deleting the account for '${userAccount.email}' cannot be undone and will delete all data associated with this account.`,
      isVisible: true,
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: async () => {
        dispatch(deleteUser());
        resetConfirmModalProps(setConfirmModalProps);
      },
    });
  }, [userAccount, dispatch]);

  const onLoginPress = useCallback(() => {
    dispatch(login({ email, password }));
  }, [email, password, dispatch]);

  const onLogoutPress = useCallback(() => {
    dispatch(setAccount(ACCOUNT_INITIAL));
  }, [dispatch]);

  const onChangePassword = useCallback(() => {
    navigation.navigate(Routes.PasswordResetScreen);
  }, [navigation]);

  const onRegisterPress = useCallback(async () => {
    dispatch(createUser({ email, password }));
  }, [email, password, dispatch]);

  const onSyncNowPress = useCallback(() => {
    dispatch(saveAll({ tasks }));
  }, [tasks, dispatch]);

  const onLoadFromDbPress = useCallback(() => {
    dispatch(loadAll());
  }, [dispatch]);

  useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          options={
            userAccount._id
              ? [
                  { text: 'Sync Now', onPress: onSyncNowPress },
                  { text: 'Load from Db', onPress: onLoadFromDbPress },
                  { text: 'Delete', onPress: onDeletePress },
                  { text: 'Reset Password', onPress: onChangePassword },
                ]
              : []
          }
        />
      ),
      headerTitle: userAccount._id ? 'Account Page' : 'Create an Account',
    }),
  });

  return (
    <AbsolutePositionedScreen>
      <VStack p={FORM_INTER_ITEM_SPACING}>
        <VStack mt={FORM_INTER_ITEM_SPACING}>
          <InputText>Email</InputText>
          <Input flex={1} variant="outline" isInvalid={!isEmailValid}>
            <InputField
              placeholder="myemail@domain.com"
              value={email}
              onChangeText={(newText) => {
                setEmail(newText.trim());
                setUsernameAvailability(USERNAME_AVAILABILITY_INITIAL);
              }}
            />
          </Input>
          <InputValidationMessage
            isValid={isEmailValid}
            message={
              emailParseResult.error?.errors[
                emailParseResult.error.errors.length - 1
              ].message || 'Invalid Email Format'
            }
          />
        </VStack>
        <VStack mt={FORM_INTER_ITEM_SPACING}>
          <InputText>Password</InputText>
          <Input flex={1} variant="outline" isInvalid={!isPasswordValid}>
            <InputField
              type="password"
              placeholder="SuperSecretPassword!@#4"
              value={password}
              onChangeText={(newText) => setPassword(newText.trim())}
            />
          </Input>
          {userAccount._id ? (
            <HStack
              space="sm"
              justifyContent="space-between"
              mt={FORM_INTER_ITEM_SPACING}
            >
              <Button
                flex={1}
                isDisabled={!userAccount._id}
                onPress={onLogoutPress}
              >
                <ButtonText>Logout</ButtonText>
              </Button>
            </HStack>
          ) : (
            <HStack
              space="sm"
              justifyContent="space-between"
              mt={FORM_INTER_ITEM_SPACING}
            >
              <Button
                flex={1}
                isDisabled={
                  !!userAccount._id || !isEmailValid || !isPasswordValid
                }
                onPress={onLoginPress}
              >
                <ButtonText>Login</ButtonText>
              </Button>
              {usernameAvailability.isAvailable ? (
                <Button
                  flex={1}
                  isDisabled={!isEmailValid || !isPasswordValid}
                  onPress={onRegisterPress}
                >
                  <ButtonText>Register</ButtonText>
                </Button>
              ) : (
                <Button flex={1} onPress={onCheckUsernameAvailability}>
                  <ButtonText>Check Availability</ButtonText>
                </Button>
              )}
            </HStack>
          )}
          <InputValidationMessage
            isValid={isPasswordValid}
            message={
              passwordParseResult.error?.errors[
                passwordParseResult.error?.errors.length - 1
              ].message || 'Invalid password'
            }
          />
        </VStack>
        <UserAccountRenderer />
      </VStack>
      <ConfirmModal {...confirmModalProps} />
    </AbsolutePositionedScreen>
  );
}
