import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function RoleHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  console.log('Full user object:', user);
  console.log('User role specifically:', user?.role);

  const handleLogout = () => {
    Alert.alert("Logout","Are you sure you want to logout?",[{ text: "Cancel", style: "cancel" },{ text: "Logout", style: "destructive", onPress: logout }])
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'student': return 'school';
      case 'warden': return 'shield';
      case 'staff': return 'people';
      case 'technician': return 'construct';
      default: return 'person';
    }
  }

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'student': return '#4CAF50';
      case 'warden': return '#FF9800';
      case 'staff': return '#2196F3';
      case 'technician': return '#9C27B0';
      default: return '#666';
    }
  }

  const getQuickActions = () => {
    console.log('Current user role:', user?.role);
    console.log('Role type:', typeof user?.role);
    switch (user?.role?.toLowerCase()) {
      case 'student':
        return [
          { title: "Report Issue", icon: "add-circle", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "Report maintenance issues in your room!")},
          { title: "My Issues", icon: "list", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "Track your reported issues!")},
          { title: "Room Status", icon: "home", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Check your room maintenance status!")},
          { title: "Feedback", icon: "star", color: "#9C27B0", onPress: () => Alert.alert("Coming Soon", "Rate completed repairs!")}
        ]

      case 'warden':
        return [
          { title: "All Issues", icon: "eye", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Monitor all hostel maintenance issues!")},
          { title: "Assign Staff", icon: "people", color: "#9C27B0", onPress: () => Alert.alert("Coming Soon", "Assign issues to maintenance staff!")},
          { title: "Priority Issues", icon: "warning", color: "#F44336", onPress: () => Alert.alert("Coming Soon", "View urgent maintenance issues!")},
          { title: "Staff Management", icon: "settings", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "Manage maintenance staff!")},
          { title: "Reports", icon: "bar-chart", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "View maintenance reports!")},
          { title: "Block Overview", icon: "business", color: "#FF5722", onPress: () => Alert.alert("Coming Soon", "Overview of all hostel blocks!")}
        ]

      case 'staff':
        return [
          { title: "Assigned Issues", icon: "clipboard", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "View your assigned maintenance tasks!")},
          { title: "Update Progress", icon: "checkmark-circle", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "Update repair progress!")},
          { title: "Available Issues", icon: "list", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Browse available maintenance tasks!")},
          { title: "Schedule", icon: "calendar", color: "#9C27B0", onPress: () => Alert.alert("Coming Soon", "View your maintenance schedule!")}
        ]

      case 'technician':
        return [
          { title: "My Tasks", icon: "hammer", color: "#FF5722", onPress: () => Alert.alert("Coming Soon", "View your assigned repair tasks!")},
          { title: "Update Status", icon: "checkmark", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "Update task completion status!")},
          { title: "Parts Needed", icon: "construct", color: "#FF9800", onPress: () => Alert.alert("Coming Soon", "Request repair parts and materials!")},
          { title: "Time Tracking", icon: "time", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "Track time spent on repairs!")}
        ]

      default:
        return [
          { title: "Report Issue", icon: "add-circle", color: "#4CAF50", onPress: () => Alert.alert("Coming Soon", "Report maintenance issues!")},
          { title: "My Issues", icon: "list", color: "#2196F3", onPress: () => Alert.alert("Coming Soon", "View your issues!")}
        ]
    }
  };

  const getStatsForRole = () => {
    switch (user?.role?.toLowerCase()) {
      case 'student':
        return [
          { label: "Issues Reported", value: "0" },
          { label: "Issues Resolved", value: "0" },
          { label: "Pending", value: "0" }
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
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>RepairHub</Text>
        <Text style={styles.subtitle}>Welcome{user?.name ? `, ${user.name}` : ""}</Text>
      </View>

      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={[styles.roleIcon, { backgroundColor: getRoleColor(user?.role) }]}>
            <Ionicons name={getRoleIcon(user?.role)} size={24} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userRole}>{user?.role?.toUpperCase() || "UNKNOWN"}</Text>
            {user?.roomNumber && (
              <Text style={styles.userLocation}>Room {user.roomNumber}, Block {user.block}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {getQuickActions().map((action, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]} 
              onPress={action.onPress}
            >
              <Ionicons name={action.icon} size={24} color={action.color} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {getStatsForRole().map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logout Button */}
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


