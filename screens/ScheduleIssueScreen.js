import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, useTheme, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function ScheduleIssueScreen() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchIssues = useCallback(async () => {
        if (!user?.token) return;
        try {
            const response = await axios.get(`${API_URL}/staff/assigned-issues`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            const activeIssues = response.data.filter(issue => issue.status !== 'COMPLETED');
            setIssues(activeIssues)
        } catch (error) {
            console.error('Error fetching assigned issues:', error)
            Alert.alert('Error', 'Failed to load issues')
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

    const handleSchedule = async () => {
        if (!selectedIssue) return;
        try {
            await axios.patch(
                `${API_URL}/issues/${selectedIssue.id}/schedule`,
                { scheduledDate: date.toISOString() },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Issue scheduled successfully');
            setSelectedIssue(null);
            fetchIssues();
        } catch (error) {
            console.error('Error scheduling issue:', error);
            Alert.alert('Error', 'Failed to schedule issue');
        }
    }

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    }

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                    <Chip style={{ backgroundColor: '#2196F3' }} textStyle={{ color: 'white', fontSize: 10 }} compact>{item.status}</Chip>
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Location:</Text>
                    <Text variant="bodySmall">Room {item.roomNumber}, Block {item.block}</Text>
                </View>
                {item.scheduledDate && (
                    <View style={styles.infoRow}>
                        <Text variant="bodySmall" style={styles.infoLabel}>Scheduled:</Text>
                        <Text variant="bodySmall" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                            {new Date(item.scheduledDate).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => { setSelectedIssue(item); setShowDatePicker(true); }} >
                    {item.scheduledDate ? 'Reschedule' : 'Schedule'}
                </Button>
            </Card.Actions>
        </Card>
    )

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <FlatList data={issues} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} refreshing={refreshing} onRefresh={onRefresh}
                    ListEmptyComponent={<Text style={styles.emptyText}>No assigned issues to schedule.</Text>} />
            )}

            {selectedIssue && (
                <View style={styles.confirmContainer}>
                    <Text style={styles.confirmText}>
                        Schedule "{selectedIssue.title}"?
                    </Text>
                    {showDatePicker && (
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <DateTimePicker testID="dateTimePicker" value={date} mode="date" is24Hour={true} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDate} 
                            minimumDate={new Date()} 
                            maximumDate={new Date(new Date().setDate(new Date().getDate() + 5))} />
                        </View>
                    )}
                    <View style={styles.confirmButtons}>
                        <Button mode="outlined" onPress={() => setSelectedIssue(null)} style={styles.button}>Cancel</Button>
                        <Button mode="contained" onPress={handleSchedule} style={styles.button}>Confirm</Button>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 100 },
    card: { marginBottom: 16, backgroundColor: 'white' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    title: { flex: 1, marginRight: 8, fontWeight: 'bold' },
    description: { color: '#666', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { color: '#888', marginRight: 4 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
    confirmContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    confirmText: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
    confirmButtons: { flexDirection: 'row', justifyContent: 'space-around' },
    button: { minWidth: 100 }
});
