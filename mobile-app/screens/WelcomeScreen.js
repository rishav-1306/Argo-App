import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import Button from '../components/Button';
import { COLORS, FONTS } from '../services/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>Argo App</Text>
          <Text style={styles.tagline}>Elevator Installation & Maintenance</Text>
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Admin Login"
            onPress={() => navigation.navigate('AdminLogin')}
            style={styles.button}
          />
          <Button
            title="Customer Sign In"
            onPress={() => navigation.navigate('CustomerSignIn')}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Customer Sign Up"
            onPress={() => navigation.navigate('CustomerSignUp')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.dark,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.placeholder,
  },
  buttonSection: {
    width: '100%',
  },
  button: {
    marginBottom: 14,
  },
});
