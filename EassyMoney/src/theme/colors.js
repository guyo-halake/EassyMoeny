// --- src/theme/colors.js ---
// Defines the color palette and design tokens for the EassyMoney app.
// Design: Soft, calm, and friendly with local context for East African users

const colors = {
    // Core Palette - Soft & Calm (Light Mode First - trust-focused)
    darkBackground: '#F8F9FA',      // Soft off-white background (main)
    cardBackground: '#FFFFFF',      // White cards with soft shadows
    inputBackground: '#F5F5F7',     // Soft light gray for input fields
    
    // Dark Mode Palette (for users who prefer dark theme)
    darkModeBg: '#1A1A1C',          // Soft dark background
    darkModeCard: '#2A2A2C',        // Soft dark cards
    darkModeInput: '#35353A',       // Soft dark inputs
    
    // Text and Contrast - Readable & Calm
    primaryText: '#1C1C1E',         // Dark gray/charcoal for readability
    secondaryText: '#6C6C70',       // Medium gray for subtitles and labels
    lightPrimaryText: '#F9F9F9',    // Light text for dark mode
    lightSecondaryText: '#AAAAAA',  // Light gray for dark mode
    
    // Primary Color Palette - Soft, Trust-Based
    primaryBlue: '#007ACC',         // Trust/Action - primary blue
    secondaryGreen: '#28A745',      // Growth/Success - soft green
    accentYellow: '#FFC107',        // Warm yellow - buttons & highlights
    errorRed: '#DC3545',            // Friendly alert/error red
    
    // Interactive Elements - Soft variants
    primaryBlueLight: '#E8F4FF',    // Light blue for backgrounds
    greenLight: '#E8F5E9',          // Light green for success states
    yellowLight: '#FFF3E0',         // Light yellow for backgrounds
    redLight: '#FFEBEE',            // Light red for error backgrounds
    
    // Status & Specific Elements
    mpesaGreen: '#28A745',          // M-Pesa brand green (aligned with secondary)
    successGreen: '#28A745',        // Positive status
    warningYellow: '#FFC107',       // Warnings
    dangerRed: '#DC3545',           // Errors/Alerts
    
    // Soft Accents (less vibrant, more calming)
    softPurple: '#6C63B5',          // Soft purple
    softCyan: '#00ACC1',            // Soft teal/cyan
    softOrange: '#FB8500',          // Soft orange
    
    // Glassmorphism Base
    glassTint: 'light',             // Blur tint: 'light' or 'dark'
    glassIntensity: 40,             // How strong the blur effect is (0-100)
    
    // Gradients - Soft & Harmonious
    gradientStart: '#007ACC',       // Primary blue
    gradientEnd: '#28A745',         // Secondary green
    brightGradientStart: '#FFC107', // Yellow accent
    brightGradientEnd: '#FB8500',   // Soft orange
    mpesaGradientStart: '#28A745',  // Green start
    mpesaGradientEnd: '#1E7E34',    // Darker green end
    successGradient: ['#28A745', '#20C997'], // Success gradient
    warningGradient: ['#FFC107', '#FB8500'], // Warning gradient
};

const typography = {
    // Tahoma font family with updated sizes
    fontFamily: 'Tahoma, system-ui, sans-serif',
    
    // Heading 1 - Large titles
    h1: 32,
    h1Weight: '700',
    
    // Heading 2 - Section titles
    h2: 22,
    h2Weight: '700',
    
    // Body text
    body: 16,
    bodyWeight: '600',
    
    // Small text
    small: 12,
    smallWeight: '600',
    
    // Caption/tiny text
    caption: 10,
    captionWeight: '500',
};

const spacing = {
    xs: 4,
    sm: 8,
    md: 12,  // Updated to 12px minimum
    lg: 16,  // Updated to 16px
    xl: 24,
    xxl: 32,
};

const borderRadius = {
    small: 8,   // 8px for small elements
    medium: 12, // 12px for cards (default)
    large: 16,  // 16px for larger components
    pill: 24,   // For pill buttons
};

const shadows = {
    // Soft shadows with 5% opacity
    subtle: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    elevated: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
};

// Animation preset values
const animations = {
    // Micro interactions
    buttonPress: 0.95,          // Scale down to 95% on press
    popEffect: {
        duration: 300,
        scale: 1.1,
    },
    fadeIn: {
        duration: 300,
        initialOpacity: 0,
        finalOpacity: 1,
    },
    slideFromTop: {
        duration: 400,
        initialY: -50,
        finalY: 0,
    },
    loadingBounce: {
        duration: 1000,
        minScale: 0.9,
        maxScale: 1.1,
    },
    successCheckmark: {
        duration: 600,
        scale: [1, 1.2, 1],
    },
};

export { colors, typography, spacing, borderRadius, shadows, animations };
