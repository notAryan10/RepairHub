import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, useTheme, Paragraph, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';

const RoomStatus = () => {
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchRoomIssues = useCallback(async () => {
        if (!user?.token) return

        try {
            const response = await axios.get(`${API_URL}/room/issues`, {
                headers: {'Authorization': `Bearer ${user.token}`}
            })
            setRoomData(response.data)
        } catch (error) {
            console.error('Error fetching room issues:', error)
            Alert.alert('Error', 'Failed to load room status. Please try again.')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user?.token])

    useFocusEffect(
        useCallback(() => {
            fetchRoomIssues()
        }, [fetchRoomIssues])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchRoomIssues()
    }, [fetchRoomIssues])

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'IN_PROGRESS': return '#2196F3';
            case 'COMPLETED': return '#4CAF50';
            default: return '#757575';
        }
    }

    const renderItem = ({ item }) => (
        <Card style={styles.card} mode="elevated">
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white', fontSize: 10 }} compact>{item.status}</Chip>
                </View>

                <Text numberOfLines={2} style={styles.description}>
                    {item.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.infoRow}>
                        <Text variant="bodySmall" style={styles.infoLabel}>Reported By:</Text>
                        <Text variant="bodySmall">{item.reportedBy.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text variant="bodySmall" style={styles.infoLabel}>Date:</Text>
                        <Text variant="bodySmall">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>)
    }

    return (
        <View style={styles.container}>
            <View style={styles.roomHeader}>
                <Text variant="headlineSmall" style={styles.roomTitle}>Room Status</Text>
                {roomData && (<Text variant="titleMedium" style={styles.roomSubtitle}>Room {roomData.roomNumber}, Block {roomData.block}</Text>)}
            </View>

            <FlatList
                data={roomData?.issues || []} renderItem={renderItem} keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<View style={styles.emptyState}><Text variant="bodyLarge">No issues reported for this room.</Text><Button mode="contained" onPress={() => navigation.navigate('Report')} style={styles.button}>Report an Issue</Button></View>}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roomHeader: {
        backgroundColor: '#4CAF50',
        padding: 20,
        paddingTop: 60,
        alignItems: 'center',
        marginBottom: 10,
    },
    roomTitle: {
        color: 'white',
        fontWeight: 'bold',
    },
    roomSubtitle: {
        color: '#E8F5E8',
        marginTop: 5,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        flex: 1,
        marginRight: 8,
        fontWeight: 'bold',
    },
    description: {
        color: '#666',
        marginBottom: 12,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    infoLabel: {
        color: '#888',
        marginRight: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        padding: 20,
    },
    button: {
        marginTop: 16,
    }
});

export default RoomStatus;
