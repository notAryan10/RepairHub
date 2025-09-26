import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const sampleIssues = [
  { id: "1", title: "Leaking Pipe", status: "Pending" },
  { id: "2", title: "Broken AC", status: "In Progress" },
  { id: "3", title: "Electrical Fault", status: "Resolved" },
];

export default function IssuesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issues</Text>

      <FlatList
        data={sampleIssues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.status}>{item.status}</Text>
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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  status: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
});
