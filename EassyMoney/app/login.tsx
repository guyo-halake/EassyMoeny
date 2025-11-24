import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    Pressable,
    SafeAreaView,
    Alert,
    Dimensions,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [pin, setPin] = useState('');
    const [savedPin, setSavedPin] = useState<string | null>(null);
    const [pinLength, setPinLength] = useState<number>(4);
    const [useBiometrics, setUseBiometrics] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        // Load saved PIN and PIN length from AsyncStorage
        const loadPin = async () => {
            try {
                const saved = await AsyncStorage.getItem('userPin');
                const length = await AsyncStorage.getItem('pinLength');
                setSavedPin(saved);
                setPinLength(length ? parseInt(length) : 4);
                const biom = await AsyncStorage.getItem('useBiometrics');
                if (biom === 'true') setUseBiometrics(true);
                // If biometrics enabled, attempt quick auth
                if (biom === 'true') {
                    try {
                        const hasHardware = await LocalAuthentication.hasHardwareAsync();
                        const enrolled = await LocalAuthentication.isEnrolledAsync();
                        if (hasHardware && enrolled) {
                            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to login' });
                            if (result.success) {
                                await AsyncStorage.setItem('isAuthenticated', 'true');
                                navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });
                            }
                        }
                    } catch (err) {
                        console.warn('Biometric auth failed', err);
                    }
                }
            } catch (error) {
                console.error('Error loading PIN:', error);
            }
        };
        loadPin();
    }, []);

    const handlePinInput = (digit: string) => {
        if (pin.length < pinLength) {
            setPin(pin + digit);
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleLogin = async () => {
        if (!pin.trim()) {
            Alert.alert('Error', 'Please enter your PIN');
            return;
        }

        setIsLoading(true);
        try {
            // Simple hash verification (same as in setup)
            const hashedInput = btoa(pin);

            if (hashedInput === savedPin) {
                // PIN is correct
                await AsyncStorage.setItem('isAuthenticated', 'true');
                navigation.reset({
                    index: 0,
                    routes: [{ name: '(tabs)' }],
                });
            } else {
                Alert.alert('Error', 'Incorrect PIN. Please try again.');
                setPin('');
            }
        } catch (error) {
            Alert.alert('Error', 'Login failed');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.darkBackground }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <LinearGradient
                        colors={[colors.primaryBlue, colors.secondaryGreen]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoGradient}
                    >
                        <MaterialCommunityIcons name="cash" size={56} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.appName}>EassyMoney</Text>
                </View>

                {/* Login Section */}
                <View style={styles.loginSection}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Enter your PIN to access your account</Text>

                    {/* PIN Display */}
                    <View style={styles.pinDisplay}>
                        {Array.from({ length: pinLength }).map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.pinDot,
                                    {
                                        backgroundColor:
                                            index < pin.length
                                                ? colors.primaryBlue
                                                : colors.cardBackground,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Number Pad */}
                    <View style={styles.numberPad}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
                            <Pressable
                                key={digit}
                                style={({ pressed }) => [
                                    styles.padButton,
                                    pressed && { opacity: 0.7 },
                                ]}
                                onPress={() => handlePinInput(digit)}
                                disabled={isLoading}
                            >
                                <Text style={styles.padButtonText}>{digit}</Text>
                            </Pressable>
                        ))}

                        {/* Backspace */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.padButton,
                                pressed && { opacity: 0.7 },
                            ]}
                            onPress={handleBackspace}
                            disabled={isLoading}
                        >
                            <MaterialCommunityIcons
                                name="backspace"
                                size={24}
                                color={colors.primaryBlue}
                            />
                        </Pressable>
                    </View>

                    {/* Login Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.loginButton,
                            (pin.length === 0 || isLoading) && { opacity: 0.5 },
                            pressed && { opacity: 0.8 },
                        ]}
                        onPress={handleLogin}
                        disabled={pin.length === 0 || isLoading}
                    >
                        <LinearGradient
                            colors={[colors.primaryBlue, colors.secondaryGreen]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.loginButtonGradient}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Links */}
                    <View style={styles.linksContainer}>
                        <Pressable onPress={() => {
                            Alert.alert('Forgot PIN?', 'Please contact support to reset your PIN');
                        }}>
                            <Text style={styles.linkText}>Forgot PIN?</Text>
                        </Pressable>
                        <View style={styles.divider} />
                        <Pressable onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'onboarding' }],
                            });
                        }}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Spacer */}
                <View style={{ height: spacing.xl }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>By Razak ATL {'</>'}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    appName: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.primaryText,
    },
    loginSection: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.primaryText,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        color: colors.secondaryText,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    pinDisplay: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    pinDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.primaryBlue,
    },
    numberPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    padButton: {
        width: screenWidth * 0.22,
        aspectRatio: 1,
        borderRadius: borderRadius.large,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    padButtonText: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.primaryText,
    },
    loginButton: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    loginButtonGradient: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: typography.body,
        fontWeight: '700',
        color: '#FFF',
    },
    linksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.md,
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: colors.secondaryText,
    },
    linkText: {
        fontSize: 12,
        color: colors.primaryBlue,
        fontWeight: '600',
    },
    footer: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.primaryBlueLight,
    },
    footerText: {
        fontSize: typography.caption,
        color: colors.secondaryText,
        fontWeight: '600',
    },
});
