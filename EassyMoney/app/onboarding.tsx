import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    Pressable,
    SafeAreaView,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingScreen() {
    const navigation = useNavigation<any>();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [username, setUsername] = useState('');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Permission to access photos is required to set an avatar.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.6,
            });

            if (!result.cancelled) {
                setUserAvatar(result.uri);
            }
        } catch (err) {
            console.error('Image pick error', err);
            Alert.alert('Error', 'Could not pick the image.');
        }
    };

    const handleContinue = async () => {
        // Validation
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter your Safaricom phone number');
            return;
        }
        if (!username.trim()) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }
        if (!agreedToTerms) {
            Alert.alert('Error', 'Please agree to the terms and conditions');
            return;
        }

        // Save to AsyncStorage
        setIsLoading(true);
        try {
            await AsyncStorage.setItem('userPhone', phoneNumber);
            await AsyncStorage.setItem('userName', username);
            if (userAvatar) {
                await AsyncStorage.setItem('userAvatar', userAvatar);
            }
            // Navigate to PIN setup
            navigation.navigate('setup-pin', { phoneNumber, username });
        } catch (error) {
            Alert.alert('Error', 'Failed to save user data');
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
                {/* Loading State - Logo Animation */}
                <View style={styles.logoSection}>
                    <LinearGradient
                        colors={[colors.primaryBlue, colors.secondaryGreen]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoGradient}
                    >
                        <MaterialCommunityIcons name="cash" size={48} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.appTitle}>Welcome to EassyMoney Sniper</Text>
                </View>

                {/* Create Account Section */}
                <View style={styles.formSection}>
                    <Text style={styles.subtitle}>Create an Account</Text>

                    {/* Avatar Picker */}
                    <Pressable style={styles.avatarPicker} onPress={pickImage}>
                        {userAvatar ? (
                            <Image source={{ uri: userAvatar }} style={styles.avatarPreview} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryBlue }]}>
                                <MaterialCommunityIcons name="camera" size={28} color="#FFF" />
                            </View>
                        )}
                        <Text style={{ marginTop: spacing.sm, color: colors.secondaryText }}>Add profile photo</Text>
                    </Pressable>

                    {/* Phone Number Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Safaricom Official Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="phone" size={20} color={colors.primaryBlue} />
                            <TextInput
                                style={styles.input}
                                placeholder="+254 7xx xxx xxx"
                                placeholderTextColor={colors.secondaryText}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Username Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="account" size={20} color={colors.primaryBlue} />
                            <TextInput
                                style={styles.input}
                                placeholder="Choose your username"
                                placeholderTextColor={colors.secondaryText}
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>
                    </View>

                    {/* Continue Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.continueButton,
                            pressed && { opacity: 0.8 },
                            isLoading && { opacity: 0.6 },
                        ]}
                        onPress={handleContinue}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[colors.primaryBlue, colors.secondaryGreen]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Setting up...' : 'Continue'}
                            </Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                        </LinearGradient>
                    </Pressable>

                    {/* Terms and Conditions */}
                    <View style={styles.termsContainer}>
                        <Pressable
                            style={styles.checkboxContainer}
                            onPress={() => setAgreedToTerms(!agreedToTerms)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    agreedToTerms && { backgroundColor: colors.primaryBlue },
                                ]}
                            >
                                {agreedToTerms && (
                                    <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                                )}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to terms and conditions of the EassyMoney app. Version 1.1
                            </Text>
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
        paddingTop: spacing.xl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.primaryText,
        textAlign: 'center',
    },
    formSection: {
        marginTop: spacing.lg,
    },
    subtitle: {
        fontSize: typography.h2,
        fontWeight: '700',
        color: colors.primaryText,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    avatarPicker: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarPreview: {
        width: 84,
        height: 84,
        borderRadius: 42,
    },
    avatarPlaceholder: {
        width: 84,
        height: 84,
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: typography.small,
        fontWeight: '600',
        color: colors.primaryText,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.medium,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.primaryBlueLight,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        fontSize: typography.body,
        color: colors.primaryText,
    },
    continueButton: {
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.medium,
        gap: spacing.md,
    },
    buttonText: {
        fontSize: typography.body,
        fontWeight: '700',
        color: '#FFF',
    },
    termsContainer: {
        marginTop: spacing.lg,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    termsText: {
        fontSize: typography.small,
        color: colors.primaryText,
        flex: 1,
        lineHeight: 20,
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
