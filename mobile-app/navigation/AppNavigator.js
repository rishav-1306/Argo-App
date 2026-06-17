import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS, FONTS } from '../services/theme';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import CustomerSignInScreen from '../screens/auth/CustomerSignInScreen';
import CustomerSignUpScreen from '../screens/auth/CustomerSignUpScreen';

// Customer Screens
import CustomerDashboardScreen from '../screens/customer/DashboardScreen';
import ElevatorDetailScreen from '../screens/customer/ElevatorDetailScreen';
import ServiceRequestScreen from '../screens/customer/ServiceRequestScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AddElevatorScreen from '../screens/admin/AddElevatorScreen';
import AddMaintenanceScreen from '../screens/admin/AddMaintenanceScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
function TabIcon({ label }) {
  const icons = { Dashboard: '🏠', Elevators: '🛗', Requests: '📋', Profile: '👤', 'Add Lift': '➕', 'Add Service': '🔧' };
  return <Text style={{ fontSize: 20 }}>{icons[label] || '📌'}</Text>;
}

// ==================== CUSTOMER STACK (with elevator detail push) ====================
function CustomerHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerHome" component={CustomerDashboardScreen} />
      <Stack.Screen
        name="ElevatorDetail"
        component={ElevatorDetailScreen}
        options={{
          headerShown: true,
          title: 'Elevator Details',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontFamily: FONTS.semiBold },
        }}
      />
    </Stack.Navigator>
  );
}

// ==================== CUSTOMER TABS ====================
function CustomerTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.border, paddingBottom: 4, height: 56 },
        tabBarLabelStyle: { fontFamily: FONTS.medium, fontSize: 11 },
        headerStyle: { backgroundColor: COLORS.primary, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontFamily: FONTS.semiBold, color: COLORS.white, fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={CustomerHomeStack}
        options={{ title: 'Dashboard', tabBarIcon: () => <TabIcon label="Dashboard" /> }}
      />
      <Tab.Screen
        name="ServiceRequests"
        component={ServiceRequestScreen}
        options={{ title: 'Requests', tabBarIcon: () => <TabIcon label="Requests" /> }}
      />
      <Tab.Screen name="Profile" options={{ tabBarIcon: () => <TabIcon label="Profile" /> }}>
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ==================== ADMIN STACK (dashboard with add screens) ====================
function AdminHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboardScreen} />
      <Stack.Screen
        name="AddElevator"
        component={AddElevatorScreen}
        options={{
          headerShown: true,
          title: 'Add Elevator',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontFamily: FONTS.semiBold },
        }}
      />
      <Stack.Screen
        name="AddMaintenance"
        component={AddMaintenanceScreen}
        options={{
          headerShown: true,
          title: 'Add Service Record',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontFamily: FONTS.semiBold },
        }}
      />
    </Stack.Navigator>
  );
}

// ==================== ADMIN TABS ====================
function AdminTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.border, paddingBottom: 4, height: 56 },
        tabBarLabelStyle: { fontFamily: FONTS.medium, fontSize: 11 },
        headerStyle: { backgroundColor: COLORS.primary, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontFamily: FONTS.semiBold, color: COLORS.white, fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminHomeStack}
        options={{ title: 'Dashboard', tabBarIcon: () => <TabIcon label="Dashboard" /> }}
      />
      <Tab.Screen
        name="AddLift"
        component={AddElevatorScreen}
        options={{ title: 'Add Lift', tabBarIcon: () => <TabIcon label="Add Lift" />,
          headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.white, headerTitleStyle: { fontFamily: FONTS.semiBold } }}
      />
      <Tab.Screen
        name="AddService"
        component={AddMaintenanceScreen}
        options={{ title: 'Add Service', tabBarIcon: () => <TabIcon label="Add Service" />,
          headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.white, headerTitleStyle: { fontFamily: FONTS.semiBold } }}
      />
      <Tab.Screen name="AdminProfile" options={{ title: 'Profile', tabBarIcon: () => <TabIcon label="Profile" /> }}>
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ==================== MAIN APP NAVIGATOR ====================
export default function AppNavigator({ user, onLogin, onLogout }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === 'admin' ? (
            <Stack.Screen name="AdminApp">
              {(props) => <AdminTabs {...props} onLogout={onLogout} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="CustomerApp">
              {(props) => <CustomerTabs {...props} onLogout={onLogout} />}
            </Stack.Screen>
          )
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AdminLogin">
              {(props) => <AdminLoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="CustomerSignIn">
              {(props) => <CustomerSignInScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="CustomerSignUp">
              {(props) => <CustomerSignUpScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
