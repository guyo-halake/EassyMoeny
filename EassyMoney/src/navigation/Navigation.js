import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, spacing, typography } from '../theme/colors';
import GlassmorphicView from '../components/shared/GlassmorphicView';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import SendPaymentScreen from '../screens/SendPaymentScreen';
import DepositScreen from '../screens/DepositScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import DebtorsScreen from '../screens/DebtorsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack (includes SendPaymentScreen as a modal)
const DashboardStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.darkBackground },
            }}
        >
            <Stack.Screen 
                name="DashboardMain" 
                component={DashboardScreen}
            />
            <Stack.Screen 
                name="SendPayment" 
                component={SendPaymentScreen}
                options={{
                    presentation: 'modal',
                    animationEnabled: true,
                }}
            />
            <Stack.Screen 
                name="Deposit" 
                component={DepositScreen}
                options={{
                    presentation: 'modal',
                    animationEnabled: true,
                }}
            />
            <Stack.Screen 
                name="Debtors" 
                component={DebtorsScreen}
                options={{
                    presentation: 'modal',
                    animationEnabled: true,
                }}
            />
        </Stack.Navigator>
    );
};

// Main Tab Navigator
const Navigation = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBarStyle,
                tabBarBackground: () => (
                    <GlassmorphicView 
                        intensity={90}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarActiveTintColor: colors.accentBlue,
                tabBarInactiveTintColor: colors.secondaryText,
                cardStyle: { backgroundColor: colors.darkBackground },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="home" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                    tabBarLabel: 'Transactions',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="swap-horizontal" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="DebtorsTab"
                component={DebtorsScreen}
                options={{
                    tabBarLabel: 'Debtors',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="account-multiple" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons 
                            name="account" 
                            size={size} 
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        borderTopWidth: 0,
        elevation: 0,
        paddingBottom: spacing.md,
        paddingTop: spacing.sm,
    },
    tabBarLabel: {
        fontSize: typography.small || 12,
        marginTop: spacing.xs,
        fontWeight: '500',
    },
    tabBarItem: {
        paddingVertical: spacing.sm,
    },
});

export default Navigation;
