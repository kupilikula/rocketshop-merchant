import {Platform} from "react-native";

export const getDashboardPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/dashboard'
    } else {
        return '/Main/(tabs)/Dashboard'
    }
}

export const getStoreSelectorPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/store_selector'
    } else {
        return '/StoreSelector'
    }
}

export const getStoreFrontPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/store_front';
    } else {
        return '/Main/(tabs)/Store/StoreFront'
    }
}

export const getFollowersListPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/followers_list'
    } else {
        return '/Main/(tabs)/Store/FollowersList'
    }
}

export const getProductsPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/products';
    } else {
        return '/Main/(tabs)/Products'
    }
}

export const getProductPath = (productId) => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/products/${productId}`;
    } else {
        return `/Main/(tabs)/Products/${productId}`;
    }
}

export const getStoreProductsSearchPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/store_products_search';
    } else {
        return '/Main/(tabs)/Store/StoreProductsSearch'
    }
}

export const getCollectionsPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/collections';
    } else {
        return '/Main/(tabs)/Collections'
    }
}

export const getCollectionPath = (collectionId) => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/collections/${collectionId}`;
    } else {
        return `/Main/(tabs)/Collections/${collectionId}`;
    }
}

export const getOtherCollectionPath = () => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/collections/other`;
    } else {
        return `/Main/(tabs)/Collections/Other`;
    }
}

export const getOrdersPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/orders';
    } else {
        return '/Main/(tabs)/Orders'
    }
}

export const getOrderPath = (orderId) => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/orders/${orderId}`;
    } else {
        return `/Main/(tabs)/Orders/${orderId}`;
    }
}

export const getCustomersPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/customers';
    } else {
        return '/Main/(tabs)/Customers'
    }
}

export const getCustomerPath = (customerId) => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/customers/${customerId}`;
    } else {
        return `/Main/(tabs)/Customers/${customerId}`;
    }
}



export const getOffersPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/offers';
    } else {
        return '/Main/(tabs)/Offers'
    }
}

export const getOfferPath = (offerId) => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/offers/${offerId}`;
    } else {
        return `/Main/(tabs)/Offers/${offerId}`;
    }
}

export const getNewOfferPath = () => {
    if (Platform.OS === 'web') {
        return `/(web_merchant)/(protected)/offers/new_offer`;
    } else {
        return `/Main/(tabs)/Offers/NewOffer`;
    }
}

export const getMessagingPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/messaging';
    } else {
        return '/Main/(tabs)/Messaging'
    }
}

export const getStoreSettingsPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/store_settings';
    } else {
        return '/Main/(tabs)/StoreSettings'
    }
}

export const getMerchantSettingsPath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/merchant_settings';
    } else {
        return '/Main/(tabs)/MerchantSettings'
    }
}

export const getCreateStorePath = () => {
    if (Platform.OS === 'web') {
        return '/(web_merchant)/(protected)/create_store';
    } else {
        return '/CreateStore'
    }
}