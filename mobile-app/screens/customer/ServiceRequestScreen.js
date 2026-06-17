import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, FONTS } from '../../services/theme';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function ServiceRequestScreen() {
  const [elevators, setElevators] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedElevator, setSelectedElevator] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [elvRes, reqRes] = await Promise.all([
        api.get('/elevators/my'),
        api.get('/service-requests/my'),
      ]);
      if (elvRes.data.success) setElevators(elvRes.data.data);
      if (reqRes.data.success) setRequests(reqRes.data.data);
    } catch (error) {
      console.log('ServiceRequest fetch error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleSubmit = async () => {
    if (!selectedElevator || !issue.trim()) {
      Alert.alert('Error', 'Please select an elevator and describe the issue');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/service-requests', {
        elevatorId: selectedElevator,
        issue: issue.trim(),
      });
      if (data.success) {
        Alert.alert('Success', 'Service request submitted successfully');
        setIssue('');
        setSelectedElevator('');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return COLORS.warning;
      case 'In Progress': return COLORS.primary;
      case 'Completed': return COLORS.success;
      default: return COLORS.placeholder;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
      >
        <Text style={styles.sectionTitle}>New Service Request</Text>
        <Card>
          <Text style={styles.label}>Select Elevator</Text>
          {elevators.length === 0 ? (
            <Text style={styles.emptyText}>No elevators assigned</Text>
          ) : (
            <View style={styles.elevatorList}>
              {elevators.map((e) => (
                <View
                  key={e.elevatorId}
                  style={[styles.elevatorChip, selectedElevator === e.elevatorId && styles.selectedChip]}
                >
                  <Text
                    style={[styles.chipText, selectedElevator === e.elevatorId && styles.selectedChipText]}
                    onPress={() => setSelectedElevator(e.elevatorId)}
                  >
                    {e.elevatorCode}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Input
            label="Describe the Issue *"
            placeholder="What's the problem?"
            value={issue}
            onChangeText={setIssue}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
          <Button title="Submit Request" onPress={handleSubmit} loading={submitting} />
        </Card>

        <Text style={styles.sectionTitle}>My Requests</Text>
        {requests.length === 0 ? (
          <Card><Text style={styles.emptyText}>No requests submitted yet.</Text></Card>
        ) : (
          requests.map((req) => (
            <Card key={req.requestId}>
              <View style={styles.reqHeader}>
                <Text style={styles.reqId}>{req.requestId}</Text>
                <Text style={[styles.reqStatus, { color: getStatusColor(req.status) }]}>{req.status}</Text>
              </View>
              <Text style={styles.reqIssue}>{req.issue}</Text>
              <Text style={styles.reqDate}>{new Date(req.createdAt).toLocaleDateString()}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 12, marginTop: 8 },
  label: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text, marginBottom: 8 },
  elevatorList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  elevatorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
  selectedChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },
  selectedChipText: { color: COLORS.white },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, textAlign: 'center', paddingVertical: 8 },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reqId: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.text },
  reqStatus: { fontSize: 13, fontFamily: FONTS.semiBold },
  reqIssue: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text, marginBottom: 4 },
  reqDate: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.placeholder },
});
