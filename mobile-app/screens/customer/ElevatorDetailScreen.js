import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS } from '../../services/theme';
import api from '../../services/api';

export default function ElevatorDetailScreen({ route }) {
  const { elevatorId } = route.params;
  const [elevator, setElevator] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [elvRes, mntRes] = await Promise.all([
        api.get(`/elevators/${elevatorId}`),
        api.get(`/maintenance/elevator/${elevatorId}`),
      ]);
      if (elvRes.data.success) setElevator(elvRes.data.data);
      if (mntRes.data.success) setMaintenance(mntRes.data.data);
    } catch (error) {
      console.log('ElevatorDetail fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!elevator) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><Text style={styles.emptyText}>Elevator not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.elevatorCode}>{elevator.elevatorCode}</Text>
          <View style={[styles.statusBadge, elevator.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>{elevator.status}</Text>
          </View>

          <View style={styles.divider} />

          <InfoRow label="Location" value={elevator.location} />
          <InfoRow label="Installation Date" value={elevator.installationDate || 'N/A'} />
          <InfoRow label="Warranty Expiry" value={elevator.warrantyExpiry || 'N/A'} />
          <InfoRow label="Last Maintenance" value={elevator.lastMaintenance || 'N/A'} />
          <InfoRow label="Next Maintenance" value={elevator.nextMaintenance || 'Not scheduled'} />
        </Card>

        <Text style={styles.sectionTitle}>Maintenance History</Text>
        {maintenance.length === 0 ? (
          <Card><Text style={styles.emptyText}>No maintenance records yet.</Text></Card>
        ) : (
          maintenance.map((record) => (
            <Card key={record.maintenanceId}>
              <InfoRow label="Service Date" value={record.serviceDate} />
              <InfoRow label="Next Service" value={record.nextServiceDate || 'N/A'} />
              <InfoRow label="Technician" value={record.technicianName || 'N/A'} />
              {record.remarks ? <Text style={styles.remarks}>Remarks: {record.remarks}</Text> : null}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16 },
  elevatorCode: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 12, fontFamily: FONTS.semiBold },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.text },
  infoValue: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, flex: 1, textAlign: 'right', marginLeft: 16 },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.dark, marginTop: 16, marginBottom: 12 },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, textAlign: 'center' },
  remarks: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.text, marginTop: 8, fontStyle: 'italic' },
});
