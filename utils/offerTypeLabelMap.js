

export const offerTypeLabelMap = (offer) => {

    if (!offer) return '';

    switch(offer.offerType) {
        case 'Percentage Off':
            return offer.discountDetails.percentage.toString() + '% Off';
        case 'Fixed Amount Off':
            return '₹' + offer.discountDetails.fixedAmount.toString() + ' Off';
        case 'Buy N Get K Free':
            return 'Buy ' + offer.discountDetails.buyN + ', Get ' + offer.discountDetails.getK + ' Free';
        case 'Free Shipping':
            return 'Free Shipping';
    }

}

export const offerConditionsText = (offer) => {
    if (!offer) return '';
    let conditionsText;
    let hasMinAmountCondition = offer.conditions?.minimumPurchaseAmount && offer.conditions.minimumPurchaseAmount > 0;
    let hasMinItemsCondition = offer.conditions?.minimumItems && offer.conditions.minimumItems > 0;

    if (!hasMinAmountCondition && !hasMinItemsCondition) {
        conditionsText = '';
    } else if (hasMinAmountCondition && !hasMinItemsCondition) {
        conditionsText = 'on purchase amount of ₹' + offer.conditions.minimumPurchaseAmount + ' or more';
    } else if (hasMinItemsCondition && !hasMinAmountCondition) {
        conditionsText = 'on purchase of ' + offer.conditions.minimumItems + ' or more items';
    } else {
        conditionsText = 'on purchase amount of ₹' + offer.conditions.minimumPurchaseAmount + ' or more\n& ' + offer.conditions.minimumItems + ' or more items';
    }
    return conditionsText;
}