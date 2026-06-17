import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import { saveToken, saveUser } from '../../services/auth';
import { COLORS, FONTS } from '../../services/theme';

export default function CustomerSignUpScreen({ navigation, onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/customer/signup', { name, phone, email, password, address });
      if (data.success) {
        await saveToken(data.token);
        await saveUser(data.user);
        onLogin && onLogin(data.user);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <Input label="Full Name *" placeholder="Enter your name" value={name} onChangeText={setName} />
          <Input label="Phone *" placeholder="Enter phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Email *" placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Address" placeholder="Enter address (optional)" value={address} onChangeText={setAddress} />
          <Input label="Password *" placeholder="Min 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
          <Input label="Confirm Password *" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <Button title="Sign Up" onPress={handleSignup} loading={loading} style={{ marginTop: 8 }} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.link} onPress={() => navigation.navigate('CustomerSignIn')}>Sign In</Text>
          </View>

          <Button title="Back" onPress={() => navigation.goBack()} variant="outline" style={{ marginTop: 12, marginBottom: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  inner: { flex: 1 },
  scroll: { paddingHorizontal: 32, paddingTop: 40 },
  title: { fontSize: 26, fontFamily: FONTS.bold, color: COLORS.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.placeholder, marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.text },
  link: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
