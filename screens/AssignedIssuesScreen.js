import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function AssignedIssuesScreen() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchIssues = useCallback(async () => {
        if (!user?.token) return;
        try {
            const response = await axios.get(`${API_URL}/staff/assigned-issues`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            setIssues(response.data)
        } catch (error) {
            console.error('Error fetching assigned issues:', error)
            Alert.alert('Error', 'Failed to load assigned issues')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user?.token]);

    useEffect(() => {
        fetchIssues()
    }, [fetchIssues])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchIssues()
    }, [fetchIssues])

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
                    <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white', fontSize: 10 }} compact>{item.status}</Chip>
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
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => Alert.alert('Coming Soon', 'Status update feature coming soon!')}>
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
                <FlatList
                    data={issues}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={<Text style={styles.emptyText}>No issues assigned to you yet.</Text>}/>
            )}
        </View>
    );
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
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' }
});
