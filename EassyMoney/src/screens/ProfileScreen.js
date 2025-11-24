import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing } from '../theme/colors';
import GlassmorphicView from '../components/shared/GlassmorphicView';
import Footer from '../components/Footer';

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <GlassmorphicView
                intensity={80}
                style={styles.content}
            >
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.subtitle}>
                    Manage your account settings and preferences
                </Text>
            </GlassmorphicView>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    content: {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.h2,
        fontWeight: '600',
        color: colors.primaryText,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: typography.body,
        color: colors.secondaryText,
    },
});

export default ProfileScreen;
