import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [roomNumber, setRoomNumber] = useState("");
  const [block, setBlock] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { register } = useAuth();

  const roles = [
    { label: "Student", value: "student" },
    { label: "Warden", value: "warden" },
    { label: "Staff", value: "staff" },
    { label: "Technician", value: "technician" }
  ];

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    if (role === "student" && (!roomNumber || !block)) {
      Alert.alert("Error", "Please provide room number and block for students")
      return
    }

    if (!phoneNumber) {
      Alert.alert("Error", "Please enter your phone number")
      return
    }

    setIsLoading(true);
    try {
  const result = await register(name, email, password, role, roomNumber, block, phoneNumber)
      if (!result.success) {
        Alert.alert("Registration Failed", result.error || "Registration failed")
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Saving...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView  style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}>
      <ScrollView contentContainerStyle={styles.scrollContainer}showsVerticalScrollIndicator={false}keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join RepairHub today</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Role</Text>
          <TouchableOpacity style={styles.roleSelector} onPress={() => setShowRoleModal(true)}>
            <Text style={styles.roleText}>
              {roles.find(r => r.value === role)?.label || "Select Role"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input}  placeholder="Enter your full name"  value={name} onChangeText={setName}/>

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="Enter your phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad"/>

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Enter your password" secureTextEntry value={password} onChangeText={setPassword}/>

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Confirm your password"  secureTextEntry  value={confirmPassword} onChangeText={setConfirmPassword}/>

          {role === "student" && (
            <>
              <Text style={styles.label}>Room Number</Text>
              <TextInput  style={styles.input}  placeholder="e.g., 101"  value={roomNumber} onChangeText={setRoomNumber} keyboardType="numeric"/>

              <Text style={styles.label}>Block</Text>
              <TextInput  style={styles.input}  placeholder="e.g., A, B, C" value={block} onChangeText={setBlock} autoCapitalize="characters"/>
            </>
          )}

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Already have an account? Log in
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showRoleModal} transparent animationType="slide" onRequestClose={() => setShowRoleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {roles.map((roleOption) => (
              <TouchableOpacity key={roleOption.value} style={[styles.roleOption, role === roleOption.value && styles.selectedRoleOption ]}
                onPress={() => {setRole(roleOption.value);
                  setShowRoleModal(false)}}>
                <Text style={[styles.roleOptionText,role === roleOption.value && styles.selectedRoleOptionText]}>
                  {roleOption.label}
                </Text>
                {role === roleOption.value && (
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  roleSelector: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  roleText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    color: "#4CAF50",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  roleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedRoleOption: {
    backgroundColor: "#E8F5E8",
  },
  roleOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedRoleOptionText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
});
