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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export default function SetupPinScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { phoneNumber, username } = route.params || {};

    const [step, setStep] = useState<'choosePinLength' | 'enterPin' | 'confirmPin'>('choosePinLength');
    const [pinLength, setPinLength] = useState<4 | 6 | 8 | null>(null);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const handlePinLengthSelect = (length: 4 | 6 | 8) => {
        setPinLength(length);
        setStep('enterPin');
    };

    const handlePinInput = (digit: string) => {
        if (step === 'enterPin' && pin.length < (pinLength || 4)) {
            setPin(pin + digit);
        } else if (step === 'confirmPin' && confirmPin.length < (pinLength || 4)) {
            setConfirmPin(confirmPin + digit);
        }
    };

    const handleBackspace = () => {
        if (step === 'enterPin') {
            setPin(pin.slice(0, -1));
        } else if (step === 'confirmPin') {
            setConfirmPin(confirmPin.slice(0, -1));
        }
    };

    const handleNextStep = () => {
        if (step === 'enterPin') {
            if (pin.length !== pinLength) {
                Alert.alert('Error', `Please enter a ${pinLength}-digit PIN`);
                return;
            }
            setStep('confirmPin');
        } else if (step === 'confirmPin') {
            if (confirmPin !== pin) {
                Alert.alert('Error', 'PINs do not match. Please try again.');
                setConfirmPin('');
                return;
            }
            // Save PIN and navigate to login
            savePinAndGoToLogin();
        }
    };

    const savePinAndGoToLogin = async () => {
        try {
            // Simple hash (in production, use proper hashing)
            const hashedPin = await hashPin(pin);
            await AsyncStorage.setItem('userPin', hashedPin);
            await AsyncStorage.setItem('pinLength', pinLength?.toString() || '4');
            await AsyncStorage.setItem('isAuthenticated', 'false');
            navigation.navigate('login');
        } catch (error) {
            Alert.alert('Error', 'Failed to save PIN');
            console.error(error);
        }
    };

    const hashPin = async (pin: string) => {
        // Simple hash - in production use crypto-js or similar
        return btoa(pin); // Base64 encoding as placeholder
    };

    const handleBack = () => {
        if (step === 'confirmPin') {
            setStep('enterPin');
            setConfirmPin('');
        } else if (step === 'enterPin') {
            setStep('choosePinLength');
            setPin('');
            setPinLength(null);
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.darkBackground }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryBlue} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Setup PIN</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Logo */}
                <View style={styles.logoSection}>
                    <LinearGradient
                        colors={[colors.primaryBlue, colors.secondaryGreen]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoGradient}
                    >
                        <MaterialCommunityIcons name="lock" size={40} color="#FFF" />
                    </LinearGradient>
                </View>

                {/* Content */}
                {step === 'choosePinLength' && (
                    <View style={styles.contentSection}>
                        <Text style={styles.title}>Choose PIN Length</Text>
                        <Text style={styles.description}>
                            Your PIN will be used for login and making transactions. Choose a PIN length that works for you.
                        </Text>

                        <View style={styles.pinLengthOptions}>
                            {[4, 6, 8].map((length) => (
                                <Pressable
                                    key={length}
                                    style={({ pressed }) => [
                                        styles.pinLengthButton,
                                        pinLength === length && styles.pinLengthButtonActive,
                                        pressed && { opacity: 0.8 },
                                    ]}
                                    onPress={() => handlePinLengthSelect(length as 4 | 6 | 8)}
                                >
                                    <LinearGradient
                                        colors={
                                            pinLength === length
                                                ? [colors.primaryBlue, colors.secondaryGreen]
                                                : [colors.cardBackground, colors.cardBackground]
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.buttonGradient}
                                    >
                                        <Text
                                            style={[
                                                styles.pinLengthButtonText,
                                                pinLength === length && { color: '#FFF' },
                                            ]}
                                        >
                                            {length} Digit
                                        </Text>
                                    </LinearGradient>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {(step === 'enterPin' || step === 'confirmPin') && (
                    <View style={styles.contentSection}>
                        <Text style={styles.title}>
                            {step === 'enterPin' ? 'Enter Your PIN' : 'Confirm Your PIN'}
                        </Text>
                        <Text style={styles.description}>
                            {step === 'enterPin'
                                ? 'Create a secure PIN for your account'
                                : 'Re-enter your PIN to confirm'}
                        </Text>

                        {/* PIN Display */}
                        <View style={styles.pinDisplay}>
                            {Array.from({ length: pinLength || 4 }).map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.pinDot,
                                        {
                                            backgroundColor:
                                                index <
                                                (step === 'enterPin' ? pin.length : confirmPin.length)
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
                            >
                                <MaterialCommunityIcons
                                    name="backspace"
                                    size={24}
                                    color={colors.primaryBlue}
                                />
                            </Pressable>
                        </View>

                        {/* Next Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.nextButton,
                                ((step === 'enterPin' && pin.length !== pinLength) ||
                                    (step === 'confirmPin' && confirmPin.length !== pinLength)) && {
                                    opacity: 0.5,
                                },
                                pressed && { opacity: 0.8 },
                            ]}
                            onPress={handleNextStep}
                            disabled={
                                (step === 'enterPin' && pin.length !== pinLength) ||
                                (step === 'confirmPin' && confirmPin.length !== pinLength)
                            }
                        >
                            <LinearGradient
                                colors={[colors.primaryBlue, colors.secondaryGreen]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.nextButtonGradient}
                            >
                                <Text style={styles.nextButtonText}>
                                    {step === 'confirmPin' ? 'Complete Setup' : 'Next'}
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}

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
        paddingTop: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: typography.body,
        fontWeight: '700',
        color: colors.primaryText,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentSection: {
        flex: 1,
    },
    title: {
        fontSize: typography.h2,
        fontWeight: '900',
        color: colors.primaryText,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    description: {
        fontSize: typography.small,
        color: colors.secondaryText,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    pinLengthOptions: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'space-around',
        marginTop: spacing.lg,
    },
    pinLengthButton: {
        flex: 1,
    },
    pinLengthButtonActive: {},
    buttonGradient: {
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinLengthButtonText: {
        fontSize: typography.small,
        fontWeight: '700',
        color: colors.primaryText,
    },
    pinDisplay: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.primaryBlue,
    },
    numberPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    padButton: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: borderRadius.large,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    padButtonText: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.primaryText,
    },
    nextButton: {
        marginTop: spacing.lg,
    },
    nextButtonGradient: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: typography.body,
        fontWeight: '700',
        color: '#FFF',
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
