import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const staffList = [
  { id: "1", name: "John Doe", role: "Technician" },
  { id: "2", name: "Jane Smith", role: "Supervisor" },
  { id: "3", name: "Alice Johnson", role: "Manager" },
];

export default function StaffScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff</Text>

      <FlatList
        data={staffList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  role: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
});
