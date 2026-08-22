import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { useAlertOnUnSavedWork } from './useAlertOnUnSavedWork';

const mockAddListener = jest.fn();
const mockDispatch = jest.fn();
let mockBeforeRemoveHandler: ((e: any) => void) | undefined;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    addListener: (event: string, handler: (e: any) => void) => {
      if (event === 'beforeRemove') {
        mockBeforeRemoveHandler = handler;
      }
      mockAddListener(event, handler);
      return jest.fn(); // unsubscribe
    },
    dispatch: mockDispatch,
  }),
}));

type HookResult = ReturnType<typeof useAlertOnUnSavedWork>;

function TestComponent(props: {
  isDirty: boolean;
  onResult: (result: HookResult) => void;
}) {
  const result = useAlertOnUnSavedWork({
    isDirty: props.isDirty,
    message: 'You have unsaved changes.',
  });
  props.onResult(result);
  return null;
}

function renderHook(isDirty: boolean) {
  let latest: HookResult | undefined;
  const onResult = (result: HookResult) => {
    latest = result;
  };
  let renderer: ReactTestRenderer;

  act(() => {
    renderer = create(
      <TestComponent isDirty={isDirty} onResult={onResult} />,
    );
  });

  return {
    getResult: () => latest as HookResult,
    rerender: (nextIsDirty: boolean) => {
      act(() => {
        renderer.update(
          <TestComponent isDirty={nextIsDirty} onResult={onResult} />,
        );
      });
    },
  };
}

const FAKE_ACTION = { type: 'GO_BACK' };

function triggerBeforeRemove() {
  const preventDefault = jest.fn();
  act(() => {
    mockBeforeRemoveHandler?.({
      preventDefault,
      data: { action: FAKE_ACTION },
    });
  });
  return preventDefault;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockBeforeRemoveHandler = undefined;
});

describe('useAlertOnUnSavedWork', () => {
  it('does not intercept navigation when there is no unsaved work', () => {
    renderHook(false);

    const preventDefault = triggerBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('intercepts navigation and shows the confirm modal when there is unsaved work', () => {
    const { getResult } = renderHook(true);

    const preventDefault = triggerBeforeRemove();

    expect(preventDefault).toHaveBeenCalled();
    expect(getResult().confirmModalProps.isVisible).toBe(true);
    expect(getResult().confirmModalProps.message).toBe(
      'You have unsaved changes.',
    );
  });

  it('resumes the blocked navigation action when the user confirms discarding', () => {
    const { getResult } = renderHook(true);
    triggerBeforeRemove();

    act(() => {
      getResult().confirmModalProps.onConfirm?.();
    });

    expect(mockDispatch).toHaveBeenCalledWith(FAKE_ACTION);
    expect(getResult().confirmModalProps.isVisible).toBe(false);
  });

  it('does not resume navigation when the user cancels', () => {
    const { getResult } = renderHook(true);
    triggerBeforeRemove();

    act(() => {
      getResult().confirmModalProps.onCancel?.();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(getResult().confirmModalProps.isVisible).toBe(false);
  });

  it('bypasses the guard once markAsSaved has been called', () => {
    const { getResult } = renderHook(true);

    act(() => {
      getResult().markAsSaved();
    });

    const preventDefault = triggerBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('does not show the modal anymore once isDirty becomes false', () => {
    const { rerender } = renderHook(true);
    rerender(false);

    const preventDefault = triggerBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
