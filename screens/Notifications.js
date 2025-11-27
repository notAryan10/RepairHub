import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, RefreshControl } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
    const navigation = useNavigation()
    const { user } = useAuth()
    const [pushEnabled, setPushEnabled] = useState(true)
    const [emailEnabled, setEmailEnabled] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [notifications, setNotifications] = useState([])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        setTimeout(() => {
            setRefreshing(false)
        }, 1000)
    }, [])

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        )
    }

    const clearAll = () => {
        setNotifications([])
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}>
            <View style={styles.header}>
                <Ionicons name="notifications" size={60} color="#fff" />
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount} New</Text>
                    </View>)}
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="settings" size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Notification Settings</Text>
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="phone-portrait" size={20} color="#666" />
                        <Text style={styles.settingText}>Push Notifications</Text>
                    </View>
                    <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#ccc', true: '#A5D6A7' }} thumbColor={pushEnabled ? '#4CAF50' : '#f4f3f4'}/>
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="mail" size={20} color="#666" />
                        <Text style={styles.settingText}>Email Notifications</Text>
                    </View>
                    <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#ccc', true: '#A5D6A7' }} thumbColor={emailEnabled ? '#4CAF50' : '#f4f3f4'}/>
                </View>
            </View>

            {notifications.length > 0 && (
                <View style={styles.actionsCard}>
                    <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
                        <Ionicons name="checkmark-done" size={18} color="#4CAF50" />
                        <Text style={styles.actionBtnText}>Mark All as Read</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={clearAll}>
                        <Ionicons name="trash-outline" size={18} color="#F44336" />
                        <Text style={[styles.actionBtnText, { color: '#F44336' }]}>Clear All</Text>
                    </TouchableOpacity>
                </View>)}

            <View style={styles.notificationsContainer}>
                <Text style={styles.sectionTitle}>Recent Notifications</Text>

                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                        <Text style={styles.emptyStateText}>No notifications yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            You'll see updates about your issues here
                        </Text>
                    </View> ) : (
                    notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
                            onPress={() => markAsRead(notification.id)}>
                            <View style={styles.notificationIcon}>
                                <Ionicons name={notification.icon} size={24} color={notification.color} />
                            </View>
                            <View style={styles.notificationContent}>
                                <View style={styles.notificationHeader}>
                                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                                    {!notification.read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.notificationMessage}>{notification.message}</Text>
                                <Text style={styles.notificationTime}>{notification.time}</Text>
                            </View>
                        </TouchableOpacity>))
                )}
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="#4CAF50" />
                <Text style={styles.backButtonText}>Back to Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
    },
    actionsCard: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    actionBtnText: {
        fontSize: 14,
        color: '#4CAF50',
        marginLeft: 6,
        fontWeight: '500',
    },
    notificationsContainer: {
        margin: 16,
        marginTop: 0,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    notificationIcon: {
        marginRight: 12,
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 8,
        textAlign: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
        marginBottom: 32,
    },
    backButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
})
