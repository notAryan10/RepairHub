import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Searchbar, Avatar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

export default function AssignIssueScreen() {
    const [issues, setIssues] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const navigation = useNavigation();

    const fetchData = useCallback(async () => {
        if (!user?.token) return;
        try {
            const [issuesRes, staffRes] = await Promise.all([
                axios.get(`${API_URL}/warden/issues`, { headers: { Authorization: `Bearer ${user.token}` } }),
                axios.get(`${API_URL}/staff/list`, { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            setIssues(issuesRes.data)
            setFilteredIssues(issuesRes.data)
            setStaffList(staffRes.data)
        } catch (error) {
            console.error('Error fetching data:', error)
            Alert.alert('Error', 'Failed to load data')
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.token])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchData()
    }, [fetchData])

    const onChangeSearch = query => {
        setSearchQuery(query);
        if (query) {
            const lowerCaseQuery = query.toLowerCase()
            const filtered = issues.filter(issue =>
                issue.title.toLowerCase().includes(lowerCaseQuery) ||
                issue.description.toLowerCase().includes(lowerCaseQuery) ||
                item.roomNumber.toLowerCase().includes(lowerCaseQuery)
            );
            setFilteredIssues(filtered)
        } else {
            setFilteredIssues(issues)
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'PLUMBING': return 'water';
            case 'ELECTRICAL': return 'flash';
            case 'FURNITURE': return 'bed';
            case 'WIFI': return 'wifi';
            default: return 'construct';
        }
    };

    const handleAssign = async (staffId) => {
        if (!selectedIssue) return;
        setAssigning(true);
        try {
            await axios.patch(
                `${API_URL}/issues/${selectedIssue.id}/assign`,
                { staffId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            Alert.alert('Success', 'Issue assigned successfully')
            setModalVisible(false)
            fetchData()
        } catch (error) {
            console.error('Error assigning issue:', error)
            Alert.alert('Error', 'Failed to assign issue')
        } finally {
            setAssigning(false)
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'ASSIGNED': return '#2196F3';
            case 'IN_PROGRESS': return '#2196F3';
            case 'COMPLETED': return '#4CAF50';
            default: return '#757575';
        }
    };

    const renderIssueItem = ({ item }) => (
        <Card style={[styles.card, { borderLeftColor: getStatusColor(item.status), borderLeftWidth: 4 }]}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Ionicons name={getCategoryIcon(item.category)} size={20} color={theme.colors.primary} />
                        </View>
                        <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                    </View>
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
                    <Text variant="bodySmall" style={styles.location}>
                        Room {item.roomNumber}, Block {item.block}
                    </Text>
                </View>
                {item.images && item.images.length > 0 && (
                    <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
                        {item.images.map((img, idx) => (
                            <Image key={idx} source={{ uri: img.url }} style={styles.issueImage} />
                        ))}
                    </ScrollView>
                )}
                <View style={styles.infoRow}>
                    <Text variant="bodySmall" style={styles.infoLabel}>Reported By:</Text>
                    <Text variant="bodySmall">{item.reportedBy.name}</Text>
                </View>
                {item.assignedTo && (
                    <View style={styles.infoRow}>
                        <Text variant="bodySmall" style={styles.infoLabel}>Assigned To:</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{item.assignedTo.name}</Text>
                    </View>
                )}
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => { setSelectedIssue(item); setModalVisible(true); }} disabled={item.status === 'COMPLETED'} >
                    {item.assignedTo ? 'Reassign' : 'Assign Staff'}
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Searchbar placeholder="Search issues..." onChangeText={onChangeSearch} value={searchQuery} style={styles.searchBar} />
            {loading ? (
                <ActivityIndicator size="large" style={styles.centered} />
            ) : (
                <FlatList data={filteredIssues} renderItem={renderIssueItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent}
                    refreshing={refreshing}onRefresh={onRefresh} ListEmptyComponent={<Text style={styles.emptyText}>No issues found</Text>}/>
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text variant="titleLarge">Select Staff</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList data={staffList} keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.staffItem} onPress={() => handleAssign(item.id)} disabled={assigning}>
                                    <Avatar.Text size={40} label={item.name.substring(0, 2).toUpperCase()} />
                                    <View style={styles.staffInfo}>
                                        <Text style={styles.staffName}>{item.name}</Text>
                                        <Text style={styles.staffEmail}>{item.email}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        />
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
    searchBar: { margin: 16, marginBottom: 8, elevation: 2 },
    card: { marginBottom: 16, backgroundColor: 'white', borderRadius: 12, elevation: 3 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    iconContainer: { padding: 8, borderRadius: 8, marginRight: 12 },
    title: { flex: 1, marginRight: 8, fontWeight: 'bold', fontSize: 16 },
    description: { color: '#666', marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    infoLabel: { color: '#888', marginRight: 4 },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    staffItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    imageScroll: { marginTop: 12 },
    issueImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
    staffInfo: { flex: 1, marginLeft: 12 },
    staffName: { fontSize: 16, fontWeight: '500' },
    staffEmail: { fontSize: 12, color: '#666' }
});
