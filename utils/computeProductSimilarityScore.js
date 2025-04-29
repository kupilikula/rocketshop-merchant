export const computeProductSimilarityScore = (newProduct, rule) => {
    let score = 0;
    console.log('newProduct', newProduct);
    console.log('rule', rule);
    if (rule.products.length === 0) {
        return undefined;
    }

    const newProductTags = new Set(newProduct.productTags || []);
    const newProductCollections = new Set(newProduct.collectionIds || []);
    const newProductName = (newProduct.productName || '').toLowerCase();
    const newProductDescription = (newProduct.description || '').toLowerCase();



    rule.products.forEach(product => {
        // Tags match
        (product.productTags || []).forEach(tag => {
            if (newProductTags.has(tag)) {
                score += 5; // +5 points per matching tag
            }
        });

        // Collections match
        (product.collectionIds || []).forEach(id => {
            if (newProductCollections.has(id)) {
                score += 3; // +3 points per matching collection
            }
        });

        const productName = (product.productName || '').toLowerCase();
        const productDescription = (product.description || '').toLowerCase();

        // Name match
        if (productName && newProductName && (productName.includes(newProductName) || newProductName.includes(productName))) {
            score += 10; // +10 points for name similarity
        }

        // Description match
        if (productDescription && newProductDescription) {
            const wordsInNewDesc = new Set(newProductDescription.split(/\s+/));
            const wordsInProductDesc = new Set(productDescription.split(/\s+/));

            // Count number of matching words
            let commonWordsCount = 0;
            wordsInNewDesc.forEach(word => {
                if (wordsInProductDesc.has(word)) {
                    commonWordsCount++;
                }
            });

            score += Math.min(commonWordsCount, 5); // +1 point per common word (max +5 points from description)
        }
    });

    return score;
};