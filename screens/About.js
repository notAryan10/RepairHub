import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import Constants from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

export default function About() {
  const navigation = useNavigation()
  const appName = Constants?.expoConfig?.name || Constants?.manifest?.name || 'RepairHub'
  const version = Constants?.expoConfig?.version || Constants?.manifest?.version || '1.0.0'

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{appName}</Text>
        <Text style={styles.version}>Version {version}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>What this app does</Text>
        </View>
        <Text style={styles.paragraph}>
          This app provides a comprehensive hostel maintenance management system.
          It authenticates users with JWTs, displays role-based UI, and connects to a backend and database
          for real time data synchronization.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="star" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Key Features</Text>
        </View>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>Authentication and role-based UI (Student, Warden, Staff, Technician)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>Real-time issue reporting and tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>Room status monitoring and statistics</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.featureText}>Robust network handling with timeouts and retries</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="help-circle" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Next Steps</Text>
        </View>
        <Text style={styles.paragraph}>
          Continue development by implementing remaining role specific features, adding push
          notifications for issue updates, and enhancing the user experience with better error
          handling and offline support.
        </Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#4CAF50" />
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  featureList: {
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 32,
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})