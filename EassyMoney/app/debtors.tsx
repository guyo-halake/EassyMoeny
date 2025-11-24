import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../src/theme/colors';
import GlassmorphicView from '../src/components/shared/GlassmorphicView';

export default function DebtorsScreen() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={28}
                        color={colors.primaryText}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>Debtors & Pendings</Text>
                <View style={{ width: 28 }} />
            </View>

            <GlassmorphicView
                intensity={80}
                style={styles.content}
            >
                <Text style={styles.title}>Debtors & Pendings</Text>
                <Text style={styles.subtitle}>
                    Track all pending payments and debtors
                </Text>
            </GlassmorphicView>
        </View>
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
    content: {
        flex: 1,
        marginHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
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
