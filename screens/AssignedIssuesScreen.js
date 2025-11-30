import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function AssignedIssuesScreen() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [updating, setUpdating] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchIssues = useCallback(async () => {
        if (!user?.token) return;
        try {
            const response = await axios.get(`${API_URL} /staff/assigned - issues`, {
                headers: { Authorization: `Bearer ${user.token} ` }
            })
            setIssues(response.data)
        } catch (error) {
            console.error('Error fetching assigned issues:', error)
            Alert.alert('Error', 'Failed to load assigned issues')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user?.token])

    useEffect(() => {
        fetchIssues()
    }, [fetchIssues])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchIssues()
    }, [fetchIssues])

    const handleUpdateStatus = async (status) => {
        if (!selectedIssue) return;
        setUpdating(true);
        try {
            await axios.patch(
                `${API_URL} /issues/${selectedIssue.id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Status updated successfully');
            setModalVisible(false)
            fetchIssues()
        } catch (error) {
            console.error('Error updating status:', error)
            Alert.alert('Error', 'Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'ASSIGNED': return '#2196F3';
            case 'IN_PROGRESS': return '#2196F3';
            case 'COMPLETED': return '#4CAF50';
            default: return '#757575';
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip style={{ backgroundColor: getStatusColor(item.status), marginBottom: 4 }} textStyle={{ color: 'white', fontSize: 10 }} compact>{item.status}</Chip>
                        {item.priority && (
                            <Chip style={{ backgroundColor: item.priority === 3 ? '#F44336' : item.priority === 2 ? '#FF9800' : '#4CAF50' }} textStyle={{ color: 'white', fontSize: 10 }} compact >
                                {item.priority === 3 ? 'HIGH' : item.priority === 2 ? 'MEDIUM' : 'LOW'}
                            </Chip>
                        )}
                    </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Location:</Text>
                    <Text variant="bodySmall">Room {item.roomNumber}, Block {item.block}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Reported By:</Text>
                    <Text variant="bodySmall">{item.reportedBy.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Date:</Text>
                    <Text variant="bodySmall">{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                {item.images && item.images.length > 0 && (
                    <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
                        {item.images.map((img, idx) => (
                            <Image key={idx} source={{ uri: img.url }} style={styles.issueImage} />
                        ))}
                    </ScrollView>
                )}
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => { setSelectedIssue(item); setModalVisible(true); }} disabled={item.status === 'COMPLETED'} >
                    Update Status
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <FlatList data={issues} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} refreshing={refreshing} onRefresh={onRefresh}
                    ListEmptyComponent={<Text style={styles.emptyText}>No issues assigned to you yet.</Text>} />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)} >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Update Status</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.statusOption} onPress={() => handleUpdateStatus('IN_PROGRESS')} disabled={updating} >
                            <Ionicons name="construct" size={24} color="#2196F3" />
                            <Text style={styles.statusText}>In Progress</Text>
                            {selectedIssue?.status === 'IN_PROGRESS' && <Ionicons name="checkmark" size={24} color="#4CAF50" />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statusOption} onPress={() => handleUpdateStatus('COMPLETED')} disabled={updating}>
                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            <Text style={styles.statusText}>Completed</Text>
                            {selectedIssue?.status === 'COMPLETED' && <Ionicons name="checkmark" size={24} color="#4CAF50" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    card: { marginBottom: 16, backgroundColor: 'white' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    title: { flex: 1, marginRight: 8, fontWeight: 'bold' },
    description: { color: '#666', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { color: '#888', marginRight: 4 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    imageScroll: { marginTop: 12, marginBottom: 8 },
    issueImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
    statusOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    statusText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#333' }
});
