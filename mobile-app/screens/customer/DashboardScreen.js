import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS } from '../../services/theme';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation }) {
  const [elevators, setElevators] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get('/elevators/my');
      if (data.success) {
        setElevators(data.data);
        setFiltered(data.data);
      }
    } catch (error) {
      console.log('Dashboard fetch error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Search by lift code / serial number
  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(elevators);
      return;
    }
    const q = text.toLowerCase();
    setFiltered(
      elevators.filter(
        (e) =>
          e.elevatorCode.toLowerCase().includes(q) ||
          (e.location && e.location.toLowerCase().includes(q))
      )
    );
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
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
        <Text style={styles.greeting}>My Elevators</Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Lift No. or Location"
            placeholderTextColor={COLORS.placeholder}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <Text style={styles.clearBtn} onPress={() => handleSearch('')}>✕</Text>
          )}
        </View>

        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {search ? 'No elevator found matching "' + search + '"' : 'No elevators assigned yet.'}
            </Text>
            {!search && <Text style={styles.emptySub}>Your admin will assign elevators to your account.</Text>}
          </Card>
        ) : (
          filtered.map((elevator) => (
            <Card key={elevator.elevatorId} style={styles.elevatorCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.elevatorCode}>{elevator.elevatorCode}</Text>
                <View style={[styles.statusBadge, elevator.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={styles.statusText}>{elevator.status}</Text>
                </View>
              </View>
              <Text style={styles.location}>{elevator.location}</Text>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Installation Date:</Text>
                <Text style={styles.infoValue}>{elevator.installationDate || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Service:</Text>
                <Text style={styles.infoValue}>{elevator.lastMaintenance || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Service:</Text>
                <Text style={[styles.infoValue, isDueSoon(elevator.nextMaintenance) && styles.dueText]}>
                  {elevator.nextMaintenance || 'Not scheduled'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Warranty:</Text>
                <Text style={styles.infoValue}>{elevator.warrantyExpiry || 'N/A'}</Text>
              </View>
              <Text
                style={styles.viewDetails}
                onPress={() => navigation.navigate('ElevatorDetail', { elevatorId: elevator.elevatorId })}
              >
                View Full Details →
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper: check if a date is within 7 days
function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff <= 7 && diff >= -30;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingTop: 20 },
  greeting: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, fontFamily: FONTS.regular, color: COLORS.text },
  clearBtn: { fontSize: 16, color: COLORS.placeholder, padding: 4 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.placeholder, textAlign: 'center' },
  emptySub: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.border, marginTop: 8, textAlign: 'center' },
  elevatorCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  elevatorCode: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.dark },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 12, fontFamily: FONTS.semiBold },
  location: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 8 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.text },
  infoValue: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.placeholder },
  dueText: { color: COLORS.error, fontFamily: FONTS.semiBold },
  viewDetails: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary, marginTop: 12, textAlign: 'right' },
});
