import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

export default function HelpSupport() {
    const navigation = useNavigation()

    const handleEmailSupport = () => {
        Linking.openURL('mailto:aryanverma1857@gmail.com?subject=Help Request')
    }

    const handleCallSupport = () => {
        Linking.openURL('tel:+91 8369096403')
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Ionicons name="help-circle" size={60} color="#fff" />
                <Text style={styles.title}>Help & Support</Text>
                <Text style={styles.subtitle}>We're here to help you</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="mail" size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                </View>
                <Text style={styles.paragraph}>
                    Have questions or need assistance? Our support team is ready to help you with any issues or inquiries.
                </Text>

                <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
                    <Ionicons name="mail-outline" size={20} color="#4CAF50" />
                    <Text style={styles.contactButtonText}>Email: aryanverma1857@gmail.com</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
                    <Ionicons name="call-outline" size={20} color="#4CAF50" />
                    <Text style={styles.contactButtonText}>Phone: +91 8369096403</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="book" size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How do I report an issue?</Text>
                    <Text style={styles.faqAnswer}>
                        Navigate to the Home screen and tap on "Report Issue". Fill in the details about the maintenance issue and submit.
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How can I track my reported issues?</Text>
                    <Text style={styles.faqAnswer}>
                        Go to "My Issues" from the Home screen to view all your reported issues and their current status.
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>What are the different issue statuses?</Text>
                    <Text style={styles.faqAnswer}>
                        • Pending: Issue has been reported and awaiting assignment{'\n'}
                        • In Progress: Technician is working on the issue{'\n'}
                        • Resolved: Issue has been fixed{'\n'}
                        • Closed: Issue resolved and verified
                    </Text>
                </View>

                <View style={styles.faqItem}>
                    <Text style={styles.faqQuestion}>How do I update my profile?</Text>
                    <Text style={styles.faqAnswer}>
                        Go to the Profile tab and tap on "Edit Profile" to update your personal information.
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="time" size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Support Hours</Text>
                </View>
                <Text style={styles.paragraph}>
                    Our support team is available to assist you during the following hours:
                </Text>
                <View style={styles.hoursContainer}>
                    <View style={styles.hoursRow}>
                        <Text style={styles.hoursDay}>Monday - Friday:</Text>
                        <Text style={styles.hoursTime}>9:00 AM - 6:00 PM</Text>
                    </View>
                    <View style={styles.hoursRow}>
                        <Text style={styles.hoursDay}>Saturday:</Text>
                        <Text style={styles.hoursTime}>10:00 AM - 4:00 PM</Text>
                    </View>
                    <View style={styles.hoursRow}>
                        <Text style={styles.hoursDay}>Sunday:</Text>
                        <Text style={styles.hoursTime}>Closed</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="chatbubbles" size={24} color="#4CAF50" />
                    <Text style={styles.sectionTitle}>Feedback</Text>
                </View>
                <Text style={styles.paragraph}>
                    We value your feedback! Help us improve RepairHub by sharing your suggestions and experiences with us.
                </Text>
                <TouchableOpacity style={styles.feedbackButton} onPress={() => navigation.navigate('Feedback')}>
                    <Text style={styles.feedbackButtonText}>Submit Feedback</Text>
                </TouchableOpacity>
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        color: '#666',
        marginBottom: 12,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f0f9f0',
        borderRadius: 8,
        marginTop: 8,
    },
    contactButtonText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
        fontWeight: '500',
    },
    faqItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    hoursContainer: {
        marginTop: 8,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    hoursDay: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    hoursTime: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    feedbackButton: {
        backgroundColor: '#4CAF50',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    feedbackButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
