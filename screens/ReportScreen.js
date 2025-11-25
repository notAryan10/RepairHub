import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Text, useTheme, List, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://10.254.203.23:3000/api';

const ISSUE_CATEGORIES = [
  { label: 'Plumbing', value: 'PLUMBING' },
  { label: 'Electrical', value: 'ELECTRICAL' },
  { label: 'Furniture', value: 'FURNITURE' },
  { label: 'WiFi/Internet', value: 'WIFI' },
  { label: 'Other', value: 'OTHER' },
];

const ReportScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();


  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!user?.token) {
      Alert.alert('Error', 'You need to be logged in to submit a report');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting report:', { title, description, location })
      
      const response = await axios.post(`${API_URL}/reports`,
        { title, description, location, category: category.value },
        {headers: {'Content-Type': 'application/json','Authorization': `Bearer ${user.token}`}}
      )
      
      // console.log(response.data)
      
      Alert.alert('Success','Your report has been submitted successfully!',
        [{text: 'OK', onPress: () => {setTitle('');setDescription('');setLocation('');navigation.goBack()}}]
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <Provider>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.header}>Report an Issue</Text>
          <TextInput label="Issue Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" placeholder="E.g., Leaking Pipe in Bathroom" />
          <TextInput label="Location" value={location} onChangeText={setLocation} style={styles.input} mode="outlined" placeholder="E.g., Room 205" />
          
          <View style={styles.input}>
          <Text style={styles.label}>Category</Text>
          <List.Accordion title={category?.label || 'Select Category'} style={styles.categoryButton} titleStyle={styles.categoryButtonText}>
            {ISSUE_CATEGORIES.map((cat) => (
              <List.Item key={cat.value} title={cat.label} onPress={() => {
                  setCategory(cat);
                }} style={styles.categoryItem} titleStyle={styles.categoryItemText}/>
            ))}
          </List.Accordion>
        </View>
          
          <TextInput label="Description" value={description} onChangeText={setDescription} style={[styles.input, styles.textArea]} mode="outlined" multiline numberOfLines={4} placeholder="Please provide a detailed description of the issue..." />
          
          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} loading={isSubmitting} disabled={isSubmitting} icon="send" buttonColor="#4CAF50" textColor="#fff">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </View>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  categoryButton: {
    borderColor: 'rgba(0, 0, 0, 0.23)',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    color: '#4CAF50',
  },
  categoryButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
  },
  categoryButtonText: {
    color: '#333',
  },
  categoryItem: {
    paddingLeft: 16,
    backgroundColor: '#f8f8f8',
  },
  categoryItemText: {
    color: '#333',
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
})

export default ReportScreen;
