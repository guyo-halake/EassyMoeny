import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/colors';

const Footer = () => {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>EassyMoney — built with care</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        height: 56,
        backgroundColor: colors.cardBackground,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.background,
    },
    footerText: {
        fontSize: typography.small,
        color: colors.secondaryText,
    },
});

export default Footer;
