import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Button, TextInput, useTheme, Chip } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function TimeTrackingScreen() {
    const [issues, setIssues] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [activeLog, setActiveLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const { user } = useAuth();
    const theme = useTheme();

    const fetchData = useCallback(async () => {
        if (!user?.token) return;
        try {
            const [issuesRes, logsRes, activeRes] = await Promise.all([
                axios.get(`${API_URL}/staff/assigned-issues`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                axios.get(`${API_URL}/time-logs/my`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                axios.get(`${API_URL}/time-logs/active`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
            ]);
            setIssues(issuesRes.data)
            setTimeLogs(logsRes.data)
            setActiveLog(activeRes.data)
        } catch (error) {
            console.error('Error fetching data:', error)
            Alert.alert('Error', 'Failed to load data')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user?.token])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        let interval;
        if (activeLog) {
            interval = setInterval(() => {
                const elapsed = Math.floor((new Date() - new Date(activeLog.startTime)) / 1000)
                setElapsedTime(elapsed)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [activeLog])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchData()
    }, [fetchData])

    const handleStartTimer = async (issueId) => {
        try {
            await axios.post(
                `${API_URL}/time-logs/start`,
                { issueId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            fetchData()
        } catch (error) {
            console.error('Error starting timer:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to start timer')
        }
    }

    const handleStopTimer = async () => {
        if (!activeLog) return
        try {
            await axios.patch(
                `${API_URL}/time-logs/${activeLog.id}/stop`,
                { notes },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Timer stopped successfully')
            setModalVisible(false)
            setNotes('')
            fetchData()
        } catch (error) {
            console.error('Error stopping timer:', error)
            Alert.alert('Error', 'Failed to stop timer')
        }
    }
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    const renderIssueItem = ({ item }) => {
        const isActive = activeLog?.issueId === item.id
        const canStartTimer = item.status === 'IN_PROGRESS'
        const totalTime = timeLogs.filter(log => log.issueId === item.id && log.duration).reduce((sum, log) => sum + log.duration, 0)

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.headerRow}>
                        <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                        {isActive && <Chip style={{ backgroundColor: '#4CAF50' }} textStyle={{ color: 'white', fontSize: 10 }} compact>ACTIVE</Chip>}
                    </View>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    <Text variant="bodySmall" style={styles.location}>
                        Room {item.roomNumber}, Block {item.block}
                    </Text>
                    <Text variant="bodySmall" style={styles.status}>
                        Status: {item.status}
                    </Text>
                    {totalTime > 0 && (
                        <Text variant="bodySmall" style={styles.totalTime}>
                            Total Time: {formatDuration(totalTime)}
                        </Text>
                    )}
                </Card.Content>
                <Card.Actions>
                    {isActive ? (
                        <Button mode="contained" onPress={() => setModalVisible(true)} buttonColor="#F44336">
                            Stop Timer
                        </Button>
                    ) : (
                        <Button mode="contained" onPress={() => handleStartTimer(item.id)} disabled={!!activeLog || !canStartTimer} >
                            {!canStartTimer ? 'Not In Progress' : 'Start Timer'}
                        </Button>
                    )}
                </Card.Actions>
            </Card>
        );
    };

    const renderTimeLogItem = ({ item }) => (
        <Card style={styles.logCard}>
            <Card.Content>
                <View style={styles.logHeader}>
                    <Text variant="titleSmall" style={styles.logTitle}>{item.issue.title}</Text>
                    <Chip style={{ backgroundColor: theme.colors.primary }} textStyle={{ color: 'white', fontSize: 10 }} compact>
                        {formatDuration(item.duration || 0)}
                    </Chip>
                </View>
                <Text variant="bodySmall" style={styles.logDate}>
                    {new Date(item.startTime).toLocaleString()}
                </Text>
                {item.notes && <Text variant="bodySmall" style={styles.logNotes}>{item.notes}</Text>}
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <ScrollView refreshing={refreshing} onRefresh={onRefresh}>
                    {activeLog && (
                        <Card style={styles.activeCard}>
                            <Card.Content>
                                <View style={styles.activeHeader}>
                                    <Ionicons name="timer" size={24} color="#2E7D32" />
                                    <Text variant="titleMedium" style={styles.activeTitle}>Active Timer</Text>
                                </View>
                                <View style={styles.timerDisplay}>
                                    <View style={styles.timeBlock}>
                                        <Text style={styles.timeValue}>{Math.floor(elapsedTime / 3600).toString().padStart(2, '0')}</Text>
                                        <Text style={styles.timeLabel}>hours</Text>
                                    </View>
                                    <Text style={styles.timeSeparator}>:</Text>
                                    <View style={styles.timeBlock}>
                                        <Text style={styles.timeValue}>{Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0')}</Text>
                                        <Text style={styles.timeLabel}>mins</Text>
                                    </View>
                                    <Text style={styles.timeSeparator}>:</Text>
                                    <View style={styles.timeBlock}>
                                        <Text style={styles.timeValue}>{(elapsedTime % 60).toString().padStart(2, '0')}</Text>
                                        <Text style={styles.timeLabel}>secs</Text>
                                    </View>
                                </View>
                                <Text variant="bodyMedium" style={styles.activeIssueTitle}>{activeLog.issue.title}</Text>
                            </Card.Content>
                        </Card>
                    )}

                    <Text variant="titleLarge" style={styles.sectionTitle}>My Assigned Issues</Text>
                    <FlatList
                        data={issues}
                        renderItem={renderIssueItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No assigned issues.</Text>}
                        scrollEnabled={false}
                    />

                    <Text variant="titleLarge" style={styles.sectionTitle}>Time Log History</Text>
                    <FlatList
                        data={timeLogs.filter(log => log.duration)}
                        renderItem={renderTimeLogItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No time logs yet.</Text>}
                        scrollEnabled={false}
                    />
                </ScrollView>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Stop Timer</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {activeLog && (
                                <>
                                    <Text variant="bodyLarge" style={styles.modalTime}>
                                        Time Elapsed: {formatTime(elapsedTime)}
                                    </Text>
                                    <Text variant="bodyMedium" style={styles.modalIssue}>
                                        {activeLog.issue.title}
                                    </Text>
                                </>
                            )}
                            <TextInput
                                label="Notes (Optional)"
                                value={notes}
                                onChangeText={setNotes}
                                style={styles.input}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                            />
                            <Button mode="contained" onPress={handleStopTimer} style={styles.submitButton}>
                                Stop Timer
                            </Button>
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
    activeCard: { margin: 16, backgroundColor: '#E8F5E9', borderRadius: 16, borderWidth: 2, borderColor: '#4CAF50', elevation: 4 },
    activeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    activeTitle: { fontWeight: 'bold', color: '#2E7D32', marginLeft: 8 },
    timerDisplay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
    timeBlock: { alignItems: 'center', marginHorizontal: 8 },
    timeValue: { fontSize: 40, fontWeight: 'bold', color: '#4CAF50', fontVariant: ['tabular-nums'] },
    timeLabel: { fontSize: 12, color: '#2E7D32', marginTop: 4, textTransform: 'uppercase' },
    timeSeparator: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', marginHorizontal: 4 },
    activeIssueTitle: { textAlign: 'center', color: '#2E7D32', fontWeight: '500' },
    sectionTitle: { padding: 16, paddingBottom: 8, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16 },
    card: { marginBottom: 12, backgroundColor: 'white', borderRadius: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontWeight: 'bold', flex: 1 },
    description: { color: '#666', marginTop: 4 },
    location: { color: '#888', marginTop: 8 },
    status: { color: '#666', marginTop: 4, fontWeight: '500' },
    totalTime: { color: '#2196F3', marginTop: 4, fontWeight: '600' },
    logCard: { marginBottom: 8, backgroundColor: 'white', borderRadius: 8 },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    logTitle: { fontWeight: '600', flex: 1 },
    logDate: { color: '#888', marginBottom: 4 },
    logNotes: { color: '#666', fontStyle: 'italic' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666', paddingBottom: 20 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTime: { fontWeight: 'bold', color: '#4CAF50', marginBottom: 8 },
    modalIssue: { marginBottom: 16, color: '#666' },
    input: { marginBottom: 16 },
    submitButton: { marginTop: 8 }
});
