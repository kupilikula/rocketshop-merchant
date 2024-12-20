import {en, en_IN, en_US, Faker} from "@faker-js/faker";


const fakerIndian = new Faker({locale: [en]});

const getMediaItem = () => {
    return {
        mediaId: fakerIndian.string.uuid(),
        mediaType: 'image',
        uri:
            fakerIndian.image.url(),
        orientation: 'landscape',
        desc:
            fakerIndian.string.alpha(),
    };
}

export const getProductForStore = () => {

    const collectionsList = ['Electronics', 'Fashion', 'Books', 'Home Appliances'];
    const attributeKeysList = ["Color", "Material", "Size"];
    const attributeValuesMap = {"Color": ["Red", "Blue", "Green"], "Material": ["Silk", "Cotton", "Leather"], "Size": ["Small", "Medium", "Large"]};
    const tagsList =        ["Best Sellers", "Featured", "HandMade", "New Arrival", "Discount", "Popular",];
    const collections  = fakerIndian.helpers.uniqueArray(() => fakerIndian.helpers.arrayElement(collectionsList), fakerIndian.number.int({min: 1, max: 4}));
    const attributeKeys = fakerIndian.helpers.uniqueArray( () => fakerIndian.helpers.arrayElement(attributeKeysList), fakerIndian.number.int({min: 0, max: 3}));
    const attributes = [];
    attributeKeys.forEach((k) => {
        attributes.push( { key: k, value: fakerIndian.helpers.arrayElement(attributeValuesMap[k]) });
    })
    const tags = fakerIndian.helpers.uniqueArray(() => fakerIndian.helpers.arrayElement(tagsList), fakerIndian.number.int({min: 1, max: 6}));

    return {
        productName: fakerIndian.commerce.productName(),
        productId: fakerIndian.string.uuid(),
        price: fakerIndian.number.int({ min: 100, max: 5000 }),
        stock: fakerIndian.number.int({min:0, max: 500}),
        description: fakerIndian.lorem.text(),
        collections: collections,
        gstRate: fakerIndian.helpers.arrayElement([0,5,12,18, 28]),
        attributes: attributes,
        tags: tags,
        rating: fakerIndian.number.float({ multipleOf: 0.5, min: 0, max:5 }),
        numberOfRatings: fakerIndian.number.int({min:0, max: 3000}),
        mediaItems: fakerIndian.helpers.multiple( getMediaItem , 3),
        productStatus: fakerIndian.helpers.arrayElement(["Active", "Draft"])
    }}

export const getProductForCustomerFeed = () => {
    return {
        storeName: fakerIndian.company.name(),
        storeId: fakerIndian.string.uuid(),
        storeLogoImage: fakerIndian.image.url(),
        storeBrandColor: fakerIndian.color.rgb(),
        productName: fakerIndian.commerce.productName(),
        productId: fakerIndian.string.uuid(),
        description: fakerIndian.lorem.text(),
        price: fakerIndian.number.int({ min: 100, max: 5000 }),
        rating: fakerIndian.number.float({ multipleOf: 0.5, min: 0, max:5 }),
        numberOfRatings: fakerIndian.number.int({min: 0, max: 3000}),
        mediaItems: [
            {
                mediaType: 'image',
                uri:
                    fakerIndian.image.url(),
                orientation: 'landscape',
                desc:
                    fakerIndian.string.alpha(),
            },
            {
                mediaType: 'image',
                uri:
                    fakerIndian.image.url(),
                orientation: 'landscape',
                desc:
                    fakerIndian.string.alpha(),
            },
            {
                mediaType: 'image',
                uri:
                    fakerIndian.image.url(),
                orientation: 'landscape',
                desc:
                    fakerIndian.string.alpha(),
            },
        ]
    }}
export const getCollection = () => {
    return {
        collectionName: fakerIndian.helpers.arrayElement(['Featured', 'Best Sellers', 'New Arrivals', 'AARI Work Blouses', 'Silk Sarees', 'T Shirts', 'Jeans']),
        collectionId: fakerIndian.string.uuid(),
        storeFrontDisplayNumberOfItems: fakerIndian.helpers.arrayElement([2,4,6,8]),
        products: fakerIndian.helpers.multiple(getProductForStore, {count: fakerIndian.number.int({min: 8, max: 60})}),
        status: fakerIndian.helpers.arrayElement(['Active', 'Inactive'])
    }
}

export const getStoreFullData = () => {
    return {
        storeName: 'Store Name',
        storeId: fakerIndian.string.uuid(),
        storeLogoImage: fakerIndian.image.url(),
        storeBrandColor: fakerIndian.color.rgb(),
        collections: fakerIndian.helpers.uniqueArray(getCollection, 5)
    }
}

export const getCustomer = () => {
    return {
        customerId: fakerIndian.string.uuid(),
        fullName: fakerIndian.person.fullName(),
        customerAddress: fakerIndian.location.streetAddress({useFullAddress: true}),
        phone: fakerIndian.phone.number(),
        email: fakerIndian.internet.email(),
        orders: fakerIndian.helpers.multiple(getOrderWithoutCustomer)
    }
}
export const getOrder = () => {
    return {
        orderId: fakerIndian.string.numeric({length: 10, allowLeadingZeros: false}),
        orderDate: fakerIndian.date.past(),
        orderItems: fakerIndian.helpers.multiple( () => ({product: getProductForStore(), quantity: fakerIndian.number.int({min: 1, max: 10})}), {count: fakerIndian.number.int({min: 1, max: 7})}),
        customer: getCustomer(),
        orderStatus: fakerIndian.helpers.arrayElement(["Received", "Payment Received", "Shipped", "Delivered"]),
        orderTotal: fakerIndian.number.int({min:30, max: 5000}),
    }
}

export const getOrderWithoutCustomer = () => {
    return {
        orderId: fakerIndian.string.numeric({length: 10, allowLeadingZeros: false}),
        orderDate: fakerIndian.date.past(),
        orderItems: fakerIndian.helpers.multiple( () => ({product: getProductForStore(), quantity: fakerIndian.number.int({min: 1, max: 10})}), {count: fakerIndian.number.int({min: 1, max: 7})}),
        orderStatus: fakerIndian.helpers.arrayElement(["Received", "Payment Received", "Shipped", "Delivered"]),
        orderTotal: fakerIndian.number.int({min:30, max: 5000}),
    }
}

export const getOffer = () => {
    return {
    offerId: fakerIndian.string.uuid(), // Unique identifier for the offer
    name: fakerIndian.company.buzzAdjective(), // Offer name
    description: fakerIndian.company.catchPhraseDescriptor(), // Optional description
    type: fakerIndian.helpers.arrayElement(['percentage' , 'fixed' , 'buyNgetK' , 'freeShipping']), // Type of the offer
    discount: {
        percentage: fakerIndian.number.int({min: 0, max: 90}), // For 'percentage' type
        fixedAmount: fakerIndian.number.int({min: 100, max: 4000}), // For 'fixed' type
        buyN: fakerIndian.number.int({min: 2, max: 10}), // For 'buyNgetK' type
        getK: 1, // For 'buyNgetK' type
    },
    applicableTo: {
        products: fakerIndian.helpers.multiple(getProductForStore), // Specific products
        collections: fakerIndian.helpers.multiple(getCollection), // Specific collections
        tags: fakerIndian.helpers.multiple(() => fakerIndian.helpers.arrayElement(['Hand Made', 'New Arrivals', 'Organza', 'Clearance', 'Trending'])), // Specific tags
    },
    conditions: {
        minimumPurchaseAmount: fakerIndian.helpers.arrayElement([500,1000,5000, 10000, null]), // Optional: Minimum purchase amount for the offer to apply
        minimumItems: fakerIndian.helpers.arrayElement([null,1,2,5,10]), // Optional: Minimum number of items for the offer to apply
    },
    validity: {
        startDate: fakerIndian.date.past(), // Start date of the offer
        endDate: fakerIndian.date.future(), // End date of the offer
    },
    isActive: fakerIndian.helpers.arrayElement([true,false]) // Whether the offer is currently active
};
}

