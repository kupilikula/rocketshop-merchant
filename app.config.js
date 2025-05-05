// app.config.js (for Merchant App)
import 'dotenv/config'; // Optional: for local development .env loading

// --- Define BASE static configuration for Merchant App ---
// Values taken from your original app.json that DON'T change per environment
const baseConfig = {
    slug: "merchant",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/RocketShopIconOrange1024.png", // Merchant App Icon
    scheme: "rocketshopmerchant",
    sdkVersion: "52.0.0", // Keep if intentionally pinned, remove to use project default SDK
    userInterfaceStyle: "automatic",
    newArchEnabled: true, // Keep or remove based on your needs

// --- Platform Static Config (Base) ---
    ios: {
        supportsTablet: true,
        icon: "./assets/images/RocketShopIconOrangeIOS1024.png", // iOS Specific Icon
// Associated domain points to the Production merchant domain for App Links
        associatedDomains: ["applinks:merchant.rocketshop.in"],
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/RocketShopIconOrangeAndroid1024.png",
            backgroundColor: "#FF6F59"
        },
        softwareKeyboardLayoutMode: "resize", // Intent filters should point to the Production merchant domain for App Links
        intentFilters: [{
            action: "VIEW",
            autoVerify: true,
            data: {
                scheme: "https",
                host: "merchant.rocketshop.in", // Corrected host for merchant app links
                pathPrefix: "/"
            },
            category: ["BROWSABLE", "DEFAULT"]
        }],
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json", // Allow override via env if needed
        permissions: [ // Preserved required permissions
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.ACCESS_MEDIA_LOCATION",
            "android.permission.CAMERA",
            "android.permission.RECORD_AUDIO"
        ]
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
    },
    androidNavigationBar: {
        visible: "sticky-immersive",
        backgroundColor: "#00000000"
    },
    plugins: [ // Preserved all plugins
        "expo-router",
        [
            "expo-font", {
            "fonts": [
                "./assets/fonts/CaveatBrush-Regular.ttf", // Ensure this path is correct relative to your project root
                "node_modules/@expo-google-fonts/atma/Atma_600SemiBold.ttf"
            ]
        }
        ],
        [
            "expo-media-library", {
            "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
            "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
            "isAccessMediaLocationEnabled": true
        }
        ],
        [
            "expo-camera", {
            "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
            "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
            "recordAudioAndroid": true
        }
        ],
        [
            "expo-splash-screen", {
            "image": "./assets/images/splash-icon.png", // Ensure path is correct
            "imageWidth": 200, "resizeMode": "contain", "backgroundColor": "#ffffff"
        }
        ],
        "expo-video",
        [
            "expo-build-properties", {
            "android": {
                "kotlinVersion": "1.9.25", "composeCompilerVersion": "1.5.15"
            }
        }
        ],
        [
            "expo-notifications"
        ]
    ], experiments: {
        "typedRoutes": true
    }, extra: {
// --- Static 'extra' configuration ---
        router: {
            origin: false // Preserved from original
        }, eas: {
            projectId: "bde2d7cd-f9f9-4c0a-8902-d1c9aa3556b0" // Preserved static EAS Project ID
        }
// Add any other NON-environment specific 'extra' config here
    }
};
// --- End Base Config ---


// --- Main Export Function ---
export default ({config}) => { // Receives Expo defaults/CLI flags, but we primarily use our baseConfig
// Determine the environment (Dev/QA vs Prod)
    const environment = process.env.APP_ENV || 'development';

// Environment-specific variables (API URLs, etc.)
    const envConfig = {
        development: { // QA Environment settings
            API_BASE_URL: 'https://api.qa.merchant.rocketshop.in', // Available if merchant app calls market API
            APP_VARIANT_SUFFIX: '.qa', // For bundleId/package
            APP_NAME_SUFFIX: ' Merchant (QA)', // For display name
        }, production: { // Production Environment settings
            API_BASE_URL: 'https://api.merchant.rocketshop.in',
            APP_VARIANT_SUFFIX: '',
            APP_NAME_SUFFIX: ' Merchant',
        },
    };

    let currentEnvConfig = envConfig[environment];
    if (!currentEnvConfig) {
        console.warn(`[App Config] Warning: Invalid APP_ENV '${environment}'. Defaulting to development configuration.`);
        currentEnvConfig = envConfig['development'];
    }
    console.log(`[App Config] Using environment: ${environment}`);
    console.log(`[App Config] Merchant API URL: ${currentEnvConfig.API_MERCHANT_URL}`);

// --- Return the final merged config object ---
    return {
// Start with the base static config defined above
        ...baseConfig,

// --- Apply dynamic overrides ---
// Use base name from baseConfig or default, append suffix
        name: `${baseConfig.name || 'merchant'}${currentEnvConfig.APP_NAME_SUFFIX}`,

        ios: {
            ...baseConfig.ios, // Include static iOS settings
// Override bundleIdentifier based on environment
            bundleIdentifier: `${baseConfig.ios.bundleIdentifier || 'com.rocketshop.merchant'}${currentEnvConfig.APP_VARIANT_SUFFIX}`,
        }, android: {
            ...baseConfig.android, // Include static Android settings
// Override package name based on environment
            package: `${baseConfig.android.package || 'com.rocketshop.merchant'}${currentEnvConfig.APP_VARIANT_SUFFIX}`,
        },

// --- Merge the 'extra' field ---
        extra: {
            ...baseConfig.extra, // Include static 'extra' (router, eas.projectId)
// Add environment-specific variables for runtime use by your app code
            environment: environment,
            apiBaseUrl: currentEnvConfig.API_BASE_URL, // Available if needed
// Add any other dynamic 'extra' variables your app needs here
        },

// sdkVersion is included from baseConfig. Remove from baseConfig if you want EAS/Expo to manage it.
    };
};