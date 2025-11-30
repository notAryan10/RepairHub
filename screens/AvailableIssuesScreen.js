import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function AvailableIssuesScreen() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchIssues = useCallback(async () => {
        if (!user?.token) return;
        try {
            const response = await axios.get(`${API_URL}/staff/available-issues`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            setIssues(response.data)
        } catch (error) {
            console.error('Error fetching available issues:', error)
            Alert.alert('Error', 'Failed to load available issues')
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

    const handleAssignToMe = async (issueId) => {
        try {
            await axios.patch(
                `${API_URL}/issues/${issueId}/assign`,
                { staffId: user.id },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Issue assigned to you successfully');
            fetchIssues()
        } catch (error) {
            console.error('Error assigning issue:', error);
            Alert.alert('Error', 'Failed to assign issue');
        }
    }

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip style={{ backgroundColor: '#FF9800', marginBottom: 4 }} textStyle={{ color: 'white', fontSize: 10 }} compact>{item.status}</Chip>
                        {item.priority && (
                            <Chip style={{ backgroundColor: item.priority === 3 ? '#F44336' : item.priority === 2 ? '#FF9800' : '#4CAF50' }} textStyle={{ color: 'white', fontSize: 10 }} compact>
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
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => handleAssignToMe(item.id)} >Assign to Me</Button>
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
                    ListEmptyComponent={<Text style={styles.emptyText}>No available issues found.</Text>} />
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
