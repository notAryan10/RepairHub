import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Button, useTheme, Chip } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function PartsManagementScreen() {
    const [partsRequests, setPartsRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();

    const fetchPartsRequests = useCallback(async () => {
        if (!user?.token) return;
        try {
            const response = await axios.get(`${API_URL}/parts-requests`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setPartsRequests(response.data);
        } catch (error) {
            console.error('Error fetching parts requests:', error);
            Alert.alert('Error', 'Failed to load parts requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchPartsRequests();
    }, [fetchPartsRequests]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPartsRequests();
    }, [fetchPartsRequests]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.patch(
                `${API_URL}/parts-requests/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', `Request ${status.toLowerCase()} successfully`);
            fetchPartsRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update request status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'APPROVED': return '#4CAF50';
            case 'REJECTED': return '#F44336';
            default: return '#757575';
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.partName}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white', fontSize: 10 }} compact>
                        {item.status}
                    </Chip>
                </View>
                <Text variant="bodyMedium" style={styles.quantity}>Quantity: {item.quantity}</Text>
                {item.description && (
                    <Text variant="bodySmall" style={styles.description}>{item.description}</Text>
                )}
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Issue:</Text>
                    <Text variant="bodySmall">{item.issue.title}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Location:</Text>
                    <Text variant="bodySmall">Room {item.issue.roomNumber}, Block {item.issue.block}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Requested by:</Text>
                    <Text variant="bodySmall">{item.requestedBy.name}</Text>
                </View>
            </Card.Content>
            {item.status === 'PENDING' && (
                <Card.Actions>
                    <Button mode="outlined" onPress={() => handleUpdateStatus(item.id, 'REJECTED')} textColor="#F44336">
                        Reject
                    </Button>
                    <Button mode="contained" onPress={() => handleUpdateStatus(item.id, 'APPROVED')}>
                        Approve
                    </Button>
                </Card.Actions>
            )}
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <FlatList
                    data={partsRequests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={<Text style={styles.emptyText}>No parts requests found.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    card: { marginBottom: 12, backgroundColor: 'white', borderRadius: 12, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontWeight: 'bold', flex: 1 },
    quantity: { fontWeight: '600', marginBottom: 8 },
    description: { color: '#666', marginBottom: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { color: '#888', marginRight: 4 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
