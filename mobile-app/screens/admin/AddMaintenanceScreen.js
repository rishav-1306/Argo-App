import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, FONTS } from '../../services/theme';
import api from '../../services/api';

export default function AddMaintenanceScreen({ navigation }) {
  const [elevators, setElevators] = useState([]);
  const [selectedElevator, setSelectedElevator] = useState('');
  const [form, setForm] = useState({
    serviceDate: '',
    nextServiceDate: '',
    remarks: '',
    technicianName: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchElevators();
  }, []);

  const fetchElevators = async () => {
    try {
      const { data } = await api.get('/elevators');
      if (data.success) setElevators(data.data);
    } catch (err) { console.log(err.message); }
  };

  const handleSubmit = async () => {
    if (!selectedElevator || !form.serviceDate) {
      Alert.alert('Error', 'Please select an elevator and enter the service date');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/maintenance', {
        elevatorId: selectedElevator,
        serviceDate: form.serviceDate,
        nextServiceDate: form.nextServiceDate,
        remarks: form.remarks,
        technicianName: form.technicianName,
      });

      if (data.success) {
        Alert.alert('Success', 'Maintenance record added! Elevator schedule updated.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Add Service Record</Text>
          <Text style={styles.subtitle}>Log maintenance for an elevator</Text>

          <Text style={styles.label}>Select Elevator *</Text>
          {elevators.length === 0 ? (
            <Text style={styles.hint}>No elevators found. Add one first.</Text>
          ) : (
            <View style={styles.elevatorList}>
              {elevators.map((e) => (
                <View
                  key={e.elevatorId}
                  style={[styles.chip, selectedElevator === e.elevatorId && styles.chipSelected]}
                >
                  <Text
                    style={[styles.chipText, selectedElevator === e.elevatorId && styles.chipTextSelected]}
                    onPress={() => setSelectedElevator(e.elevatorId)}
                  >
                    {e.elevatorCode} - {e.customerName}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {selectedElevator && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>
                Last service: {elevators.find((e) => e.elevatorId === selectedElevator)?.lastMaintenance || 'N/A'}
              </Text>
              <Text style={styles.selectedLabel}>
                Next due: {elevators.find((e) => e.elevatorId === selectedElevator)?.nextMaintenance || 'N/A'}
              </Text>
            </View>
          )}

          <Input
            label="Service Date *"
            placeholder="YYYY-MM-DD"
            value={form.serviceDate}
            onChangeText={(v) => setForm({ ...form, serviceDate: v })}
          />
          <Input
            label="Next Service Date"
            placeholder="YYYY-MM-DD (optional)"
            value={form.nextServiceDate}
            onChangeText={(v) => setForm({ ...form, nextServiceDate: v })}
          />
          <Input
            label="Technician Name"
            placeholder="Who performed the service?"
            value={form.technicianName}
            onChangeText={(v) => setForm({ ...form, technicianName: v })}
          />
          <Input
            label="Remarks"
            placeholder="Service notes (optional)"
            value={form.remarks}
            onChangeText={(v) => setForm({ ...form, remarks: v })}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Button title="Save Service Record" onPress={handleSubmit} loading={loading} style={{ marginTop: 12 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 20 },
  label: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 12 },
  elevatorList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },
  chipTextSelected: { color: COLORS.white },
  selectedInfo: { backgroundColor: COLORS.primaryLight, borderRadius: 8, padding: 12, marginBottom: 16 },
  selectedLabel: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.dark, marginBottom: 2 },
});
