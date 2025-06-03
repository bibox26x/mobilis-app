import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const NotFoundScreen: React.FC = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! This screen doesn't exist." }} />
      <View style={styles.container}>
        <Text style={styles.text}>This screen does not exist.</Text>
        <Link href="/">Go to home screen</Link>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default NotFoundScreen;
