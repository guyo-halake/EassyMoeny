import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Text,
    Pressable,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/colors';
import GlassmorphicView from '../components/shared/GlassmorphicView';
import Footer from '../components/Footer';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
    const userName = 'John';

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 18) return 'Afternoon';
        return 'Evening';
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Greeting */}
                <View style={styles.header}>
                    <Text style={styles.greetingText}>
                        {getGreeting()}, {userName}
                    </Text>
                </View>

                {/* Main Balance Card */}
                <GlassmorphicView
                    intensity={80}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceCardContent}>
                        <Text style={styles.balanceLabel}>Actual balance</Text>
                        <Text style={styles.balanceAmount}>KSh 125,800.50</Text>
                        <Text style={styles.balanceSubtitle}>Virtual Wallet Balance</Text>
                    </View>
                </GlassmorphicView>

                {/* Quick Action Buttons */}
                <View style={styles.quickActionsContainer}>
                    <Pressable
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('SendPayment')}
                    >
                        <View style={styles.actionIconContainer}>
                            <MaterialCommunityIcons
                                name="send"
                                size={24}
                                color={colors.primaryText}
                            />
                        </View>
                        <Text style={styles.actionLabel}>Send</Text>
                    </Pressable>

                    <Pressable
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Deposit')}
                    >
                        <View style={styles.actionIconContainer}>
                            <MaterialCommunityIcons
                                name="wallet-plus"
                                size={24}
                                color={colors.primaryText}
                            />
                        </View>
                        <Text style={styles.actionLabel}>Deposit</Text>
                    </Pressable>

                    <Pressable
                        style={styles.quickActionButton}
                        onPress={() => navigation.navigate('Debtors')}
                    >
                        <View style={styles.actionIconContainer}>
                            <MaterialCommunityIcons
                                name="account-multiple"
                                size={24}
                                color={colors.primaryText}
                            />
                        </View>
                        <Text style={styles.actionLabel}>Debtors</Text>
                    </Pressable>
                </View>

                {/* Accounts/Wallet Cards */}
                <View style={styles.accountsSection}>
                    <Text style={styles.sectionTitle}>Your Wallets</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.accountsScroll}
                    >
                        {/* Pochi la Biashara */}
                        <GlassmorphicView
                            intensity={75}
                            style={styles.accountCard}
                        >
                            <View style={styles.accountCardContent}>
                                <View style={styles.accountIconRow}>
                                    <MaterialCommunityIcons
                                        name="wallet"
                                        size={32}
                                        color={colors.accentOrange}
                                    />
                                    <Text style={styles.accountCardTitle}>
                                        Pochi la Biashara
                                    </Text>
                                </View>
                                <Text style={styles.accountBalance}>KSh 85,400</Text>
                                <Text style={styles.accountType}>Business Wallet</Text>
                            </View>
                        </GlassmorphicView>

                        {/* USDT */}
                        <GlassmorphicView
                            intensity={75}
                            style={styles.accountCard}
                        >
                            <View style={styles.accountCardContent}>
                                <View style={styles.accountIconRow}>
                                    <MaterialCommunityIcons
                                        name="currency-usd"
                                        size={32}
                                        color={colors.accentBlue}
                                    />
                                    <Text style={styles.accountCardTitle}>USDT</Text>
                                </View>
                                <Text style={styles.accountBalance}>$1,240.50</Text>
                                <Text style={styles.accountType}>Crypto Wallet</Text>
                            </View>
                        </GlassmorphicView>
                    </ScrollView>
                </View>

                {/* Income Trends Graph */}
                <View style={styles.trendsSection}>
                    <Text style={styles.sectionTitle}>Income Trends</Text>
                    <GlassmorphicView
                        intensity={75}
                        style={styles.trendCard}
                    >
                        <LineChart
                            data={{
                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                datasets: [
                                    {
                                        data: [20, 45, 28, 80, 99, 43, 50],
                                        color: () => colors.accentBlue,
                                        strokeWidth: 2,
                                    },
                                ],
                            }}
                            width={screenWidth - spacing.lg}
                            height={220}
                            yAxisLabel="KSh"
                            yAxisSuffix="k"
                            chartConfig={{
                                backgroundColor: 'transparent',
                                backgroundGradientFrom: 'transparent',
                                backgroundGradientTo: 'transparent',
                                color: () => colors.secondaryText,
                                strokeWidth: 2,
                                barPercentage: 0.5,
                                useShadowColorFromDataset: false,
                            }}
                            style={styles.chart}
                        />
                    </GlassmorphicView>
                </View>
            </ScrollView>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: 120, // Add space for tab bar
    },
    header: {
        marginBottom: spacing.lg,
    },
    greetingText: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
    },
    balanceCard: {
        marginBottom: spacing.lg,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        minHeight: 140,
        justifyContent: 'center',
    },
    balanceCardContent: {
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: typography.small,
        color: colors.secondaryText,
        marginBottom: spacing.sm,
    },
    balanceAmount: {
        fontSize: typography.h1,
        fontWeight: '700',
        color: colors.primaryText,
        marginBottom: spacing.sm,
    },
    balanceSubtitle: {
        fontSize: typography.small,
        color: colors.secondaryText,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.lg,
    },
    quickActionButton: {
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        ...shadows.card,
    },
    actionLabel: {
        fontSize: typography.small,
        color: colors.primaryText,
        fontWeight: '500',
    },
    accountsSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
        marginBottom: spacing.md,
    },
    accountsScroll: {
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    accountCard: {
        marginRight: spacing.md,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        width: 160,
        minHeight: 140,
    },
    accountCardContent: {
        justifyContent: 'space-between',
        flex: 1,
    },
    accountIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    accountCardTitle: {
        fontSize: typography.body,
        fontWeight: '600',
        color: colors.primaryText,
        marginLeft: spacing.md,
        flex: 1,
    },
    accountBalance: {
        fontSize: typography.body,
        fontWeight: '700',
        color: colors.primaryText,
        marginBottom: spacing.xs,
    },
    accountType: {
        fontSize: typography.small,
        color: colors.secondaryText,
    },
    trendsSection: {
        marginBottom: spacing.lg,
    },
    trendCard: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        overflow: 'hidden',
    },
    chart: {
        borderRadius: borderRadius,
        marginVertical: spacing.md,
    },
});

export default DashboardScreen;
