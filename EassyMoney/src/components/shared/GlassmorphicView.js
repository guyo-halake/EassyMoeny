import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, shadows } from '../../theme/colors';

const GlassmorphicView = ({
    children,
    intensity = colors.glassIntensity,
    tint = colors.glassTint,
    style,
}) => {
    return (
        <View style={[styles.container, style, shadows.card]}>
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            <View style={styles.overlay}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    overlay: {
        backgroundColor: 'rgba(28, 28, 30, 0.4)', 
        flex: 1,
        borderRadius: borderRadius,
    }
});

export default GlassmorphicView;
