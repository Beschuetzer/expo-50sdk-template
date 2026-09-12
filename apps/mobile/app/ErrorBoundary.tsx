import React, { ErrorInfo, PropsWithChildren } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

import { reportDiagnostic } from '@/utils/diagnostics';

type ErrorBoundaryProps = PropsWithChildren;

type ErrorBoundaryState = {
  error: Error | null;
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportDiagnostic(error, {
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary',
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
          <Text style={[styles.alignCenter, styles.largeHeading]}>
            Error Encountered
          </Text>
          <Text style={[styles.alignCenter, styles.smallHeading]}>
            Message:{' '}
          </Text>
          <Text>{this.state.error?.message}</Text>
          <Text style={[styles.alignCenter, styles.smallHeading]}>Stack: </Text>
          <View style={styles.paddingBottom}>
            <Text>Stack: {this.state.error?.stack}</Text>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  alignCenter: {
    textAlign: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  smallHeading: {
    fontSize: 16,
    fontWeight: '900',
  },
  largeHeading: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 10,
  },
  paddingBottom: {
    paddingBottom: 100,
  },
});
