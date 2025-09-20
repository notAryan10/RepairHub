import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function SignupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Signup Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate("Login")} />
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
