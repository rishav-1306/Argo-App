import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { saveToken, saveUser } from '../../services/auth';
import { COLORS, FONTS } from '../../services/theme';

export default function CustomerSignInScreen({ navigation, onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/customer/login', { login, password });
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
        <Text style={styles.title}>Customer Sign In</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>

        <View style={styles.form}>
          <Input
            label="Email or Phone"
            placeholder="Enter email or phone"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Sign In" onPress={handleLogin} loading={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('CustomerSignUp')}>Sign Up</Text>
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text },
  link: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
