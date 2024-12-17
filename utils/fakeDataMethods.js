import {en, en_IN, en_US, Faker} from "@faker-js/faker";


const fakerIndian = new Faker({locale: [en]});

export const getProductForStore = () => {
    return {
        productName: fakerIndian.commerce.productName(),
        productId: fakerIndian.string.uuid(),
        price: fakerIndian.number.int({ min: 100, max: 5000 }),
        rating: fakerIndian.number.float({ multipleOf: 0.5, min: 0, max:5 }),
        productDescription: fakerIndian.lorem.text(),
        numberOfRatings: fakerIndian.number.int({min:0, max: 3000}),
        mediaItems: fakerIndian.helpers.multiple( () => (            {
            mediaId: fakerIndian.string.uuid(),
            mediaType: 'image',
            uri:
                fakerIndian.image.url(),
            orientation: 'landscape',
            desc:
                fakerIndian.string.alpha(),
        }), 3)
    }}

export const getProductForCustomerFeed = () => {
    return {
        storeName: fakerIndian.company.name(),
        storeId: fakerIndian.string.uuid(),
        storeLogoImage: fakerIndian.image.url(),
        storeBrandColor: fakerIndian.color.rgb(),
        productName: fakerIndian.commerce.productName(),
        productId: fakerIndian.string.uuid(),
        productDescription: fakerIndian.lorem.text(),
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
export const getFakeCollection = () => {
    return {
        collectionName: fakerIndian.helpers.arrayElement(['Featured', 'Best Sellers', 'New Arrivals', 'AARI Work Blouses', 'Silk Sarees', 'T Shirts', 'Jeans']),
        collectionId: fakerIndian.string.uuid(),
        storeFrontDisplayNumberOfItems: fakerIndian.helpers.arrayElement([2,4,6,8]),
        products: fakerIndian.helpers.multiple(getProductForStore, {count: fakerIndian.number.int({min: 8, max: 60})})
    }
}

export const getStoreFullData = () => {
    return {
        storeName: 'Store Name',
        storeId: fakerIndian.string.uuid(),
        storeLogoImage: fakerIndian.image.url(),
        storeBrandColor: fakerIndian.color.rgb(),
        collections: fakerIndian.helpers.uniqueArray(getFakeCollection, 5)
    }
}

export const getCustomer = () => {
    return {
        customerId: fakerIndian.string.uuid(),
        fullName: fakerIndian.person.fullName(),
        customerAddress: fakerIndian.location.streetAddress({useFullAddress: true}),
        phone: fakerIndian.phone.number(),
        email: fakerIndian.internet.email()
    }
}
export const getOrder = () => {
    return {
        orderId: fakerIndian.string.numeric({length: 10, allowLeadingZeros: false}),
        orderDate: fakerIndian.date.recent(),
        orderItems: fakerIndian.helpers.multiple( () => ({product: getProductForStore(), quantity: fakerIndian.number.int({min: 1, max: 10})}), {count: fakerIndian.number.int({min: 1, max: 7})}),
        customer: getCustomer(),
        orderStatus: fakerIndian.helpers.arrayElement(["Submitted", "Payment Received", "Shipped", "Delivered"]),
        orderTotal: fakerIndian.number.int({min:30, max: 5000}),
    }
}