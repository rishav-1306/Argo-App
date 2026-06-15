import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config';
const PrimaryColor = '#90A955';

const CustomerSignUp = ({ navigation }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const pushToken = await AsyncStorage.getItem('pushToken');
      await axios.post(`${API_URL}/auth/signup`, { ...form, pushToken });
      Alert.alert('Success', 'Account created! Please sign in.');
      navigation.navigate('CustomerSignIn');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customer Sign Up</Text>
      <TextInput style={styles.input} placeholder="Full Name" onChangeText={t => setForm({...form, name: t})} />
      <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" onChangeText={t => setForm({...form, phone: t})} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={t => setForm({...form, email: t})} />
      <TextInput style={styles.input} placeholder="Address" onChangeText={t => setForm({...form, address: t})} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={t => setForm({...form, password: t})} />
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FA', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#132A13', marginBottom: 30, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  button: { backgroundColor: PrimaryColor, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

export default CustomerSignUp;
