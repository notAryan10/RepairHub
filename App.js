import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const theme = {
  colors: {
    primary: '#4CAF50',
    accent: '#FF9800',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    placeholder: '#999999',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
