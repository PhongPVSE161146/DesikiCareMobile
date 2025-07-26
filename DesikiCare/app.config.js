import 'dotenv/config';

export default {
  expo: {
    name: "DesikiCare",
    slug: "DesikiCare",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/DesikiCare.jpg",
    userInterfaceStyle: "automatic", // Support both light and dark modes
    splash: {
      // Image configuration
      image: './assets/DesikiCare.jpg', // High-resolution splash icon
      resizeMode: 'contain', // Maintain aspect ratio
      backgroundColor: '#fa7ca6', // Fallback background (light theme)

      // Theme support for light/dark modes
      themes: {
        light: {
          backgroundColor: '#fa7ca6',
          image: './assets/DesikiCare.jpg', // Light theme icon
          gradient: {
            colors: ['#fa7ca6', '#fa7ca6'], // Subtle gradient for light mode
            locations: [0, 1],
          },
        },
        dark: {
          backgroundColor: '#1a1a1a',
          image: './assets/DesikiCare-dark.jpg', // Dark theme icon (create this asset if needed)
          gradient: {
            colors: ['#1a1a1a', '#333333'], // Gradient for dark mode
            locations: [0, 1],
          },
        },
      },

      // Advanced animation configuration
      animation: {
        type: 'combo', // Options: 'fade', 'scale', 'pulse', 'combo' (fade + scale + pulse + gradient)
        duration: 1500, // Total animation duration
        delay: 300, // Delay before animation starts
        pulse: {
          scaleMin: 1,
          scaleMax: 1.1,
          cycles: 2,
          duration: 600,
        },
        scale: {
          initialScale: 0.8,
          finalScale: 1,
          tension: 50,
          friction: 7,
        },
        fade: {
          initialOpacity: 0,
          finalOpacity: 1,
        },
        gradient: {
          transitionDuration: 1000, // Gradient color transition
        },
      },

      // Platform-specific configurations
      ios: {
        storyboard: 'LaunchScreen', // Custom storyboard name
        imageAssets: {
          '1x': './assets/DesikiCare.jpg',
          '2x': './assets/DesikiCare.jpg',
          '3x': './assets/DesikiCare.jpg',
        },
      },
      android: {
        drawable: './assets/DesikiCare.jpg',
        layout: {
          name: 'launch_screen',
          backgroundColor: '#fa7ca6',
        },
      },

      // Status bar configuration
      statusBar: {
        style: 'auto', // 'light-content' for dark, 'dark-content' for light
        hidden: false,
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.desikicare.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#fa7ca6",
      },
      edgeToEdgeEnabled: true,
      package: "com.desikicare.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-font",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
          android: {
            enableProguardInReleaseBuilds: true,
          },
        },
      ],
    ],
    extra: {
      apiUrl: process.env.API_URL_LOGIN,
    },
  },
};