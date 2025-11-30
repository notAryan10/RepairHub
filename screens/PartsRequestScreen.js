import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Button, TextInput, useTheme, Chip } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function PartsRequestScreen() {
    const [issues, setIssues] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [partName, setPartName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [description, setDescription] = useState('');
    const { user } = useAuth();
    const theme = useTheme();

    const fetchData = useCallback(async () => {
        if (!user?.token) return;
        try {
            const [issuesRes, requestsRes] = await Promise.all([
                axios.get(`${API_URL}/staff/assigned-issues`, { headers: { Authorization: `Bearer ${user.token}` }}),
                axios.get(`${API_URL}/parts-requests/my`, { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setIssues(issuesRes.data);
            setMyRequests(requestsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchData()
    }, [fetchData])

    const handleRequestParts = async () => {
        if (!partName || !quantity) {
            Alert.alert('Error', 'Part name and quantity are required')
            return
        }

        try {
            await axios.post(
                `${API_URL}/parts-requests`,
                { issueId: selectedIssue.id, partName, quantity: parseInt(quantity), description},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Parts request submitted successfully');
            setModalVisible(false)
            setPartName('')
            setQuantity('1')
            setDescription('')
            fetchData()
        } catch (error) {
            console.error('Error requesting parts:', error)
            Alert.alert('Error', 'Failed to submit parts request')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'APPROVED': return '#4CAF50';
            case 'REJECTED': return '#F44336';
            default: return '#757575';
        }
    }

    const renderIssueItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <Text variant="bodySmall" style={styles.location}>
                    Room {item.roomNumber}, Block {item.block}
                </Text>
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => { setSelectedIssue(item); setModalVisible(true); }}>
                    Request Parts
                </Button>
            </Card.Actions>
        </Card>
    )

    const renderRequestItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.partName}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white', fontSize: 10 }} compact>
                        {item.status}
                    </Chip>
                </View>
                <Text variant="bodySmall">Quantity: {item.quantity}</Text>
                {item.description && <Text variant="bodySmall" style={styles.description}>{item.description}</Text>}
                <Text variant="bodySmall" style={styles.issueTitle}>For: {item.issue.title}</Text>
            </Card.Content>
        </Card>
    )

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <ScrollView refreshing={refreshing} onRefresh={onRefresh}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>My Assigned Issues</Text>
                    <FlatList data={issues} renderItem={renderIssueItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No assigned issues.</Text>} scrollEnabled={false} />

                    <Text variant="titleLarge" style={styles.sectionTitle}>My Parts Requests</Text>
                    <FlatList data={myRequests} renderItem={renderRequestItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No parts requests yet.</Text>} scrollEnabled={false} />
                </ScrollView>
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)} >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Request Parts</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedIssue && (
                                <Text variant="bodyMedium" style={styles.issueInfo}>
                                    For: {selectedIssue.title}
                                </Text>
                            )}
                            <TextInput label="Part Name" value={partName} onChangeText={setPartName} style={styles.input} mode="outlined" />
                            <TextInput label="Quantity" value={quantity} onChangeText={setQuantity} style={styles.input} mode="outlined" keyboardType="numeric" />
                            <TextInput label="Description (Optional)" value={description} onChangeText={setDescription} style={styles.input} mode="outlined" multiline numberOfLines={3}/>
                            <Button mode="contained" onPress={handleRequestParts} style={styles.submitButton}>
                                Submit Request
                            </Button>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { padding: 16, paddingBottom: 8, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16 },
    card: { marginBottom: 12, backgroundColor: 'white', borderRadius: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontWeight: 'bold', flex: 1 },
    description: { color: '#666', marginTop: 4 },
    location: { color: '#888', marginTop: 8 },
    issueTitle: { color: '#2196F3', marginTop: 8 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666', paddingBottom: 20 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    issueInfo: { marginBottom: 16, color: '#666' },
    input: { marginBottom: 16 },
    submitButton: { marginTop: 8 }
});
