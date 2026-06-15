import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config';

const ElevatorDetails = ({ route, navigation }) => {
  const { elevator } = route.params;
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    if (!issue) return Alert.alert('Error', 'Please describe the issue');
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/service-requests`,
        { elevatorId: elevator.elevatorId, issue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Service request submitted');
      setIssue('');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{elevator.elevatorCode}</Text>
        <Text style={styles.text}>Location: {elevator.location}</Text>
        <Text style={styles.text}>Status: {elevator.status}</Text>
        <Text style={styles.text}>Last Maintenance: {elevator.lastMaintenance}</Text>
        <Text style={styles.text}>Next Maintenance: {elevator.nextMaintenance}</Text>
        <Text style={styles.text}>Warranty Expiry: {elevator.warrantyExpiry}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Book Service / Report Issue</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe the issue..."
          multiline
          numberOfLines={4}
          value={issue}
          onChangeText={setIssue}
        />
        <TouchableOpacity style={styles.button} onPress={submitRequest} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Request</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#90A955' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  text: { fontSize: 16, marginBottom: 5, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, textAlignVertical: 'top', marginBottom: 15 },
  button: { backgroundColor: '#90A955', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default ElevatorDetails;
