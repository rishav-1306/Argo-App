import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import CustomerDashboard from './screens/CustomerDashboard';
import CustomerSignUp from './screens/CustomerSignUp';
import ElevatorDetails from './screens/ElevatorDetails';
import ServiceRequestsScreen from './screens/ServiceRequestsScreen';
import { registerForPushNotificationsAsync } from './services/notificationService';
import API_URL from './config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

const PrimaryColor = '#90A955';
const DarkColor = '#132A13';
const WhiteColor = '#FFFFFF';

const LoginScreen = ({ navigation, role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('role', res.data.user.role);
      if (role === 'customer') navigation.replace('CustomerDashboard');
      else Alert.alert('Success', 'Admin logged in (Dashboard not implemented in mobile)');
    } catch (err) {
      Alert.alert('Error', 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{role === 'admin' ? 'Admin Login' : 'Customer Sign In'}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
};

const FirstScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.logoText}>Argo App</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminLogin')}><Text style={styles.buttonText}>Admin Login</Text></TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomerSignIn')}><Text style={styles.buttonText}>Customer Sign In</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#ECF39E' }]} onPress={() => navigation.navigate('CustomerSignUp')}><Text style={[styles.buttonText, { color: DarkColor }]}>Customer Sign Up</Text></TouchableOpacity>
    </View>
  </View>
);

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) AsyncStorage.setItem('pushToken', token);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="First" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="AdminLogin">{props => <LoginScreen {...props} role="admin" />}</Stack.Screen>
        <Stack.Screen name="CustomerSignIn">{props => <LoginScreen {...props} role="customer" />}</Stack.Screen>
        <Stack.Screen name="CustomerSignUp" component={CustomerSignUp} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
        <Stack.Screen name="ElevatorDetails" component={ElevatorDetails} />
        <Stack.Screen name="ServiceRequests" component={ServiceRequestsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: PrimaryColor, marginBottom: 50 },
  buttonContainer: { width: '100%', gap: 15 },
  button: { backgroundColor: PrimaryColor, padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: WhiteColor, fontSize: 18, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: DarkColor, marginBottom: 30 },
  input: { width: '100%', backgroundColor: WhiteColor, padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' }
});
