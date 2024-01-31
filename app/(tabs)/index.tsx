import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { Counter } from '@/components/Counter';
import { Playground } from '@/components/Playground';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Counter />
      <Playground />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
