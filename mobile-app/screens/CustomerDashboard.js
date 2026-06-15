import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrimaryColor = '#90A955';
const WhiteColor = '#FFFFFF';

const CustomerDashboard = ({ navigation }) => {
  const [elevators, setElevators] = useState([]);

  useEffect(() => {
    fetchElevators();
  }, []);

  const fetchElevators = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/elevators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElevators(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ElevatorDetails', { elevator: item })}>
      <Text style={styles.cardTitle}>{item.elevatorCode}</Text>
      <Text style={styles.cardText}>Status: {item.status}</Text>
      <Text style={styles.cardText}>Location: {item.location}</Text>
      <Text style={styles.cardText}>Next Maintenance: {item.nextMaintenance}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Elevators</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ServiceRequests')}>
          <Text style={{ color: WhiteColor, fontWeight: 'bold' }}>My Requests</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={elevators}
        renderItem={renderItem}
        keyExtractor={item => item.elevatorId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No elevators found.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: PrimaryColor,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: WhiteColor,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: WhiteColor,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});

export default CustomerDashboard;
