import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, FONTS } from '../../services/theme';
import api from '../../services/api';

export default function AddElevatorScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [addNewCustomer, setAddNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [form, setForm] = useState({
    elevatorCode: '',
    location: '',
    installationDate: '',
    warrantyExpiry: '',
    nextMaintenance: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      if (data.success) setCustomers(data.data);
    } catch (err) { console.log(err.message); }
  };

  const handleSubmit = async () => {
    // Validate customer selection
    if (!selectedCustomer && !addNewCustomer) {
      Alert.alert('Error', 'Please select an existing customer or add a new one');
      return;
    }
    if (addNewCustomer && !newCustomer.name) {
      Alert.alert('Error', 'Please enter the new customer name');
      return;
    }
    if (!form.elevatorCode || !form.location || !form.installationDate) {
      Alert.alert('Error', 'Please fill in Lift No., Location, and Installation Date');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        elevatorCode: form.elevatorCode,
        location: form.location,
        installationDate: form.installationDate,
        warrantyExpiry: form.warrantyExpiry,
        nextMaintenance: form.nextMaintenance,
      };

      if (addNewCustomer) {
        payload.newCustomer = {
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
        };
      } else {
        payload.customerId = selectedCustomer;
      }

      const { data } = await api.post('/elevators', payload);

      if (data.success) {
        Alert.alert('Success', 'Elevator added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add elevator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Add New Elevator</Text>
          <Text style={styles.subtitle}>Enter the lift details below</Text>

          {/* Customer Selection */}
          <Text style={styles.label}>Assign to Customer *</Text>

          {customers.length > 0 && (
            <View style={styles.customerList}>
              {customers.map((c) => (
                <TouchableOpacity
                  key={c.customerId}
                  style={[styles.chip, selectedCustomer === c.customerId && styles.chipSelected]}
                  onPress={() => { setSelectedCustomer(c.customerId); setAddNewCustomer(false); }}
                >
                  <Text style={[styles.chipText, selectedCustomer === c.customerId && styles.chipTextSelected]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Toggle: Add New Customer */}
          <TouchableOpacity
            style={[styles.addNewBtn, addNewCustomer && styles.addNewBtnActive]}
            onPress={() => { setAddNewCustomer(!addNewCustomer); setSelectedCustomer(''); }}
          >
            <Text style={[styles.addNewBtnText, addNewCustomer && styles.addNewBtnTextActive]}>
              {addNewCustomer ? 'Cancel New Customer' : '+ Add New Customer'}
            </Text>
          </TouchableOpacity>

          {/* New Customer Fields */}
          {addNewCustomer && (
            <View style={styles.newCustomerBox}>
              <Input
                label="Customer Name *"
                placeholder="e.g. Rajesh Kumar"
                value={newCustomer.name}
                onChangeText={(v) => setNewCustomer({ ...newCustomer, name: v })}
              />
              <Input
                label="Phone"
                placeholder="e.g. 9876543210"
                value={newCustomer.phone}
                onChangeText={(v) => setNewCustomer({ ...newCustomer, phone: v })}
                keyboardType="phone-pad"
              />
              <Input
                label="Email"
                placeholder="e.g. customer@email.com"
                value={newCustomer.email}
                onChangeText={(v) => setNewCustomer({ ...newCustomer, email: v })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Elevator Details */}
          <Input
            label="Lift No. / Serial Code *"
            placeholder="e.g. ELV-001"
            value={form.elevatorCode}
            onChangeText={(v) => setForm({ ...form, elevatorCode: v })}
          />
          <Input
            label="Location *"
            placeholder="e.g. Building A, Floor 3"
            value={form.location}
            onChangeText={(v) => setForm({ ...form, location: v })}
          />
          <Input
            label="Installation Date *"
            placeholder="YYYY-MM-DD"
            value={form.installationDate}
            onChangeText={(v) => setForm({ ...form, installationDate: v })}
          />
          <Input
            label="Warranty Expiry"
            placeholder="YYYY-MM-DD (optional)"
            value={form.warrantyExpiry}
            onChangeText={(v) => setForm({ ...form, warrantyExpiry: v })}
          />
          <Input
            label="Next Service Date"
            placeholder="YYYY-MM-DD (optional)"
            value={form.nextMaintenance}
            onChangeText={(v) => setForm({ ...form, nextMaintenance: v })}
          />

          <Button title="Add Elevator" onPress={handleSubmit} loading={loading} style={{ marginTop: 12 }} />
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
  customerList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },
  chipTextSelected: { color: COLORS.white },
  addNewBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignSelf: 'flex-start', marginBottom: 12, marginTop: 4 },
  addNewBtnActive: { backgroundColor: COLORS.primaryLight },
  addNewBtnText: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.primary },
  addNewBtnTextActive: { color: COLORS.darkGreen },
  newCustomerBox: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
});
