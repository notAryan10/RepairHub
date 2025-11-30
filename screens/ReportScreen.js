import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Button, TextInput, Text, useTheme, List, Provider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import API_URL from '../config';

const ISSUE_CATEGORIES = [
  { label: 'Plumbing', value: 'PLUMBING' },
  { label: 'Electrical', value: 'ELECTRICAL' },
  { label: 'Furniture', value: 'FURNITURE' },
  { label: 'WiFi/Internet', value: 'WIFI' },
  { label: 'Other', value: 'OTHER' },
];

const PRIORITIES = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

const ReportScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [priority, setPriority] = useState(PRIORITIES[0]);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  const axiosConfig = useMemo(() => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token}`
    },
    timeout: 30000
  }), [user?.token])

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions')
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5
    })

    if (!result.canceled) {
      setImages([...images, ...result.assets.slice(0, 5 - images.length)])
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  }


  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category')
      return
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title)
      formData.append('description', description)
      formData.append('location', location)
      formData.append('category', category.value)
      formData.append('priority', priority.value)

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const uriParts = image.uri.split('.')
        const fileType = uriParts[uriParts.length - 1]

        formData.append('images', {
          uri: image.uri,
          name: `photo_${i}.${fileType}`,
          type: `image/${fileType}`
        })
      }

      await axios.post(`${API_URL}/reports`, formData, axiosConfig)

      Alert.alert('Success', 'Issue reported successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ])

      setTitle('')
      setDescription('')
      setLocation('')
      setCategory(ISSUE_CATEGORIES[0])
      setPriority(PRIORITIES[0])
      setImages([])
    } catch (error) {
      console.error('Error submitting report:', error)
      Alert.alert('Error', 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, location, category, priority, images, user?.token, navigation])

  const handleCategorySelect = useCallback((cat) => {
    setCategory(cat)
  }, [])

  const handlePrioritySelect = useCallback((prio) => {
    setPriority(prio)
  }, [])

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
                <List.Item key={cat.value} title={cat.label} onPress={() => handleCategorySelect(cat)} style={styles.categoryItem} titleStyle={styles.categoryItemText} />
              ))}
            </List.Accordion>
          </View>

          <View style={styles.input}>
            <Text style={styles.label}>Priority</Text>
            <List.Accordion title={priority?.label || 'Select Priority'} style={styles.categoryButton} titleStyle={styles.categoryButtonText}>
              {PRIORITIES.map((prio) => (
                <List.Item key={prio.value} title={prio.label} onPress={() => handlePrioritySelect(prio)} style={styles.categoryItem} titleStyle={styles.categoryItemText} />
              ))}
            </List.Accordion>
          </View>
          <TextInput label="Description" value={description} onChangeText={setDescription} style={[styles.input, styles.textArea]} mode="outlined" multiline numberOfLines={4} placeholder="Please provide a detailed description of the issue..." />

          <View style={styles.imageSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Attach Images (Optional)</Text>
            <Button mode="outlined" icon="camera" onPress={pickImages} disabled={images.length >= 5} style={styles.imageButton}>
              {images.length === 0 ? 'Add Photos' : `Add More (${images.length}/5)`}
            </Button>

            {images.length > 0 && (
              <ScrollView horizontal style={styles.imagePreview} showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    <IconButton icon="close-circle" size={24} iconColor="#F44336" style={styles.removeButton} onPress={() => removeImage(index)} />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} loading={isSubmitting} disabled={isSubmitting} icon="send" buttonColor="#4CAF50" textColor="#fff">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </View>
      </ScrollView>
    </Provider>
  )
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
  imageSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  imageButton: {
    marginBottom: 12,
  },
  imagePreview: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    margin: 0,
  },
})

export default ReportScreen;
