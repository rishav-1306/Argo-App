import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config';

const ServiceRequestsScreen = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/service-requests`, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    };
    fetch();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>My Service Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item.requestId}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>Status: {item.status}</Text>
            <Text>Issue: {item.issue}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>Date: {item.createdAt}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
export default ServiceRequestsScreen;
