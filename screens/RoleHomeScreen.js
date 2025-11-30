import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import API_URL from '../config';

export default function RoleHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    reported: 0,
    resolved: 0,
    pending: 0
  });

  const fetchStats = useCallback(async () => {
    // console.log('fetchStats called');
    if (!user) {
      console.log('User is null');
      return;
    }
    if (!user.token) {
      console.log('User token is missing', user);
      return;
    }

    try {
      // console.log('Fetching stats from:', `${API_URL}/user/stats`);
      const response = await axios.get(`${API_URL}/user/stats`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // console.log('Stats received:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
        Alert.alert("Network Error", "Could not connect to server. Check your internet connection or server status.");
      } else {
        console.error('Error message:', error.message);
      }
    }
  }, [user?.token]);

  useFocusEffect(
    useCallback(() => {
      fetchStats()
    }, [fetchStats])
  )
  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [{ text: "Cancel", style: "cancel" }, { text: "Logout", style: "destructive", onPress: logout }])
  }, [logout])

  const roleIcon = useMemo(() => {
    switch (user?.role?.toLowerCase()) {
      case 'student': return 'school';
      case 'warden': return 'shield';
      case 'staff': return 'people';
      case 'technician': return 'construct';
      default: return 'person';
    }
  }, [user?.role])

  const roleColor = useMemo(() => {
    switch (user?.role?.toLowerCase()) {
      case 'student': return '#4CAF50';
      case 'warden': return '#FF9800';
      case 'staff': return '#2196F3';
      case 'technician': return '#9C27B0';
      default: return '#666';
    }
  }, [user?.role])

  const quickActions = useMemo(() => {
    switch (user?.role?.toLowerCase()) {
      case 'student':
        return [
          { title: "Report Issue", icon: "add-circle", color: "#4CAF50", onPress: () => navigation.navigate('Report') },
          { title: "My Issues", icon: "list", color: "#2196F3", onPress: () => navigation.navigate('IssuesDisplay') },
          { title: "Room Status", icon: "home", color: "#FF9800", onPress: () => navigation.navigate('RoomStatus') },
          { title: "Feedback", icon: "star", color: "#9C27B0", onPress: () => navigation.navigate('Feedback') }
        ]

      case 'warden':
        return [
          { title: "All Issues", icon: "eye", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Monitor all hostel maintenance issues!") },
          { title: "Assign Staff", icon: "people", color: "#9C27B0", onPress: () => navigation.navigate('AssignIssue') },
          { title: "Priority Issues", icon: "warning", color: "#F44336", onPress: () => Alert.alert("Coming Soon", "View urgent maintenance issues!") },
          { title: "Staff Management", icon: "settings", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "Manage maintenance staff!") },
          { title: "Reports", icon: "bar-chart", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "View maintenance reports!") },
          { title: "Block Overview", icon: "business", color: "#FF5722", onPress: () => Alert.alert("Coming Soon", "Overview of all hostel blocks!") }
        ]

      case 'staff':
        return [
          { title: "Assigned Issues", icon: "clipboard", color: "#2196F3", onPress: () => navigation.navigate('AssignedIssues') },
          { title: "Update Progress", icon: "checkmark-circle", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "Update repair progress!") },
          { title: "Available Issues", icon: "list", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Browse available maintenance tasks!") },
          { title: "Schedule", icon: "calendar", color: "#9C27B0", onPress: () => Alert.alert("Coming Soon", "View your maintenance schedule!") }
        ]

      case 'technician':
        return [
          { title: "My Tasks", icon: "hammer", color: "#FF5722", onPress: () => Alert.alert("Coming Soon", "View your assigned repair tasks!") },
          { title: "Update Status", icon: "checkmark", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "Update task completion status!") },
          { title: "Parts Needed", icon: "construct", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Request repair parts and materials!") },
          { title: "Time Tracking", icon: "time", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "Track time spent on repairs!") }
        ]

      default:
        return [
          { title: "Report Issue", icon: "add-circle", color: "#4CAF50", onPress: () => navigation.navigate('Report') },
          { title: "My Issues", icon: "list", color: "#2196F3", onPress: () => navigation.navigate('IssuesDisplay') }
        ]
    }
  }, [user?.role, navigation])

  const roleStats = useMemo(() => {
    switch (user?.role?.toLowerCase()) {
      case 'student':
        return [
          { label: "Issues Reported", value: stats.reported.toString() },
          { label: "Issues Resolved", value: stats.resolved.toString() },
          { label: "Pending", value: stats.pending.toString() }
        ]
      case 'warden':
        return [
          { label: "Total Issues", value: "0" },
          { label: "Urgent Issues", value: "0" },
          { label: "Resolved", value: "0" }
        ]
      case 'staff':
        return [
          { label: "Assigned Tasks", value: "0" },
          { label: "Completed", value: "0" },
          { label: "In Progress", value: "0" }
        ]
      case 'technician':
        return [
          { label: "Active Tasks", value: "0" },
          { label: "Completed", value: "0" },
          { label: "Parts Needed", value: "0" }
        ]
      default:
        return [
          { label: "Issues Reported", value: "0" },
          { label: "Issues Resolved", value: "0" },
          { label: "Pending", value: "0" }
        ]
    }
  }, [user?.role, stats])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>RepairHub</Text>
        <Text style={styles.subtitle}>Welcome{user?.name ? `, ${user.name}` : ""}</Text>
      </View>

      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={[styles.roleIcon, { backgroundColor: roleColor }]}>
            <Ionicons name={roleIcon} size={24} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userRole}>{user?.role?.toUpperCase() || "UNKNOWN"}</Text>
            {user?.roomNumber && (<Text style={styles.userLocation}>Room {user.roomNumber}, Block {user.block}</Text>)}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={[styles.actionCard, { borderLeftColor: action.color }]} onPress={action.onPress}>
              <Ionicons name={action.icon} size={24} color={action.color} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {roleStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#F44336" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E8F5E8",
  },
  userCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: "#999",
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 8,
  },
  statsCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  logoutButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});


