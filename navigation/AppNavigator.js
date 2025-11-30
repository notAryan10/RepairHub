import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import RoleHomeScreen from "../screens/RoleHomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ReportScreen from "../screens/ReportScreen";
import IssuesDisplay from "../screens/IssuesDisplay";
import RoomStatus from '../screens/RoomStatus';
import About from "../screens/About";
import HelpSupport from "../screens/HelpSupport";
import Notifications from "../screens/Notifications";
import Feedback from "../screens/Feedback";
import AssignIssueScreen from '../screens/AssignIssueScreen';
import AssignedIssuesScreen from '../screens/AssignedIssuesScreen';
import AvailableIssuesScreen from '../screens/AvailableIssuesScreen';
import ScheduleIssueScreen from '../screens/ScheduleIssueScreen';
import ReportsScreen from '../screens/ReportsScreen';
import StaffManagementScreen from '../screens/StaffManagementScreen';
import PartsRequestScreen from '../screens/PartsRequestScreen';
import PartsManagementScreen from '../screens/PartsManagementScreen';
import TimeTrackingScreen from '../screens/TimeTrackingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const iconName = route.name === 'Home' ? 'home' : 'person'
        return <Ionicons name={`${iconName}-outline`} size={size} color={color} />
      }, tabBarActiveTintColor: '#4CAF50', tabBarInactiveTintColor: 'gray', headerShown: false
    })} >
      <Tab.Screen name="Home" component={RoleHomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  )
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: "Edit Profile" }} />
          <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: true, title: "Report an Issue" }} />
          <Stack.Screen name="IssuesDisplay" component={IssuesDisplay} options={{ headerShown: true, title: "Your Issues" }} />
          <Stack.Screen name="RoomStatus" component={RoomStatus} options={{ headerShown: true, title: "Room Status" }} />
          <Stack.Screen name="About" component={About} options={{ title: "About" }} />
          <Stack.Screen name="HelpSupport" component={HelpSupport} options={{ title: "Help & Support" }} />
          <Stack.Screen name="Notifications" component={Notifications} options={{ title: "Notifications" }} />
          <Stack.Screen name="Feedback" component={Feedback} options={{ headerShown: true, title: "Feedback" }} />
          <Stack.Screen name="AssignIssue" component={AssignIssueScreen} options={{ headerShown: true, title: "Assign Issues" }} />
          <Stack.Screen name="AssignedIssues" component={AssignedIssuesScreen} options={{ headerShown: true, title: "My Assigned Issues" }} />
          <Stack.Screen name="AvailableIssues" component={AvailableIssuesScreen} options={{ headerShown: true, title: "Available Issues" }} />
          <Stack.Screen name="ScheduleIssue" component={ScheduleIssueScreen} options={{ headerShown: true, title: "Schedule Issue" }} />
          <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: true, title: "Maintenance Reports" }} />
          <Stack.Screen name="StaffManagement" component={StaffManagementScreen} options={{ headerShown: true, title: "Staff Management" }} />
          <Stack.Screen name="PartsRequest" component={PartsRequestScreen} options={{ headerShown: true, title: "Parts Request" }} />
          <Stack.Screen name="PartsManagement" component={PartsManagementScreen} options={{ headerShown: true, title: "Parts Requested" }} />
          <Stack.Screen name="TimeTracking" component={TimeTrackingScreen} options={{ headerShown: true, title: "Time Tracking" }} />
        </>
      )}
    </Stack.Navigator>
  )
}
