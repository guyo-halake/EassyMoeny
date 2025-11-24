import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    Pressable,
    Image,
    Dimensions,
    Animated,
    SafeAreaView,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../src/theme/colors';
import GlassmorphicView from '../../src/components/shared/GlassmorphicView';

const screenWidth = Dimensions.get('window').width;

// Mock Data
const MOCK_TRANSACTIONS = [
    { id: '1', name: 'John Kariuki', amount: 5000, type: 'sent', time: '2 mins ago', avatar: '👨‍💼' },
    { id: '2', name: 'Sarah Mwangi', amount: 12500, type: 'received', time: '1 hour ago', avatar: '👩‍💼' },
    { id: '3', name: 'Mike Johnson', amount: 8200, type: 'sent', time: '3 hours ago', avatar: '👨‍🎓' },
    { id: '4', name: 'Lisa Park', amount: 15000, type: 'received', time: '1 day ago', avatar: '👩‍🎨' },
    { id: '5', name: 'David Smith', amount: 3500, type: 'sent', time: '2 days ago', avatar: '👨‍🏫' },
];

const TOP_PAYERS = [
    { id: '1', name: 'Sarah M.', total: 45000, avatar: '👩‍💼', percent: 32 },
    { id: '2', name: 'Mike J.', total: 38000, avatar: '👨‍💼', percent: 27 },
    { id: '3', name: 'Lisa P.', total: 32000, avatar: '👩‍🎨', percent: 23 },
    { id: '4', name: 'John K.', total: 25000, avatar: '👨‍🎓', percent: 18 },
];

const PENDING_NOTIFICATIONS = [
    { id: '1', type: 'pending', text: 'John owes you KSh 5,000', icon: 'alert-circle' },
    { id: '2', type: 'reminder', text: 'Payment due to Sarah in 2 days', icon: 'clock-alert' },
    { id: '3', type: 'pending', text: 'Mike pending: KSh 8,200', icon: 'alert-circle' },
];

const WALLET_DATA: any = {
    pochi: {
        name: 'Pochi la Biashara',
        balance: 85400,
        gradient: [colors.accentYellow, '#FFC107'],
        icon: 'wallet',
        simType: 'Safaricom',
        currency: 'KSH',
    },
    mpesa: {
        name: 'M-Pesa',
        balance: 32150,
        gradient: [colors.mpesaGreen, colors.mpesaGradientEnd],
        icon: 'wallet',
        simType: 'Safaricom',
        currency: 'KSH',
    },
};

const SkeletonLoader = ({ width = '100%', height = 20 }: any) => (
    <Animated.View
        style={[
            styles.skeleton,
            { width, height },
        ]}
    />
);

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [userName, setUserName] = useState('John');
    const [userPhone, setUserPhone] = useState('');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [useBiometrics, setUseBiometrics] = useState(false);
    const [activeWallet, setActiveWallet] = useState<'pochi' | 'mpesa'>('pochi');
    const [balanceHidden, setBalanceHidden] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminTaps, setAdminTaps] = useState(0);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showTransactions, setShowTransactions] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [notificationCount, setNotificationCount] = useState(PENDING_NOTIFICATIONS.length);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showUpdatesModal, setShowUpdatesModal] = useState(false);
    const [showThemesModal, setShowThemesModal] = useState(false);
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editPin, setEditPin] = useState('');

    const balanceAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = 1; // remove heartbeat animation, keep scale static
    const adminLongPressTimer = useRef<any>(null);

    useEffect(() => {
        loadUserData();
        startAnimations();
        setTimeout(() => setIsLoading(false), 1500);
    }, []);

    const loadUserData = async () => {
        try {
            const saved = await AsyncStorage.getItem('userName');
            if (saved) setUserName(saved);
            const phone = await AsyncStorage.getItem('userPhone');
            if (phone) setUserPhone(phone);
            const avatar = await AsyncStorage.getItem('userAvatar');
            if (avatar) setUserAvatar(avatar);
            const biom = await AsyncStorage.getItem('useBiometrics');
            if (biom === 'true') setUseBiometrics(true);
            const theme = await AsyncStorage.getItem('theme');
            if (theme === 'dark') setIsDarkMode(true);
            if (theme === 'light') setIsDarkMode(false);
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Permission to access photos is required to set an avatar.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: [ImagePicker.MediaType.IMAGE],
                allowsEditing: true,
                quality: 0.6,
            });

            if (!result.cancelled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                if (uri) {
                    await AsyncStorage.setItem('userAvatar', uri);
                    setUserAvatar(uri);
                }
            }
        } catch (err) {
            console.error('Image pick error', err);
            Alert.alert('Error', 'Could not pick the image.');
        }
    };

    const saveProfileEdits = async () => {
        try {
            if (editUsername) {
                await AsyncStorage.setItem('userName', editUsername);
                setUserName(editUsername);
            }
            if (editPhone) {
                await AsyncStorage.setItem('userPhone', editPhone);
                setUserPhone(editPhone);
            }
            if (editPin) {
                await AsyncStorage.setItem('userPin', btoa(editPin));
            }
            // biometric opt-in persisted
            if (useBiometrics) {
                await AsyncStorage.setItem('useBiometrics', 'true');
            } else {
                await AsyncStorage.setItem('useBiometrics', 'false');
            }
            setIsEditingProfile(false);
            Alert.alert('Saved', 'Profile updated successfully');
        } catch (err) {
            console.error('Save profile error', err);
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    const toggleTheme = async () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        await AsyncStorage.setItem('theme', newDark ? 'dark' : 'light');
    };

    const setThemePref = async (pref: 'light' | 'dark' | 'system') => {
        await AsyncStorage.setItem('theme', pref);
        if (pref === 'dark') setIsDarkMode(true);
        else if (pref === 'light') setIsDarkMode(false);
        else {
            // system -> leave as-is (could re-evaluate device scheme)
        }
        setShowThemesModal(false);
    };

    const startAnimations = () => {
        Animated.timing(balanceAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    };

    // PanResponder to allow swiping the balance card left/right to change wallets
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
            onPanResponderRelease: (_, gesture) => {
                const { dx } = gesture;
                if (dx < -40) {
                    // swipe left -> next wallet
                    setActiveWallet((prev) => (prev === 'pochi' ? 'mpesa' : 'pochi'));
                } else if (dx > 40) {
                    // swipe right -> previous wallet
                    setActiveWallet((prev) => (prev === 'mpesa' ? 'pochi' : 'mpesa'));
                }
            },
        })
    ).current;

    const toggleTransactions = () => {
        setShowTransactions(!showTransactions);
    };

    const toggleAnalytics = () => {
        setShowAnalytics(!showAnalytics);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleFooterPress = () => {
        setAdminTaps(adminTaps + 1);
        if (adminTaps + 1 >= 3) {
            setShowAdminModal(true);
            setAdminTaps(0);
        }
    };

    const handleFooterLongPress = () => {
        adminLongPressTimer.current = setTimeout(() => {
            setShowAdminModal(true);
        }, 500);
    };

    const handleFooterPressOut = () => {
        if (adminLongPressTimer.current) {
            clearTimeout(adminLongPressTimer.current);
        }
    };

    const handleAdminLogin = () => {
        if (adminEmail && adminPassword) {
            Alert.alert('Admin Login', `Logged in as ${adminEmail}`);
            setShowAdminModal(false);
            setAdminEmail('');
            setAdminPassword('');
        } else {
            Alert.alert('Error', 'Please enter email and password');
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getUSDConversion = (ksh: number) => {
        const rate = 0.0077;
        return (ksh * rate).toFixed(2);
    };

    const themeBg = isDarkMode ? colors.darkModeBg : colors.darkBackground;
    const themeText = isDarkMode ? colors.lightPrimaryText : colors.primaryText;
    const themeSecondary = isDarkMode ? colors.lightSecondaryText : colors.secondaryText;
    const themeCard = isDarkMode ? colors.darkModeCard : colors.cardBackground;

    const wallet = WALLET_DATA[activeWallet];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeBg }]}>
            {/* Header */}
            {/* Simplified Header */}
            <View style={styles.header}>
                <Text style={[styles.logoText, { color: colors.primaryBlue }]}>EasyMoney</Text>
                <View style={styles.headerRight}>
                    <Pressable
                        style={styles.themeToggle}
                        onPress={() => setIsDarkMode(!isDarkMode)}
                    >
                        <MaterialCommunityIcons
                            name={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
                            size={22}
                            color={colors.primaryBlue}
                        />
                    </Pressable>
                    <Pressable 
                        onPress={() => setSidebarVisible(true)}
                        style={styles.headerProfileIcon}
                    >
                        {userAvatar ? (
                            <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
                        ) : (
                            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: colors.primaryBlue }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{(userName || 'U')[0]}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>

            {/* Sidebar Menu */}
            <Modal visible={sidebarVisible} animationType="slide" transparent>
                <Pressable style={styles.sidebarOverlay} onPress={() => setSidebarVisible(false)} />
                <View style={[styles.sidebar, { backgroundColor: themeCard }]}>
                    <View style={styles.sidebarHeader}>
                        <Text style={[styles.sidebarTitle, { color: themeText }]}>Menu</Text>
                        <Pressable onPress={() => setSidebarVisible(false)}>
                            <MaterialCommunityIcons name="close" size={24} color={themeText} />
                        </Pressable>
                    </View>
                    
                    <Pressable 
                        style={styles.sidebarItem} 
                        onPress={() => { 
                            setShowProfileModal(true); 
                            setSidebarVisible(false); 
                        }}
                    >
                        <MaterialCommunityIcons name="account" size={20} color={colors.primaryBlue} />
                        <Text style={[styles.sidebarItemText, { color: themeText }]}>Profile</Text>
                    </Pressable>
                    
                    <Pressable 
                        style={styles.sidebarItem} 
                        onPress={() => { 
                            Alert.alert('Settings', 'Settings coming soon');
                            setSidebarVisible(false); 
                        }}
                    >
                        <MaterialCommunityIcons name="cog" size={20} color={colors.primaryBlue} />
                        <Text style={[styles.sidebarItemText, { color: themeText }]}>Settings</Text>
                    </Pressable>
                    
                    <Pressable 
                        style={styles.sidebarItem}
                        onPress={() => { 
                            setShowAboutModal(true);
                            setSidebarVisible(false); 
                        }}
                    >
                        <MaterialCommunityIcons name="information" size={20} color={colors.primaryBlue} />
                        <Text style={[styles.sidebarItemText, { color: themeText }]}>About EasyMoney</Text>
                    </Pressable>
                    
                    <Pressable 
                        style={styles.sidebarItem}
                        onPress={() => { 
                            setShowUpdatesModal(true);
                            setSidebarVisible(false); 
                        }}
                    >
                        <MaterialCommunityIcons name="update" size={20} color={colors.primaryBlue} />
                        <Text style={[styles.sidebarItemText, { color: themeText }]}>Updates & Maintenance</Text>
                    </Pressable>
                    
                    <View style={{ flex: 1 }} />
                    
                    <Pressable
                        style={[styles.sidebarLogout, { borderTopColor: colors.softGray }]}
                        onPress={async () => {
                            Alert.alert('Logout', 'Are you sure you want to logout?', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Logout',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await AsyncStorage.setItem('isAuthenticated', 'false');
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'login' }],
                                        });
                                    },
                                },
                            ]);
                        }}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color={colors.errorRed} />
                        <Text style={[styles.sidebarItemText, { color: colors.errorRed }]}>Logout</Text>
                    </Pressable>
                </View>
            </Modal>

            {/* Profile Modal */}
            <Modal visible={showProfileModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.profileModal, { backgroundColor: themeCard }]}>
                        <View style={styles.profileHeader}>
                            <Text style={[styles.profileTitle, { color: themeText }]}>Profile</Text>
                            <Pressable onPress={() => setShowProfileModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={themeText} />
                            </Pressable>
                        </View>
                        <View style={styles.profileContent}>
                            <Pressable onPress={pickImage} style={styles.profileAvatarWrap}>
                                {userAvatar ? (
                                    <Image source={{ uri: userAvatar }} style={styles.profileAvatar} />
                                ) : (
                                    <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.primaryBlue }]}>
                                        <Text style={{ color: '#fff', fontSize: 24 }}>{(userName || 'U')[0]}</Text>
                                    </View>
                                )}
                                <View style={styles.editAvatarBadge}>
                                    <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                                </View>
                            </Pressable>

                            {!isEditingProfile ? (
                                <View style={styles.profileInfo}>
                                    <View style={styles.profileRow}>
                                        <Text style={[styles.profileLabel, { color: themeText }]}>Username</Text>
                                        <View style={styles.profileValueRow}>
                                            <Text style={[styles.profileValue, { color: themeText }]}>{userName}</Text>
                                            <Pressable onPress={() => { setIsEditingProfile(true); setEditUsername(userName); setEditPhone(userPhone); }}>
                                                <MaterialCommunityIcons name="pencil" size={18} color={colors.primaryBlue} />
                                            </Pressable>
                                        </View>
                                    </View>

                                    <View style={styles.profileRow}>
                                        <Text style={[styles.profileLabel, { color: themeText }]}>Phone</Text>
                                        <Text style={[styles.profileValue, { color: themeText }]}>{userPhone}</Text>
                                    </View>

                                    <View style={styles.profileRow}>
                                        <Text style={[styles.profileLabel, { color: themeText }]}>SIM</Text>
                                        <Text style={[styles.profileValue, { color: themeText }]}>Safaricom</Text>
                                    </View>
                                    <View style={styles.profileRow}>
                                        <Text style={[styles.profileLabel, { color: themeText }]}>Biometric Login</Text>
                                        <View style={styles.profileValueRow}>
                                            <Pressable onPress={async () => {
                                                const newVal = !useBiometrics;
                                                setUseBiometrics(newVal);
                                                await AsyncStorage.setItem('useBiometrics', newVal ? 'true' : 'false');
                                            }}>
                                                <View style={{
                                                    width: 36, height: 24, borderRadius: 12, backgroundColor: useBiometrics ? colors.primaryBlue : colors.cardBackground, justifyContent: 'center', paddingHorizontal: 6
                                                }}>
                                                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', alignSelf: useBiometrics ? 'flex-end' : 'flex-start' }} />
                                                </View>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <TextInput style={[styles.input, { marginBottom: spacing.md }]} value={editUsername} onChangeText={setEditUsername} placeholder="Username" placeholderTextColor={colors.secondaryText} />
                                    <TextInput style={[styles.input, { marginBottom: spacing.md }]} value={editPhone} onChangeText={setEditPhone} placeholder="Phone" placeholderTextColor={colors.secondaryText} keyboardType="phone-pad" />
                                    <TextInput style={[styles.input, { marginBottom: spacing.md }]} value={editPin} onChangeText={setEditPin} placeholder="New PIN (optional)" placeholderTextColor={colors.secondaryText} secureTextEntry />
                                    <Pressable style={styles.saveProfileButton} onPress={saveProfileEdits}>
                                        <LinearGradient colors={[colors.primaryBlue, colors.secondaryGreen]} style={styles.saveProfileGradient}>
                                            <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                                        </LinearGradient>
                                    </Pressable>
                                    <Pressable style={{ marginTop: spacing.md }} onPress={() => setIsEditingProfile(false)}>
                                        <Text style={{ color: colors.secondaryText }}>Cancel</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* About Modal */}
            <Modal visible={showAboutModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.smallModal, { backgroundColor: themeCard }]}>
                        <Text style={{ fontWeight: '800', fontSize: 18, color: themeText }}>About EasyMoney</Text>
                        <Text style={{ marginTop: spacing.md, color: themeText }}>Coming soon — more info will be here.</Text>
                        <Pressable style={{ marginTop: spacing.lg }} onPress={() => setShowAboutModal(false)}>
                            <Text style={{ color: colors.primaryBlue }}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Updates Modal */}
            <Modal visible={showUpdatesModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.smallModal, { backgroundColor: themeCard }]}>
                        <Text style={{ fontWeight: '800', fontSize: 18, color: themeText }}>Updates & Maintenance</Text>
                        <Text style={{ marginTop: spacing.md, color: themeText }}>No updates available.</Text>
                        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
                            <Pressable style={styles.updateButton} onPress={() => Alert.alert('Update', 'Checking for updates...')}>
                                <Text style={{ color: '#fff' }}>Check Now</Text>
                            </Pressable>
                            <Pressable style={[styles.updateButton, { backgroundColor: colors.accentYellow }]} onPress={() => Alert.alert('Update', 'Update over WiFi enabled')}>
                                <Text style={{ color: '#000' }}>Over WiFi</Text>
                            </Pressable>
                        </View>
                        <Pressable style={{ marginTop: spacing.lg }} onPress={() => setShowUpdatesModal(false)}>
                            <Text style={{ color: colors.primaryBlue }}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Themes Modal */}
            <Modal visible={showThemesModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.smallModal, { backgroundColor: themeCard }]}>
                        <Text style={{ fontWeight: '800', fontSize: 18, color: themeText }}>Themes</Text>
                        <Text style={{ marginTop: spacing.md, color: themeText }}>Choose your theme preference</Text>
                        <View style={{ marginTop: spacing.lg }}>
                            <Pressable style={{ paddingVertical: spacing.sm }} onPress={() => setThemePref('light')}>
                                <Text style={{ color: colors.primaryBlue }}>Light</Text>
                            </Pressable>
                            <Pressable style={{ paddingVertical: spacing.sm }} onPress={() => setThemePref('dark')}>
                                <Text style={{ color: colors.primaryBlue }}>Dark</Text>
                            </Pressable>
                            <Pressable style={{ paddingVertical: spacing.sm }} onPress={() => setThemePref('system')}>
                                <Text style={{ color: colors.primaryBlue }}>System</Text>
                            </Pressable>
                        </View>
                        <Pressable style={{ marginTop: spacing.lg }} onPress={() => setShowThemesModal(false)}>
                            <Text style={{ color: colors.primaryBlue }}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Developer Modal */}
            <Modal visible={showDeveloperModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.smallModal, { backgroundColor: themeCard }]}>
                        <Text style={{ fontWeight: '800', fontSize: 18, color: themeText }}>Developer Option</Text>
                        <Text style={{ marginTop: spacing.md, color: themeText }}>Debug logs and maintenance tools will appear here.</Text>
                        <Pressable style={{ marginTop: spacing.lg }} onPress={() => setShowDeveloperModal(false)}>
                            <Text style={{ color: colors.primaryBlue }}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    {isLoading ? (
                        <>
                            <SkeletonLoader width="60%" height={24} />
                            <SkeletonLoader width="80%" height={16} />
                        </>
                    ) : (
                        <View style={styles.welcomeRow}>
                            {userAvatar ? (
                                <Image source={{ uri: userAvatar }} style={styles.welcomeAvatar} />
                            ) : (
                                <View style={[styles.welcomeAvatarPlaceholder, { backgroundColor: colors.primaryBlue }]}>
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>{(userName || 'U')[0]}</Text>
                                </View>
                            )}
                            <Text style={[styles.greeting, { color: themeText }]}>Hey {userName}!</Text>
                        </View>
                    )}
                </View>
                {/* Wallet is switchable by swiping the balance card left/right (no buttons) */}

                {/* Dynamic Balance Card */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.animatedBalanceContainer,
                        {
                            transform: [
                                {
                                    translateY: balanceAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                            opacity: balanceAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                            }),
                        },
                    ]}
                >
                    {isLoading ? (
                        <View style={[styles.balanceCardGradient, { backgroundColor: themeCard }]}>
                            <SkeletonLoader width="40%" height={24} />
                            <SkeletonLoader width="60%" height={34} />
                        </View>
                    ) : (
                        <LinearGradient
                            colors={['rgba(80, 40, 120, 0.15)', 'rgba(40, 20, 80, 0.1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.balanceCardGradient}
                        >
                            <View style={styles.balanceCardContent}>
                                {/* Header: Title & Eye Icon */}
                                <View style={styles.balanceCardHeader}>
                                    <View>
                                        <Text style={styles.walletNameLabel}>{wallet.name}</Text>
                                        <View style={styles.simTypeBadge}>
                                            <MaterialCommunityIcons
                                                name="sim"
                                                size={12}
                                                color="#FFF"
                                            />
                                            <Text style={styles.simTypeLabel}> {wallet.simType}</Text>
                                        </View>
                                    </View>
                                    <Pressable onPress={() => setBalanceHidden(!balanceHidden)}>
                                        <MaterialCommunityIcons
                                            name={balanceHidden ? 'eye-off' : 'eye'}
                                            size={24}
                                            color="#FFF"
                                        />
                                    </Pressable>
                                </View>

                                {/* Balance Amount (modern glass card style) */}
                                <View style={styles.balanceDisplay}>
                                    <Text style={styles.balanceLabel}>Available Balance</Text>

                                    <View style={styles.balanceRow}>
                                        <Text style={styles.balanceAmount}>
                                            {balanceHidden ? '••••••' : (wallet.balance / 100).toFixed(2)}
                                        </Text>
                                        <View style={styles.currencyBlock}>
                                            <Text style={styles.currencyCode}>KSh</Text>
                                            <Text style={styles.flagEmoji}>🇰🇪</Text>
                                        </View>
                                    </View>

                                    {!balanceHidden && (
                                        <View style={styles.usdRow}>
                                            <Text style={styles.usdConversion}>
                                                ≈ ${getUSDConversion(wallet.balance)} USD
                                            </Text>
                                            <Text style={styles.flagEmoji}>🇺🇸</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </Animated.View>

                {/* Quick actions removed per request (use swipe on card to change wallets) */}

                {/* Quick Action Buttons */}
                <View style={styles.quickActionsContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.quickActionButton,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => navigation.navigate('send')}
                    >
                        <LinearGradient
                            colors={[colors.primaryBlue, colors.primaryBlueLight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.actionIconGradient}
                        >
                            <MaterialCommunityIcons name="send" size={24} color="#FFF" />
                        </LinearGradient>
                        <Text style={[styles.actionLabel, { color: themeText }]}>Send</Text>
                    </Pressable>

                    <Pressable style={[styles.quickActionButton, { opacity: 0.6 }]}>
                        <LinearGradient
                            colors={[colors.secondaryGreen, colors.greenLight]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.actionIconGradient}
                        >
                            <MaterialCommunityIcons name="wallet-plus" size={24} color="#FFF" />
                        </LinearGradient>
                        <Text style={[styles.actionLabel, { color: themeText }]}>Deposit</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.quickActionButton, { opacity: 0.6 }]}
                        onPress={() => navigation.navigate('debtors')}
                    >
                        <LinearGradient
                            colors={[colors.accentYellow, colors.secondaryGreen]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.actionIconGradient}
                        >
                            <MaterialCommunityIcons name="account-multiple" size={24} color="#FFF" />
                        </LinearGradient>
                        <Text style={[styles.actionLabel, { color: themeText }]}>Debtors</Text>
                    </Pressable>
                </View>

                {/* Collapsible Top Payers Analytics */}
                <View style={styles.collapsibleSection}>
                    <Pressable
                        style={[styles.collapsibleHeader]}
                        onPress={toggleAnalytics}
                    >
                        <Text style={[styles.collapsibleTitle, { color: themeText }]}>
                            Top Payers
                        </Text>
                        <MaterialCommunityIcons
                            name={showAnalytics ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={themeText}
                        />
                    </Pressable>

                    {showAnalytics && (
                        <View style={[styles.analyticsCard]}>
                            <LineChart
                                data={{
                                    labels: ['Sarah', 'Mike', 'Lisa', 'John'],
                                    datasets: [
                                        {
                                            data: [45, 38, 32, 25],
                                            color: () => colors.primaryBlue,
                                            strokeWidth: 3,
                                        },
                                    ],
                                }}
                                width={screenWidth - spacing.lg * 2}
                                height={200}
                                yAxisLabel="KSh"
                                yAxisSuffix="k"
                                chartConfig={{
                                    backgroundColor: 'transparent',
                                    backgroundGradientFrom: 'transparent',
                                    backgroundGradientTo: 'transparent',
                                    color: () => themeSecondary,
                                    strokeWidth: 3,
                                    barPercentage: 0.5,
                                    useShadowColorFromDataset: false,
                                }}
                                style={styles.chart}
                            />
                            {/* Payer Bars */}
                            {TOP_PAYERS.map(payer => (
                                <View key={payer.id} style={styles.payerRow}>
                                    <Text style={styles.payerAvatar}>{payer.avatar}</Text>
                                    <View style={styles.payerDetails}>
                                        <Text style={[styles.payerName, { color: themeText }]}>
                                            {payer.name}
                                        </Text>
                                        <View style={styles.percentBar}>
                                            <View
                                                style={[
                                                    styles.percentFill,
                                                    {
                                                        width: `${payer.percent}%`,
                                                        backgroundColor: colors.primaryBlue,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                    <Text style={[styles.payerAmount, { color: themeSecondary }]}>
                                        KSh {payer.total.toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Collapsible Recent Transactions */}
                <View style={styles.collapsibleSection}>
                    <Pressable
                        style={[styles.collapsibleHeader]}
                        onPress={toggleTransactions}
                    >
                        <Text style={[styles.collapsibleTitle, { color: themeText }]}>
                            Recent Transactions
                        </Text>
                        <MaterialCommunityIcons
                            name={showTransactions ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={themeText}
                        />
                    </Pressable>

                    {showTransactions && (
                        <View style={styles.transactionsContainer}>
                            {MOCK_TRANSACTIONS.map(tx => (
                                <View
                                    key={tx.id}
                                    style={[styles.transactionItem, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]}
                                >
                                    <Text style={styles.txAvatar}>{tx.avatar}</Text>
                                    <View style={styles.txDetails}>
                                        <Text style={[styles.txName, { color: themeText }]}>
                                            {tx.name}
                                        </Text>
                                        <Text style={[styles.txTime, { color: themeSecondary }]}>
                                            {tx.time}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.txAmount,
                                            {
                                                color:
                                                    tx.type === 'received'
                                                        ? colors.successGreen
                                                        : colors.primaryText,
                                            },
                                        ]}
                                    >
                                        {tx.type === 'received' ? '+' : '-'}KSh {tx.amount}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB Buttons (Left: Send, Right: Debtors, Middle: Footer) */}
            <View style={styles.fabContainer}>
                <Pressable
                    style={[styles.fab, styles.fabLeft, { backgroundColor: colors.primaryBlue }]}
                    onPress={() => navigation.navigate('send')}
                >
                    <MaterialCommunityIcons name="send" size={28} color="#FFF" />
                </Pressable>

                <Pressable
                    style={[styles.footerButton]}
                    onPress={handleFooterPress}
                    onLongPress={handleFooterLongPress}
                    onPressOut={handleFooterPressOut}
                >
                    <Text style={styles.footerText}>©️ codewithrazak</Text>
                </Pressable>

                <Pressable
                    style={[styles.fab, styles.fabRight, { backgroundColor: colors.errorRed }]}
                    onPress={() => navigation.navigate('debtors')}
                >
                    <MaterialCommunityIcons name="account-multiple" size={28} color="#FFF" />
                </Pressable>
            </View>

            {/* Admin Login Modal */}
            <Modal
                visible={showAdminModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAdminModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeCard }]}>
                        <Text style={[styles.modalTitle, { color: themeText }]}>Admin Login</Text>

                        <TextInput
                            style={[
                                styles.adminInput,
                                {
                                    backgroundColor: isDarkMode
                                        ? colors.inputBackground
                                        : colors.lightInputBackground,
                                    color: themeText,
                                },
                            ]}
                            placeholder="Email"
                            placeholderTextColor={themeSecondary}
                            value={adminEmail}
                            onChangeText={setAdminEmail}
                            keyboardType="email-address"
                        />

                        <TextInput
                            style={[
                                styles.adminInput,
                                {
                                    backgroundColor: isDarkMode
                                        ? colors.inputBackground
                                        : colors.lightInputBackground,
                                    color: themeText,
                                },
                            ]}
                            placeholder="Password"
                            placeholderTextColor={themeSecondary}
                            value={adminPassword}
                            onChangeText={setAdminPassword}
                            secureTextEntry
                        />

                        <Pressable
                            style={styles.adminLoginBtn}
                            onPress={handleAdminLogin}
                        >
                            <LinearGradient
                                colors={[colors.primaryBlue, colors.secondaryGreen]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.adminLoginBtnGradient}
                            >
                                <Text style={styles.adminLoginBtnText}>Login as Admin</Text>
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={styles.adminCloseBtn}
                            onPress={() => setShowAdminModal(false)}
                        >
                            <Text style={[styles.adminCloseBtnText, { color: colors.errorRed }]}>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    themeToggle: {
        padding: spacing.sm,
    },
    headerProfileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: 120,
    },
    welcomeSection: {
        marginBottom: spacing.lg,
    },
    welcomeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    welcomeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: spacing.sm,
    },
    welcomeAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    greeting: {
        fontSize: typography.h2,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    welcomeSubtitle: {
        fontSize: typography.body,
        fontWeight: '500',
    },
    skeleton: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius,
        marginBottom: spacing.md,
    },
    walletCarouselSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    walletButtonsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    walletButton: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    walletButtonText: {
        fontSize: typography.small,
        fontWeight: '600',
        marginTop: spacing.sm,
    },
    animatedBalanceContainer: {
        marginBottom: spacing.lg,
    },
    balanceCardGradient: {
        borderRadius: borderRadius.medium,
        padding: spacing.md,
        minHeight: 120,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 6,
        overflow: 'hidden',
    },
    balanceCardContent: {
        justifyContent: 'space-between',
        flex: 1,
    },
    balanceCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    walletNameLabel: {
        fontSize: typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    simTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.18)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.small,
    },
    simTypeLabel: {
        fontSize: typography.small,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
        marginLeft: 4,
    },
    balanceDisplay: {
        marginTop: spacing.sm,
    },
    balanceLabel: {
        fontSize: typography.small,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.primaryBlue,
        marginBottom: spacing.xs,
    },
    usdConversion: {
        fontSize: typography.small,
        color: 'rgba(28,28,30,0.7)',
        fontWeight: '500',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    currencyBlock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currencyCode: {
        fontSize: typography.small,
        color: 'rgba(28,28,30,0.7)',
        fontWeight: '600',
        marginRight: spacing.sm,
    },
    flagCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    usdFlagCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    flagEmoji: {
        fontSize: 20,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    quickActionButton: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: spacing.sm,
    },
    actionIconGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    actionLabel: {
        fontSize: typography.small,
        fontWeight: '600',
    },
    quickTransferSection: {
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    plusButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    collapsibleSection: {
        marginBottom: spacing.lg,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: 0,
        borderRadius: borderRadius,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    collapsibleTitle: {
        fontSize: typography.body,
        fontWeight: '700',
    },
    analyticsCard: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius,
        marginTop: spacing.sm,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    chart: {
        borderRadius: borderRadius,
        marginVertical: spacing.md,
    },
    payerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    payerAvatar: {
        fontSize: 28,
    },
    payerDetails: {
        flex: 1,
    },
    payerName: {
        fontSize: typography.small,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    percentBar: {
        width: '100%',
        height: 4,
        backgroundColor: colors.cardBackground,
        borderRadius: 2,
        overflow: 'hidden',
    },
    percentFill: {
        height: '100%',
        borderRadius: 2,
    },
    payerAmount: {
        fontSize: typography.small,
        fontWeight: '600',
    },
    transactionsContainer: {
        marginTop: spacing.sm,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius,
        marginBottom: spacing.md,
        gap: spacing.md,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    txAvatar: {
        fontSize: 32,
    },
    txDetails: {
        flex: 1,
    },
    txName: {
        fontSize: typography.body,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    txTime: {
        fontSize: typography.small,
        fontWeight: '500',
    },
    txAmount: {
        fontSize: typography.body,
        fontWeight: '700',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fabLeft: {},
    fabRight: {},
    footerButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    footerText: {
        fontSize: typography.small,
        fontWeight: '600',
        color: colors.secondaryText,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.medium + 8,
        borderTopRightRadius: borderRadius.medium + 8,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: typography.h2,
        fontWeight: '700',
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    adminInput: {
        borderRadius: borderRadius,
        padding: spacing.md,
        marginBottom: spacing.md,
        fontSize: typography.body,
        borderWidth: 1,
        borderColor: colors.secondaryText,
    },
    adminLoginBtn: {
        marginTop: spacing.lg,
        overflow: 'hidden',
        borderRadius: borderRadius,
    },
    adminLoginBtnGradient: {
        paddingVertical: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminLoginBtnText: {
        fontSize: typography.body,
        fontWeight: '700',
        color: '#FFF',
    },
    adminCloseBtn: {
        marginTop: spacing.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    adminCloseBtnText: {
        fontSize: typography.body,
        fontWeight: '600',
    },
    /* Sidebar & profile styles */
    hamburger: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarWrap: {
        marginRight: spacing.sm,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    headerAvatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 280,
        padding: spacing.lg,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    sidebarItemText: {
        fontSize: typography.body,
        marginLeft: spacing.sm,
    },
    sidebarLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
    },
    sidebarFooter: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    smallModal: {
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.medium,
    },
    profileModal: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.md,
        padding: spacing.lg,
        borderRadius: borderRadius.medium,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    profileTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    profileContent: {
        alignItems: 'center',
    },
    profileAvatarWrap: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarBadge: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: colors.primaryBlue,
        padding: 6,
        borderRadius: 12,
    },
    profileInfo: {
        width: '100%',
        marginTop: spacing.md,
    },
    profileRow: {
        marginBottom: spacing.md,
    },
    profileLabel: {
        fontSize: typography.small,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    profileValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileValue: {
        fontSize: typography.body,
        fontWeight: '700',
    },
    input: {
        width: '100%',
        borderRadius: borderRadius,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.primaryBlueLight,
        color: colors.primaryText,
    },
    saveProfileButton: {
        marginTop: spacing.md,
        width: '100%',
    },
    saveProfileGradient: {
        paddingVertical: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius,
    },
    updateButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius,
        backgroundColor: colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
