import renderer, { act } from 'react-test-renderer';

import { ListActionToast } from './ListActionToast';

jest.mock('native-base', () => {
  const React = require('react');
  const component =
    (name: string) =>
    ({ children, ...props }: any) =>
      React.createElement(name, props, children);

  return {
    Button: component('Button'),
    Divider: component('Divider'),
    Stack: component('Stack'),
    Text: component('Text'),
    useTheme: () => ({
      colors: {
        coolGray: { 700: '#374151', 800: '#1f2937', 900: '#111827' },
        success: { 400: '#34d399' },
        white: '#fff',
      },
    }),
  };
});

describe('ListActionToast', () => {
  it('renders its message without an undo action', () => {
    const tree = renderer.create(<ListActionToast message="Item deleted." />);

    expect(tree.root.findAllByType('Text' as any)[0].props.children).toBe(
      'Item deleted.',
    );
    expect(tree.root.findAllByType('Button' as any)).toHaveLength(0);
  });

  it('renders Undo and calls it when pressed', () => {
    const onUndo = jest.fn();
    const tree = renderer.create(
      <ListActionToast message="Item moved." onUndo={onUndo} />,
    );

    const button = tree.root.findByType('Button' as any);
    act(() => button.props.onPress());

    expect(button.props.children).toBe('UNDO');
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});
