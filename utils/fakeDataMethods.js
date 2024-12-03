import {faker} from "@faker-js/faker";

export const getProductForStore = () => {
    return {
        productName: faker.commerce.productName(),
        productId: faker.string.uuid(),
        price: faker.number.int({ min: 100, max: 5000 }),
        rating: faker.number.float({ multipleOf: 0.5, min: 0, max:5 }),
        productDescription: faker.lorem.text(),
        numberOfRatings: faker.number.int({min:0, max: 3000}),
        mediaItems: [
            {
                mediaType: 'image',
                uri:
                    faker.image.url(),
                orientation: 'landscape',
                desc:
                    faker.string.alpha(),
            },
            {
                mediaType: 'image',
                uri:
                    faker.image.url(),
                orientation: 'landscape',
                desc:
                    faker.string.alpha(),
            },
            {
                mediaType: 'image',
                uri:
                    faker.image.url(),
                orientation: 'landscape',
                desc:
                    faker.string.alpha(),
            },
        ]
    }}

export const getProductForCustomerFeed = () => {
    return {
        storeName: faker.company.name(),
        storeId: faker.string.uuid(),
        storeLogoImage: faker.image.url(),
        storeBrandColor: faker.color.rgb(),
        productName: faker.commerce.productName(),
        productId: faker.string.uuid(),
        productDescription: faker.lorem.text(),
        price: faker.number.int({ min: 100, max: 5000 }),
        rating: faker.number.float({ multipleOf: 0.5, min: 0, max:5 }),
        numberOfRatings: faker.number.int({min: 0, max: 3000}),
        mediaItems: [
            {
                mediaType: 'image',
                uri:
                    faker.image.url(),
                orientation: 'landscape',
                desc:
                    faker.string.alpha(),
            },
            {
                mediaType: 'image',
                uri:
                    faker.image.url(),
                orientation: 'landscape',
                desc:
                    faker.string.alpha(),
            },
            {
                mediaType: 'image',
                uri:
                    faker.image.url(),
                orientation: 'landscape',
                desc:
                    faker.string.alpha(),
            },
        ]
    }}
export const getFakeCollection = () => {
    return {
        collectionName: faker.helpers.arrayElement(['Featured', 'Best Sellers', 'New Arrivals', 'AARI Work Blouses', 'Silk Sarees', 'T Shirts', 'Jeans']),
        collectionId: faker.string.uuid(),
        storeFrontDisplayNumberOfItems: faker.helpers.arrayElement([2,4,6,8]),
        products: faker.helpers.multiple(getProductForStore, {count: faker.number.int({min: 8, max: 60})})
    }
}

export const getStoreFullData = () => {
    return {
        storeName: 'Store Name',
        storeId: faker.string.uuid(),
        storeLogoImage: faker.image.url(),
        storeBrandColor: faker.color.rgb(),
        collections: faker.helpers.uniqueArray(getFakeCollection, 5)
    }
}
