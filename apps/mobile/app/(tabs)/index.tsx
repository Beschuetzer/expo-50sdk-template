import type { HealthResponse } from '@expo-50sdk-template/shared-types';
import { VStack } from '@gluestack-ui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ThemeAwareButton } from '@/components/ui/ThemeAwareButton';
import { ThemeAwareScreen } from '@/components/ui/ThemeAwareScreen';
import { ThemeAwareSurface } from '@/components/ui/ThemeAwareSurface';
import {
  ThemeAwareHeading,
  ThemeAwareText,
} from '@/components/ui/ThemeAwareText';
import { verifyAuthenticatedEndpointRejectsAnonymousRequest } from '@/features/auth/client';
import { useOAuth2Auth } from '@/features/auth/hooks/useOAuth2Auth';
import {
  backendHealthQueryKey,
  useBackendHealthQuery,
} from '@/features/backend/hooks/useBackendHealthQuery';
import { setError } from '@/state/slices/generalSlice';
import { useAppDispatch } from '@/state/store';
import { useI18n, type TranslationKey } from '@/utils/i18n';

/*
 * The home screen intentionally uses FlashList even for this small starter
 * dataset so new template screens have a clear list-performance example.
 */
export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const [connectionStatus, setConnectionStatus] =
    useState<TranslationKey | null>(null);
  const [cacheStatus, setCacheStatus] = useState<TranslationKey | null>(null);
  const [securityStatus, setSecurityStatus] = useState<TranslationKey | null>(
    null,
  );
  const [refreshStatus, setRefreshStatus] = useState<TranslationKey | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { refetch: refetchBackendHealth } = useBackendHealthQuery();
  const {
    callAuthenticatedEndpoint,
    isReady: isAuthReady,
    refreshAuthenticatedSession,
    signOut,
    state: authState,
    user: authenticatedUser,
  } = useOAuth2Auth();
  const checklistItems = [
    t('checklist.replaceContent'),
    t('checklist.addRedux'),
    t('checklist.addScreens'),
  ];

  const onPressTestErrorModal = () => {
    dispatch(
      setError({
        message: t('errors.testErrorModalMessage'),
        name: 'DemoError',
        stack: t('errors.testErrorModalStack'),
        code: 'TEST_ERROR_MODAL',
        statusCode: 500,
      }),
    );
  };

  const onPressTestBackendConnection = async () => {
    setConnectionStatus('status.checkingBackend');

    try {
      const { data: result, error } = await refetchBackendHealth();
      if (error) {
        throw error;
      }

      setConnectionStatus(
        result?.status === 'ok'
          ? 'status.backendSuccess'
          : 'errors.unexpectedBackendStatus',
      );
      setCacheStatus('status.backendCached');
    } catch (error) {
      setConnectionStatus('errors.backendUnavailable');
      dispatch(
        setError({
          message:
            error instanceof Error
              ? error.message
              : t('errors.backendRequestFailed'),
          name: 'BackendConnectionError',
        }),
      );
    }
  };

  const onPressReadBackendCache = () => {
    const cachedHealth = queryClient.getQueryData<HealthResponse>(
      backendHealthQueryKey,
    );
    setCacheStatus(cachedHealth ? 'status.cacheHit' : 'status.cacheMiss');
  };

  const onPressTestAuthenticatedEndpoint = async () => {
    await callAuthenticatedEndpoint();
  };

  const onPressTestTokenRefresh = async () => {
    setRefreshStatus('status.refreshingToken');
    try {
      await refreshAuthenticatedSession();
      setRefreshStatus('status.tokenRefreshSuccess');
    } catch (error) {
      setRefreshStatus('errors.tokenRefreshFailed');
      dispatch(
        setError({
          message:
            error instanceof Error
              ? error.message
              : t('errors.tokenRefreshFailed'),
          name: 'TokenRefreshError',
        }),
      );
    }
  };

  const onPressSignOut = async () => {
    try {
      await signOut();
      setRefreshStatus('status.signedOut');
    } catch (error) {
      setRefreshStatus('errors.signOutFailed');
      dispatch(
        setError({
          message:
            error instanceof Error ? error.message : t('errors.signOutFailed'),
          name: 'SignOutError',
        }),
      );
    }
  };

  const onPressTestAnonymousEndpoint = async () => {
    setSecurityStatus('status.checkingAnonymousAccess');

    try {
      await verifyAuthenticatedEndpointRejectsAnonymousRequest();
      setSecurityStatus('status.anonymousRequestRejected');
    } catch (error) {
      setSecurityStatus('errors.anonymousRequestAccepted');
      dispatch(
        setError({
          message:
            error instanceof Error
              ? error.message
              : t('errors.anonymousRequestFailed'),
          name: 'AnonymousEndpointSecurityError',
        }),
      );
    }
  };

  const authenticatedStatus =
    authState === 'authenticating'
      ? 'status.authenticating'
      : authState === 'loading'
        ? 'status.loadingAuthenticatedRequest'
        : authState === 'cancelled'
          ? 'status.authenticationCancelled'
          : authState === 'success'
            ? 'status.authenticatedRequestSuccess'
            : authState === 'error'
              ? 'errors.authenticationFailed'
              : null;

  const onPressClearBackendCache = () => {
    queryClient.removeQueries({ queryKey: backendHealthQueryKey });
    setCacheStatus('status.cacheCleared');
  };

  return (
    <ThemeAwareScreen
      flashListProps={{
        data: checklistItems,
        estimatedItemSize: 56,
        keyExtractor: (item) => item,
        renderItem: ({ item }) => (
          <ThemeAwareSurface
            darkBackground="$backgroundDark900"
            lightBackground="$coolGray50"
            borderRadius="$lg"
            mb="$2"
            p="$4"
          >
            <ThemeAwareText>• {item}</ThemeAwareText>
          </ThemeAwareSurface>
        ),
      }}
      absolutelyPositionedJsx={
        <VStack space="md" p="$4">
          <ThemeAwareButton onPress={onPressTestErrorModal} variant="solid">
            {t('actions.testErrorModal')}
          </ThemeAwareButton>
          <ThemeAwareButton
            onPress={onPressTestBackendConnection}
            variant="outline"
          >
            {t('actions.testBackendConnection')}
          </ThemeAwareButton>
          <ThemeAwareButton
            disabled={authState === 'authenticating' || authState === 'loading'}
            onPress={onPressTestAuthenticatedEndpoint}
            variant="outline"
          >
            {t('actions.testAuthenticatedEndpoint')}
          </ThemeAwareButton>
          <ThemeAwareButton
            disabled={authState === 'authenticating' || authState === 'loading'}
            onPress={onPressTestTokenRefresh}
            variant="outline"
          >
            {t('actions.testTokenRefresh')}
          </ThemeAwareButton>
          <ThemeAwareButton
            disabled={authState === 'authenticating' || authState === 'loading'}
            onPress={onPressSignOut}
            variant="outline"
          >
            {t('actions.signOut')}
          </ThemeAwareButton>
          {!isAuthReady && authState === 'idle' ? (
            <ThemeAwareText>
              {t('status.preparingAuthentication')}
            </ThemeAwareText>
          ) : null}
          <ThemeAwareButton
            onPress={onPressTestAnonymousEndpoint}
            variant="outline"
          >
            {t('actions.testAnonymousEndpoint')}
          </ThemeAwareButton>
          <ThemeAwareButton onPress={onPressReadBackendCache} variant="outline">
            {t('actions.readBackendCache')}
          </ThemeAwareButton>
          <ThemeAwareButton
            onPress={onPressClearBackendCache}
            variant="outline"
          >
            {t('actions.clearBackendCache')}
          </ThemeAwareButton>
          {connectionStatus ? (
            <ThemeAwareText>{t(connectionStatus)}</ThemeAwareText>
          ) : null}
          {cacheStatus ? (
            <ThemeAwareText>{t(cacheStatus)}</ThemeAwareText>
          ) : null}
          {authenticatedStatus ? (
            <ThemeAwareText>{t(authenticatedStatus)}</ThemeAwareText>
          ) : null}
          {refreshStatus ? (
            <ThemeAwareText>{t(refreshStatus)}</ThemeAwareText>
          ) : null}
          {securityStatus ? (
            <ThemeAwareText>{t(securityStatus)}</ThemeAwareText>
          ) : null}
          {authenticatedUser ? (
            <ThemeAwareText>
              {authenticatedUser.subject ?? 'Authenticated user'}
            </ThemeAwareText>
          ) : null}
        </VStack>
      }
    >
      <VStack space="lg" p="$4">
        <ThemeAwareHeading size="2xl">{t('app.title')}</ThemeAwareHeading>
        <ThemeAwareText size="md">{t('app.description')}</ThemeAwareText>
        <ThemeAwareHeading size="sm">{t('checklist.title')}</ThemeAwareHeading>
      </VStack>
    </ThemeAwareScreen>
  );
}
