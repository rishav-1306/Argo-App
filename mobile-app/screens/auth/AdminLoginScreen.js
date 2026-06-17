import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { saveToken, saveUser } from '../../services/auth';
import { COLORS, FONTS } from '../../services/theme';

export default function AdminLoginScreen({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { username, password });
      if (data.success) {
        await saveToken(data.token);
        await saveUser(data.user);
        onLogin && onLogin(data.user);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Sign in to manage the system</Text>

        <View style={styles.form}>
          <Input
            label="Username"
            placeholder="manish_singh"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Login" onPress={handleLogin} loading={loading} />
        </View>

        <Button title="Back" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 16 }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 26, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 32 },
  form: { marginTop: 8 },
});
