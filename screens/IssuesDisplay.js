import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Button } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, useTheme, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import API_URL from '../config';

const IssuesDisplay = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchIssues = useCallback(async () => {
        if (!user?.token) return;

        try {
            const response = await axios.get(`${API_URL}/reports`, { headers: { 'Authorization': `Bearer ${user.token}` } })
            setIssues(response.data.issues)
        } catch (error) {
            console.error(error)
            Alert.alert('Error', 'Failed to load your issues. Please try again.')
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token])

    useEffect(() => {
        fetchIssues()
    }, [fetchIssues])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchIssues()
    }, [fetchIssues])
    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'IN_PROGRESS': return '#2196F3';
            case 'COMPLETED': return '#4CAF50';
            default: return '#757575';
        }
    }, [])

    const renderItem = useCallback(({ item }) => (
        <Card style={styles.card} mode="elevated">
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white', fontSize: 10 }} compact>{item.status}</Chip>
                </View>

                <Paragraph numberOfLines={2} style={styles.description}>
                    {item.description}
                </Paragraph>

                <View style={styles.footer}>
                    <View style={styles.infoRow}>
                        <Text variant="bodySmall" style={styles.infoLabel}>Category:</Text>
                        <Text variant="bodySmall">{item.category}</Text>
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
    ), [getStatusColor])

    const emptyComponent = useMemo(() => (
        <View style={styles.emptyState}>
            <Text variant="bodyLarge">No issues reported yet.</Text>
            <Button title="Report an Issue" onPress={() => navigation.navigate('Report')} />
        </View>
    ), [navigation])

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={issues} renderItem={renderItem} keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={emptyComponent} />
        </View>
    );
};

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

export default IssuesDisplay;