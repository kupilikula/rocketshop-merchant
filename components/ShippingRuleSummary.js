import {Text, Badge, Card, RadioButton, useTheme} from "react-native-paper";
import {formatShippingRuleSummary} from "../utils/formatShippingRuleSummary";
import { View} from "react-native";
import React from "react";


export const ShippingRuleSummary = ({shippingRule, style}) => {

    const theme = useTheme();
    return <Card
        mode={'elevated'}
        style={{alignSelf: 'stretch', marginBottom: 16, padding: 0, borderRadius: 0, backgroundColor: 'white', ...style}}
    >
        <Card.Content>
        <Text variant={'titleMedium'}>{shippingRule.ruleName}</Text>
        <Text variant={'bodyLarge'}>{formatShippingRuleSummary(shippingRule)}</Text>
        </Card.Content>
    </Card>
}