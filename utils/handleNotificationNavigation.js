// utils/handleNotificationNavigation.js

export const handleNotificationNavigation = (data, router) => {
    switch (data.type) {
        case 'NEW_MESSAGE':
            // Navigate to the ChatScreen for the chatId
            console.log('New message notification:', data);
            if (data.chatId) {
                router.push({pathname: '/Main/(tabs)/Messaging/chat', params: {chatId: data.chatId}});
            }
            break;

        case 'NEW_ORDER':
        case 'ORDER_RETURN_REQUESTED':
        case 'ORDER_CANCELED_BY_CUSTOMER':
            // Navigate to the specific Order Details screen
            console.log('Order status notification:', data);
            if (data.orderId) {
                router.push(`/Main/(tabs)/Orders/${data.orderId}`);
            }
            break;

        case 'PLATFORM_MESSAGE':
            // Navigate to Promotions page (optional)
            // router.push(`/Main/(tabs)/`);
            break;
        case 'PRODUCT_RATING_RECEIVED':
            if (data.productId) {
                router.push(`/Main/(tabs)/Products/${data.productId}`);
            }
            break;
        case 'STORE_RATING_RECEIVED':
            if (data.storeId) {
                router.push(`/Main/(tabs)/Store/StoreFront`);
            }
            break;
        case 'NEW_FOLLOWER':
            if (data.customerId) {
                router.push(`/Main/(tabs)/Store/FollowersList`);
            }
            break;


        // Add more cases as needed for other types
        default:
            console.log('Unknown notification type:', data.type);
            break;
    }
};