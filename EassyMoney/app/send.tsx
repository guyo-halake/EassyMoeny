import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Pressable,
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../src/theme/colors';
import GlassmorphicView from '../src/components/shared/GlassmorphicView';

const screenWidth = Dimensions.get('window').width;

const NumericKeypad = ({ onKeyPress, onDelete }: any) => {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'delete'],
    ];

    return (
        <View style={styles.keypadContainer}>
            {keys.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keypadRow}>
                    {row.map((key, colIndex) => (
                        <Pressable
                            key={`${rowIndex}-${colIndex}`}
                            style={({ pressed }) => [
                                styles.keypadButton,
                                pressed && styles.keypadButtonPressed,
                            ]}
                            onPress={() => {
                                if (key === 'delete') {
                                    onDelete();
                                } else if (key !== '') {
                                    onKeyPress(key);
                                }
                            }}
                        >
                            {key === 'delete' ? (
                                <MaterialCommunityIcons
                                    name="backspace"
                                    size={24}
                                    color={colors.dangerRed}
                                />
                            ) : key !== '' ? (
                                <Text style={styles.keypadText}>{key}</Text>
                            ) : null}
                        </Pressable>
                    ))}
                </View>
            ))}
        </View>
    );
};

const PINDisplay = ({ pin, maxLength = 4 }: any) => {
    return (
        <View style={styles.pinDisplayContainer}>
            {Array.from({ length: maxLength }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.pinDot,
                        index < pin.length && styles.pinDotFilled,
                    ]}
                />
            ))}
        </View>
    );
};

export default function SendPaymentScreen() {
    const navigation = useNavigation<any>();
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [fadeAnim] = useState(new Animated.Value(1));

    const handlePhoneChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 9) {
            setPhoneNumber(cleaned);
        }
    };

    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        setAmount(cleaned);
    };

    const handleContinueToPin = () => {
        if (phoneNumber.length === 9 && amount.length > 0) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setStep(2);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }
    };

    const handlePinKeyPress = (key: string) => {
        if (pin.length < 4) {
            const newPin = pin + key;
            setPin(newPin);

            if (newPin.length === 4) {
                setTimeout(() => {
                    navigation.navigate('(tabs)');
                }, 300);
            }
        }
    };

    const handlePinDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const handleBack = () => {
        if (step === 2) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setStep(1);
                setPin('');
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        } else {
            navigation.goBack();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={28}
                        color={colors.primaryText}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>Send Payment</Text>
                <View style={{ width: 28 }} />
            </View>

            {step === 1 ? (
                <Animated.View
                    style={[
                        styles.stepContainer,
                        { opacity: fadeAnim },
                    ]}
                >
                    <Text style={styles.stepTitle}>Enter Details</Text>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={styles.phoneInputWrapper}>
                            <Text style={styles.countryCode}>+254</Text>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="712345678"
                                placeholderTextColor={colors.secondaryText}
                                value={phoneNumber}
                                onChangeText={handlePhoneChange}
                                keyboardType="numeric"
                                maxLength={9}
                            />
                        </View>
                        <Text style={styles.inputHint}>
                            {phoneNumber.length}/9 digits
                        </Text>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Amount</Text>
                        <View style={styles.amountInputWrapper}>
                            <Text style={styles.currencySymbol}>KSh</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0"
                                placeholderTextColor={colors.secondaryText}
                                value={amount}
                                onChangeText={handleAmountChange}
                                keyboardType="numeric"
                            />
                        </View>
                        <Text style={styles.inputHint}>
                            Available balance: KSh 125,800.50
                        </Text>
                    </View>

                    <GlassmorphicView
                        intensity={70}
                        style={styles.summaryCard}
                    >
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Recipient:</Text>
                            <Text style={styles.summaryValue}>
                                +254{phoneNumber}
                            </Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Amount:</Text>
                            <Text style={styles.summaryValue}>
                                KSh {amount || '0'}
                            </Text>
                        </View>
                    </GlassmorphicView>

                    <Pressable
                        style={({ pressed }) => [
                            styles.continueButton,
                            (phoneNumber.length !== 9 || !amount) &&
                                styles.continueButtonDisabled,
                            pressed && styles.continueButtonPressed,
                        ]}
                        onPress={handleContinueToPin}
                        disabled={phoneNumber.length !== 9 || !amount}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </Pressable>
                </Animated.View>
            ) : (
                <Animated.View
                    style={[
                        styles.stepContainer,
                        { opacity: fadeAnim },
                    ]}
                >
                    <Text style={styles.stepTitle}>Enter PIN</Text>
                    <Text style={styles.pinDescription}>
                        Confirm the transaction with your 4-digit PIN
                    </Text>

                    <GlassmorphicView
                        intensity={70}
                        style={styles.transactionSummary}
                    >
                        <View style={styles.transactionRow}>
                            <Text style={styles.transactionLabel}>To:</Text>
                            <Text style={styles.transactionValue}>
                                +254{phoneNumber}
                            </Text>
                        </View>
                        <View style={styles.transactionDivider} />
                        <View style={styles.transactionRow}>
                            <Text style={styles.transactionLabel}>Amount:</Text>
                            <Text style={styles.transactionValue}>
                                KSh {amount}
                            </Text>
                        </View>
                    </GlassmorphicView>

                    <View style={styles.pinSection}>
                        <PINDisplay pin={pin} maxLength={4} />
                    </View>

                    <NumericKeypad
                        onKeyPress={handlePinKeyPress}
                        onDelete={handlePinDelete}
                    />
                </Animated.View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    stepTitle: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
        marginBottom: spacing.md,
    },

    inputSection: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
        marginBottom: spacing.sm,
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.card,
    },
    countryCode: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
        marginRight: spacing.sm,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: typography.body,
        color: colors.primaryText,
    },
    amountInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.card,
    },
    currencySymbol: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
        marginRight: spacing.sm,
    },
    amountInput: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: typography.body,
        color: colors.primaryText,
    },
    inputHint: {
        fontSize: typography.small,
        color: colors.secondaryText,
        marginLeft: spacing.sm,
    },
    summaryCard: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    summaryLabel: {
        fontSize: typography.body,
        color: colors.secondaryText,
    },
    summaryValue: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: colors.cardBackground,
        marginVertical: spacing.sm,
    },
    continueButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.accentBlue,
        borderRadius: borderRadius,
        alignItems: 'center',
        ...shadows.card,
    },
    continueButtonDisabled: {
        backgroundColor: colors.secondaryText,
        opacity: 0.5,
    },
    continueButtonPressed: {
        opacity: 0.8,
    },
    continueButtonText: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
    },

    pinDescription: {
        fontSize: typography.body,
        color: colors.secondaryText,
        marginBottom: spacing.lg,
    },
    transactionSummary: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    transactionLabel: {
        fontSize: typography.body,
        color: colors.secondaryText,
    },
    transactionValue: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
    },
    transactionDivider: {
        height: 1,
        backgroundColor: colors.cardBackground,
        marginVertical: spacing.sm,
    },
    pinSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    pinDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.secondaryText,
        backgroundColor: 'transparent',
    },
    pinDotFilled: {
        backgroundColor: colors.accentBlue,
        borderColor: colors.accentBlue,
    },

    keypadContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: spacing.lg,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
    },
    keypadButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.card,
    },
    keypadButtonPressed: {
        backgroundColor: colors.accentBlue,
        opacity: 0.8,
    },
    keypadText: {
        fontSize: 28,
        fontWeight: '600',
        color: colors.primaryText,
    },
});
