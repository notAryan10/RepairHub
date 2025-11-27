import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

import API_URL from '../config';

export default function Feedback() {
    const navigation = useNavigation()
    const { user } = useAuth()
    const [category, setCategory] = useState('suggestion')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [rating, setRating] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const categories = [
        { value: 'suggestion', label: 'Suggestion', icon: 'bulb', color: '#FF9800' },
        { value: 'bug', label: 'Bug Report', icon: 'bug', color: '#F44336' },
        { value: 'feature', label: 'Feature Request', icon: 'rocket', color: '#2196F3' },
        { value: 'complaint', label: 'Complaint', icon: 'warning', color: '#FF5722' },
        { value: 'praise', label: 'Praise', icon: 'heart', color: '#4CAF50' }
    ]

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Error', 'Please fill in all required fields')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await axios.post(
                `${API_URL}/feedback`,
                { category, subject, message, rating: rating > 0 ? rating : null },
                { headers: { Authorization: `Bearer ${user.token}` } }
            )

            if (response.data.success) {
                Alert.alert(
                    'Feedback Submitted',
                    'Thank you for your feedback! We appreciate your input and will review it shortly.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                )

                setSubject('')
                setMessage('')
                setRating(0)
                setCategory('suggestion')
            }
        } catch (error) {
            console.error('Error submitting feedback:', error)
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to submit feedback. Please try again.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStars = () => {
        return (
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rate your experience</Text>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color={star <= rating ? '#FF9800' : '#ccc'} style={styles.star} />
                        </TouchableOpacity>
                    ))}
                </View>
                {rating > 0 && (
                    <Text style={styles.ratingText}>
                        {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                    </Text>)}
            </View>
        )
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Ionicons name="chatbox-ellipses" size={60} color="#fff" />
                <Text style={styles.title}>We'd Love Your Feedback</Text>
                <Text style={styles.subtitle}>Help us improve RepairHub</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Feedback Type</Text>
                <View style={styles.categoriesGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[styles.categoryCard, category === cat.value && styles.selectedCategory, { borderColor: cat.color }]}
                            onPress={() => setCategory(cat.value)}>
                            <Ionicons name={cat.icon} size={24} color={category === cat.value ? cat.color : '#999'} />
                            <Text style={[styles.categoryText, category === cat.value && { color: cat.color, fontWeight: '600' }]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {renderStars()}

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Subject *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Brief description of your feedback"
                    value={subject} onChangeText={setSubject} maxLength={100}
                />
                <Text style={styles.charCount}>{subject.length}/100</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Your Message *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Please provide detailed feedback..."
                    value={message} onChangeText={setMessage} multiline numberOfLines={6} maxLength={500} textAlignVertical="top" />
                <Text style={styles.charCount}>{message.length}/500</Text>
            </View>

            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color="#2196F3" />
                <Text style={styles.infoText}>
                    Your feedback will be reviewed by our team. We typically respond within 24-48 hours.
                </Text>
            </View>

            <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                    </>)}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="#4CAF50" />
                <Text style={styles.backButtonText}>Cancel</Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#E8F5E8',
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    selectedCategory: {
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
        marginTop: 6,
        textAlign: 'center',
    },
    ratingContainer: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    stars: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    star: {
        marginHorizontal: 4,
    },
    ratingText: {
        fontSize: 14,
        color: '#FF9800',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        minHeight: 120,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: '#E3F2FD',
        margin: 16,
        marginTop: 0,
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: 13,
        color: '#1976D2',
        marginLeft: 10,
        flex: 1,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        margin: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
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
