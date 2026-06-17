import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS } from '../../services/theme';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminDashboardScreen({ navigation }) {
  const [elevators, setElevators] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [elvRes, statsRes] = await Promise.all([
        api.get('/elevators'),
        api.get('/dashboard'),
      ]);
      if (elvRes.data.success) setElevators(elvRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (error) {
      console.log('AdminDashboard fetch error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
        <Text style={styles.greeting}>Admin Panel</Text>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Elevators" value={stats?.totalElevators || 0} color={COLORS.primary} />
          <StatBox label="Customers" value={stats?.totalCustomers || 0} color={COLORS.darkGreen} />
          <StatBox label="Due Soon" value={stats?.upcomingMaintenance || 0} color={COLORS.warning} />
          <StatBox label="Pending" value={stats?.pendingRequests || 0} color={COLORS.error} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionButton icon="🛗" label="Add Elevator" onPress={() => navigation.navigate('AddElevator')} />
          <ActionButton icon="🔧" label="Add Service" onPress={() => navigation.navigate('AddMaintenance')} />
        </View>

        {/* All Elevators */}
        <Text style={styles.sectionTitle}>All Elevators</Text>
        {elevators.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No elevators added yet. Tap "Add Elevator" to start.</Text>
          </Card>
        ) : (
          elevators.map((e) => (
            <Card key={e.elevatorId} style={styles.elevatorCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.elevatorCode}>{e.elevatorCode}</Text>
                  <Text style={styles.customerName}>{e.customerName}</Text>
                </View>
                <View style={[styles.statusBadge, e.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={styles.statusText}>{e.status}</Text>
                </View>
              </View>
              <Text style={styles.location}>{e.location}</Text>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Installed:</Text>
                <Text style={styles.infoValue}>{e.installationDate || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Service:</Text>
                <Text style={styles.infoValue}>{e.lastMaintenance || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Service:</Text>
                <Text style={[styles.infoValue, isDueSoon(e.nextMaintenance) && styles.dueText]}>
                  {e.nextMaintenance || 'Not scheduled'}
                </Text>
              </View>
              {isOverdue(e.nextMaintenance) && (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueText}>OVERDUE - Service required!</Text>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff <= 7 && diff >= 0;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingTop: 20 },
  greeting: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: 10, padding: 12, alignItems: 'center', borderTopWidth: 3, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 } },
  statValue: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.dark },
  statLabel: { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.placeholder, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 12, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.white },
  emptyCard: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, textAlign: 'center' },
  elevatorCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  elevatorCode: { fontSize: 17, fontFamily: FONTS.bold, color: COLORS.dark },
  customerName: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.placeholder, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 12, fontFamily: FONTS.semiBold },
  location: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  infoLabel: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.text },
  infoValue: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.placeholder },
  dueText: { color: COLORS.error, fontFamily: FONTS.semiBold },
  overdueBadge: { backgroundColor: '#FDE8E8', borderRadius: 6, padding: 6, marginTop: 8 },
  overdueText: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.error, textAlign: 'center' },
});
