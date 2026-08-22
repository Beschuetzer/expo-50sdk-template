import { useNavigation } from '@react-navigation/native';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { ConfirmModalProps } from '@/components/modals/ConfirmModal';
import { ModalWithBlurProps } from '@/components/modals/ModalWithBlur';
import { resetConfirmModalProps } from '@/utils/helpers';

export type UseAlertOnUnSavedWorkOptions = {
  /**
   *Whether there is currently unsaved work. While `true`, navigating away
   *from the screen (back button, header back, programmatic `goBack`/`navigate`,
   *etc.) will be intercepted and a confirmation modal will be shown.
   **/
  isDirty: boolean;
  /**
   *Content to show in the confirmation modal describing what would be lost.
   *Recompute this from the latest state on every render (e.g. a diff table) -
   *the hook always reads the most recent value when the modal opens.
   **/
  message: ReactNode | ReactNode[];
  title?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  /**
   *Passed through to the underlying `ModalWithBlur` to control the modal's
   *size (e.g. `{ width: '90%', height: '95%' }`).
   **/
  containerStyles?: ModalWithBlurProps['containerStyles'];
};

export type UseAlertOnUnSavedWorkResult = {
  /**
   *Spread onto a `<ConfirmModal {...confirmModalProps} />` rendered
   *anywhere in the screen's tree.
   **/
  confirmModalProps: ConfirmModalProps;
  /**
   *Call this right before an intentional/expected navigation away from the
   *screen (e.g. right after a successful save) to bypass the guard for that
   *one navigation. This is needed because state updates from a save action
   *(e.g. a dispatched thunk) may not be reflected in `isDirty` until after
   *the navigation already started.
   **/
  markAsSaved: () => void;
};

/**
 *Warns the user with a confirmation modal when they try to navigate away
 *from a screen with unsaved changes (`isDirty`), giving them the option to
 *keep editing or discard the changes and continue navigating away.
 **/
export function useAlertOnUnSavedWork(
  options: UseAlertOnUnSavedWorkOptions,
): UseAlertOnUnSavedWorkResult {
  const {
    isDirty,
    message,
    title = 'Discard Changes?',
    cancelButtonText = 'Keep Editing',
    confirmButtonText = 'Discard Changes',
    containerStyles,
  } = options;
  const navigation = useNavigation();

  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  const pendingNavigationAction = useRef<any>(null);
  const bypassGuardRef = useRef(false);
  const messageRef = useRef(message);
  messageRef.current = message;

  const markAsSaved = useCallback(() => {
    bypassGuardRef.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty || bypassGuardRef.current) return;

      e.preventDefault();
      pendingNavigationAction.current = e.data.action;
      setConfirmModalProps({
        isVisible: true,
        title,
        message: messageRef.current,
        cancelButton: { text: cancelButtonText, colorScheme: 'muted' },
        confirmButton: { text: confirmButtonText, colorScheme: 'red' },
        containerStyles,
        onCancel: () => {
          pendingNavigationAction.current = null;
          resetConfirmModalProps(setConfirmModalProps);
        },
        onConfirm: () => {
          resetConfirmModalProps(setConfirmModalProps);
          const action = pendingNavigationAction.current;
          pendingNavigationAction.current = null;
          if (action) navigation.dispatch(action);
        },
      });
    });

    return unsubscribe;
  }, [
    navigation,
    isDirty,
    title,
    cancelButtonText,
    confirmButtonText,
    containerStyles,
  ]);

  return { confirmModalProps, markAsSaved };
}
