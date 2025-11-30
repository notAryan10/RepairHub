import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, Card, Avatar, ActivityIndicator, FAB, useTheme, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function StaffManagementScreen() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState('');
    const { user } = useAuth();
    const theme = useTheme();

    const fetchStaff = useCallback(async () => {
        if (!user?.token) return;
        try {
            const response = await axios.get(`${API_URL}/staff/list`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStaffList(response.data)
        } catch (error) {
            console.error('Error fetching staff:', error)
            Alert.alert('Error', 'Failed to load staff list')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user?.token])

    useEffect(() => {
        fetchStaff()
    }, [fetchStaff])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchStaff()
    }, [fetchStaff])

    const handleOptions = (item) => {
        Alert.alert('Options', `Manage ${item.name}`,
            [
                {text: 'Edit',onPress: () => {
                        setEditingStaff(item)
                        setEditName(item.name)
                        setEditEmail(item.email)
                        setEditRole(item.role || 'STAFF')
                        setEditModalVisible(true)
                    }
                },
                {text: 'Delete',onPress: () => handleDelete(item.id, item.name),style: 'destructive'},
                {text: 'Cancel',style: 'cancel'}
            ]
        );
    };

    const handleDelete = (id, name) => {
        Alert.alert('Confirm Delete',`Are you sure you want to delete ${name}?`,
            [
                {text: 'Cancel',style: 'cancel'},
                {text: 'Delete',style: 'destructive',onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/staff/${id}`, {
                                headers: { Authorization: `Bearer ${user.token}` }
                            });
                            Alert.alert('Success', 'Staff member deleted successfully')
                            fetchStaff()
                        } catch (error) {
                            console.error('Error deleting staff:', error)
                            Alert.alert('Error', 'Failed to delete staff member')
                        }
                    }
                }
            ]
        );
    };

    const handleUpdate = async () => {
        if (!editName || !editEmail) {
            Alert.alert('Error', 'Name and email are required')
            return
        }

        try {
            await axios.patch(
                `${API_URL}/staff/${editingStaff.id}`,
                { name: editName, email: editEmail, role: editRole },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Staff member updated successfully')
            setEditModalVisible(false)
            setEditingStaff(null)
            fetchStaff()
        } catch (error) {
            console.error('Error updating staff:', error)
            Alert.alert('Error', 'Failed to update staff member')
        }
    }

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <Avatar.Text size={50} label={item.name.substring(0, 2).toUpperCase()} style={{ backgroundColor: theme.colors.primary }} />
                <View style={styles.info}>
                    <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
                    <Text variant="bodyMedium" style={styles.email}>{item.email}</Text>
                    <View style={styles.roleContainer}>
                        <Ionicons name="briefcase" size={14} color="#666" />
                        <Text style={styles.role}>{item.role}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleOptions(item)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#999" />
                </TouchableOpacity>
            </Card.Content>
        </Card>
    )

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <FlatList
                    data={staffList}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={<Text style={styles.emptyText}>No staff members found.</Text>}
                />
            )}
            <FAB icon="plus" style={styles.fab} onPress={() => Alert.alert('Add Staff', 'Functionality to add new staff members.')} />

            <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)} >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Edit Staff Member</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <TextInput label="Name" value={editName} onChangeText={setEditName} style={styles.input} mode="outlined" />
                            <TextInput label="Email" value={editEmail} onChangeText={setEditEmail} style={styles.input} mode="outlined" keyboardType="email-address" />
                            <TextInput label="Role" value={editRole} onChangeText={setEditRole} style={styles.input} mode="outlined" />
                            <Button mode="contained" onPress={handleUpdate} style={styles.saveButton}>Save Changes</Button>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    card: { marginBottom: 12, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    info: { flex: 1, marginLeft: 16 },
    name: { fontWeight: 'bold' },
    email: { color: '#666', marginBottom: 4 },
    roleContainer: { flexDirection: 'row', alignItems: 'center' },
    role: { marginLeft: 4, color: '#888', fontSize: 12, textTransform: 'uppercase' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#2196F3' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    input: { marginBottom: 16 },
    saveButton: { marginTop: 8 }
});

