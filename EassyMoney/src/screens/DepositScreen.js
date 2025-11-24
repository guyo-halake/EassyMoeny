import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    TextInput,
    Animated,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';
import GlassmorphicView from '../components/shared/GlassmorphicView';
import Footer from '../components/Footer';

const DepositScreen = ({ navigation }) => {
    const [step, setStep] = useState(1); // 1: choose action, 2: form, 3: PIN
    const [action, setAction] = useState(null); // 'deposit' or 'withdraw'
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('+254741919042');
    const [pin, setPin] = useState('');
    const [fadeAnim] = useState(new Animated.Value(1));

    const startStep = (chosen) => {
        setAction(chosen);
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setStep(2);
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
    };

    const handleContinueToPin = () => {
        if (!amount) return;
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setStep(3);
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
    };

    const handlePinSubmit = () => {
        if (pin.length < 4) return;
        Alert.alert(
            action === 'deposit' ? 'Deposit successful' : 'Withdrawal successful',
            `KSh ${amount} ${action === 'deposit' ? 'deposited to' : 'withdrawn from'} ${phone}.`,
            [ { text: 'OK', onPress: () => navigation.goBack() } ],
            { cancelable: false }
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Deposits & Withdrawals</Text>
            </View>

            {step === 1 && (
                <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
                    <GlassmorphicView intensity={70} style={styles.welcomeCard}>
                        <Text style={styles.welcomeTitle}>Hey, welcome again.</Text>
                        <Text style={styles.welcomeSubtitle}>Would you like to withdraw or deposit?</Text>
                        <View style={styles.actionRow}>
                            <Pressable style={styles.actionButton} onPress={() => startStep('withdraw')}>
                                <MaterialCommunityIcons name="arrow-down-bold-box" size={22} color={colors.primaryText} />
                                <Text style={styles.actionLabel}>Withdraw</Text>
                            </Pressable>
                            <Pressable style={styles.actionButton} onPress={() => startStep('deposit')}>
                                <MaterialCommunityIcons name="wallet-plus" size={22} color={colors.primaryText} />
                                <Text style={styles.actionLabel}>Deposit</Text>
                            </Pressable>
                        </View>
                    </GlassmorphicView>
                </Animated.View>
            )}

            {step === 2 && (
                <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.stepTitle}>{action === 'deposit' ? 'Deposit funds' : 'Withdraw funds'}</Text>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Amount (KSh)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor={colors.secondaryText}
                            value={amount}
                            onChangeText={(t) => setAmount(t.replace(/\D/g, ''))}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Phone number</Text>
                        <View style={styles.phoneRow}>
                            <TextInput
                                style={styles.phoneInput}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                            <Pressable style={styles.editIcon} onPress={() => { /* visual affordance */ }}>
                                <MaterialCommunityIcons name="pencil" size={20} color={colors.accentBlue} />
                            </Pressable>
                        </View>
                        <Text style={styles.inputHint}>You can edit the number before continuing.</Text>
                    </View>

                    <Pressable style={styles.continueButton} onPress={handleContinueToPin}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </Pressable>
                </Animated.View>
            )}

            {step === 3 && (
                <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.stepTitle}>Enter PIN</Text>
                    <Text style={styles.pinDescription}>Enter your 4-digit PIN to confirm.</Text>

                    <TextInput
                        style={styles.pinInput}
                        value={pin}
                        onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0,4))}
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={4}
                        placeholder="••••"
                        placeholderTextColor={colors.secondaryText}
                    />

                    <Pressable style={styles.continueButton} onPress={handlePinSubmit}>
                        <Text style={styles.continueButtonText}>Confirm</Text>
                    </Pressable>
                </Animated.View>
            )}

            <View style={styles.footerWrapper}>
                <Footer />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    header: {
        padding: spacing.lg,
    },
    headerTitle: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    welcomeCard: {
        padding: spacing.md,
        marginTop: spacing.md,
    },
    welcomeTitle: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
        marginBottom: spacing.sm,
    },
    welcomeSubtitle: {
        color: colors.secondaryText,
        marginBottom: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.md,
    },
    actionButton: {
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        padding: spacing.md,
        borderRadius: borderRadius,
        width: '40%',
        ...shadows.card,
    },
    actionLabel: {
        marginTop: spacing.sm,
        color: colors.primaryText,
        fontWeight: '600',
    },
    stepTitle: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
        marginVertical: spacing.md,
    },
    inputSection: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        color: colors.primaryText,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.inputBackground,
        padding: spacing.md,
        borderRadius: borderRadius,
        color: colors.primaryText,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneInput: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        padding: spacing.md,
        borderRadius: borderRadius,
        color: colors.primaryText,
    },
    editIcon: {
        marginLeft: spacing.sm,
        padding: spacing.sm,
    },
    inputHint: {
        color: colors.secondaryText,
        marginTop: spacing.sm,
    },
    continueButton: {
        backgroundColor: colors.accentBlue,
        padding: spacing.md,
        borderRadius: borderRadius,
        alignItems: 'center',
    },
    continueButtonText: {
        color: colors.primaryText,
        fontWeight: '600',
    },
    pinInput: {
        backgroundColor: colors.inputBackground,
        padding: spacing.md,
        borderRadius: borderRadius,
        color: colors.primaryText,
        textAlign: 'center',
        fontSize: 24,
        marginBottom: spacing.md,
    },
    pinDescription: {
        color: colors.secondaryText,
        marginBottom: spacing.sm,
    },
    footerWrapper: {
        // keeps footer at bottom
    },
});

export default DepositScreen;
