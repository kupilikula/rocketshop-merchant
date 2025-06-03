export const formatShippingRuleSummary = (rule) => {
    if (!rule || !Array.isArray(rule.conditions)) return '';
    console.log('rule.ruleName:', rule.ruleName);
    const lines = [];
    // 0. Number of products info
    if (rule.products?.length > 0) {
        lines.push(`${rule.products.length} products`);
    }


    // 1. Handle default (no condition)
    const defaultCondition = rule.conditions.find(c => c.when.length === 0);
    if (defaultCondition) {
        lines.push(`Default: ₹${defaultCondition.baseCost} ${summarizeCostModifiers(defaultCondition.costModifiers).join(', ')}`);
    }

    // 2. Handle conditional ones
    for (const cond of rule.conditions.filter(c => c.when.length > 0)) {
        const location = cond.when[0]; // You only have 1 location condition per branch
        let conditionText = '';

        if (location.locationType === 'city') {
            conditionText = `${location.operator === 'inside' ? 'Inside' : 'Outside'} ${location.city}`;
        } else if (location.locationType === 'state') {
            conditionText = `${location.operator === 'inside' ? 'Inside' : 'Outside'} ${location.state}`;
        } else if (location.locationType === 'country') {
            conditionText = `${location.operator === 'inside' ? 'Inside' : 'Outside'} ${location.country}`;
        }

        lines.push(`${conditionText}: ₹${cond.baseCost} ${summarizeCostModifiers(cond.costModifiers).join(', ')}`);
    }

    lines.push('International Shipping ' + (rule.is_international_shipping_enabled ? 'Enabled' : 'Disabled'));
    return lines.join('\n'); // Multi-line subtitle
};

const summarizeCostModifiers = (modifiers) => {
    if (!modifiers) return [];

    const lines = [];

    if (modifiers.extraPerItemEnabled && modifiers.extraPerItemCost && modifiers.freeItemCount !== undefined) {
        lines.push(`+ ₹${modifiers.extraPerItemCost}/item after ${modifiers.freeItemCount} item(s)`);
    }

    if (modifiers.discountEnabled && modifiers.discountPercentage && modifiers.discountThreshold) {
        lines.push(`${modifiers.discountPercentage}% shipping discount above ₹${modifiers.discountThreshold}`);
    }

    if (modifiers.capEnabled && modifiers.capAmount) {
        lines.push(`Cap at ₹${modifiers.capAmount}`);
    }

    return lines;
};