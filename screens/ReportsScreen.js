import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, ActivityIndicator, Card, useTheme } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth()
    const theme = useTheme()

    const fetchStats = useCallback(async () => {
        if (!user?.token) return
        try {
            const response = await axios.get(`${API_URL}/warden/stats/detailed`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            setStats(response.data)
        } catch (error) {
            console.error('Error fetching reports:', error)
            Alert.alert('Error', 'Failed to load reports')
        } finally {
            setLoading(false)
        }
    }, [user?.token])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        )
    }

    if (!stats) {
        return (
            <View style={styles.centered}>
                <Text>No data available</Text>
            </View>
        )
    }

    const categoryData = stats.byCategory.map((item, index) => ({
        name: item.name,
        population: item.count,
        color: ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336'][index % 5],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
    }))

    const statusData = {
        labels: stats.byStatus.map(item => item.name),
        datasets: [{
            data: stats.byStatus.map(item => item.count)
        }]
    }

    return (
        <ScrollView style={styles.container}>
            <Text variant="headlineSmall" style={styles.header}>Maintenance Reports</Text>

            <Card style={styles.card}>
                <Card.Title title="Issues by Category" />
                <Card.Content>
                    <PieChart data={categoryData} width={screenWidth - 60} height={220} chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`}} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Issues by Status" />
                <Card.Content>
                    <BarChart data={statusData} width={screenWidth - 60} height={220} yAxisLabel="" chartConfig={{ backgroundColor: "#ffffff", backgroundGradientFrom: "#ffffff", backgroundGradientTo: "#ffffff", decimalPlaces: 0, 
                            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 16 }
                        }} style={{ marginVertical: 8, borderRadius: 16 }} />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Priority Breakdown" />
                <Card.Content>
                    <View style={styles.priorityGrid}>
                        {stats.byPriority.map((item, index) => (
                            <View key={index} style={[styles.priorityItem, { borderLeftColor: item.name === 'HIGH' ? '#F44336' : item.name === 'MEDIUM' ? '#FF9800' : '#4CAF50' }]}>
                                <Text style={styles.priorityCount}>{item.count}</Text>
                                <Text style={styles.priorityLabel}>{item.name}</Text>
                            </View>
                        ))}
                    </View>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 16, fontWeight: 'bold', textAlign: 'center' },
    card: { marginBottom: 16, backgroundColor: 'white', borderRadius: 12 },
    priorityGrid: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
    priorityItem: { alignItems: 'center', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, minWidth: '30%', borderLeftWidth: 4, marginBottom: 8 },
    priorityCount: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    priorityLabel: { fontSize: 12, color: '#666' }
});
