import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS, FONTS } from '../../services/theme';
import { getUser, logout } from '../../services/auth';
import { registerForPushNotifications } from '../../services/notifications';

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    registerForPushNotifications();
  }, []);

  const loadUser = async () => {
    const u = await getUser();
    setUser(u);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          onLogout && onLogout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'customer'}</Text>
          </View>
        </Card>

        <Button title="Logout" onPress={handleLogout} variant="outline" style={{ marginTop: 24, borderColor: COLORS.error }} textStyle={{ color: COLORS.error }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  content: { padding: 16, paddingTop: 24 },
  profileCard: { alignItems: 'center', padding: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontFamily: FONTS.bold, color: COLORS.white },
  name: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 4 },
  email: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 2 },
  phone: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 8 },
  roleBadge: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.primaryLight },
  roleText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.dark, textTransform: 'capitalize' },
});
