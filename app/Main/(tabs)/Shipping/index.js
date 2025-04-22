import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {Text, Button, Card, IconButton, useTheme, Chip} from 'react-native-paper';
import ReorderableList, {
    ReorderableListItem,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import {useRouter} from "expo-router";
import { useGetShippingRules } from '../../../../api/hooks/useGetShippingRules';
import { useReorderShippingRules } from '../../../../api/hooks/useReorderShippingRules';

import {useSelector} from "react-redux";
import GenericHeader from "../../../../components/GenericHeader";

const RuleElement = React.memo(({ rule }) => {
    const drag = useReorderableDrag();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();

    return (
        <ReorderableListItem>
            <Pressable onLongPress={drag}>
                <Card style={styles.ruleCard}>
                    <View style={{display: 'flex', flexDirection: 'column'}}>
                        <Text variant={'titleMedium'}>{rule.ruleName}</Text>
                        <Text variant={'bodyLarge'}>Base Cost: ₹{rule.baseCost}</Text>
                        <Text variant={'bodyLarge'}>Shipping Cost: {rule.formula}</Text>
                        <View style={{alignSelf: 'flex-start'}}>
                        <Chip
                            mode="flat"
                            style={[
                                styles.statusChip,
                                {
                                    backgroundColor: rule.isActive
                                        ? theme.colors.active
                                        : theme.colors.inactive
                                }
                            ]}
                        >
                            {rule.isActive ? 'Active' : 'Inactive'}
                        </Chip>
                        </View>
                    </View>
                    <View style={{position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <IconButton
                            style={{}}
                            icon="pencil"
                            onPress={() => router.push(`/Main/(tabs)/Shipping/AddEditShippingRule?ruleId=${rule.ruleId}`)}
                        />
                        <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.primary, display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}><Text variant={'bodyLarge'} style={{color: 'white', textAlign: 'center'}}>{rule.priority}</Text></View>
                    </View>
                </Card>
            </Pressable>
        </ReorderableListItem>
    );
});

const helpText = `Configure shipping rules for your store. 
1. Rules are evaluated in ascending order of priority value. 
2. The first rule applicable to a cart item (or group of cart items) that can compute a valid shipping cost will be applied for the item(s). 
3. Drag & Drop the rules to reorder them.`;



export default function ShippingScreen() {
    const theme = useTheme();
    const router = useRouter();
    const styles = makeStyles(theme);
    const {storeId} = useSelector((state) => state.store);
    const [helpVisible, setHelpVisible] = useState(true);
    const {
        data: rules = [],
        isLoading,
        isError,
        error,
        refetch
    } = useGetShippingRules(storeId);
    const reorderRules = useReorderShippingRules();


    console.log('rules:', rules);
    const handleAddRule = () => {
        router.push('/Main/(tabs)/Shipping/AddEditShippingRule');
    };

    const handleReorder = async ({ from, to }) => {
        console.log('handleReorder, rules:', rules);
        const newData = reorderItems(rules, from, to);
        console.log('handleReorder, newData:', newData);
        // Update priorities
        const updatedRules = newData.map((rule, index) => ({
            ...rule,
            priority: index + 1
        }));
        console.log('handleReorder, updatedRules:', updatedRules);

        try {
            await reorderRules.mutateAsync({
                storeId,
                data: {
                    ruleOrders: updatedRules.map(rule => ({
                    ruleId: rule.ruleId,
                    priority: rule.priority
                }))}
            });
        } catch (error) {
            console.error('Failed to reorder rules:', error);
            refetch(); // Refetch the original order if update fails
        }
    };

    const HelpButton = () =>
    <View style={{width: 30, height: 30, justifyContent: 'center', alignItems: 'center'}}>
        <IconButton icon={'help-circle'} onPressIn={() =>{
        console.log('helpVisible:', helpVisible);
        setHelpVisible(!helpVisible);
    }} color={theme.colors.primary} size={24} style={{alignSelf: 'center'}}/>
    </View>;


    const renderItem = ({ item }) => <RuleElement rule={item} />;

    return (
        <>
        <GenericHeader title={'Shipping Rules'} right={<HelpButton/>}/>

        <View style={styles.container}>
            {helpVisible &&
                <Card mode={'elevated'} style={{backgroundColor: 'white', borderRadius: 0}}>
                    <Card.Content>
                <Text variant={'titleMedium'} style={{marginVertical: 10}}>
                    Configure shipping rules for your store.
            </Text>
                        <Text variant={'bodyLarge'} style={{}}>
                            1. Rules are evaluated in ascending order of priority value.
                        </Text>
                        <Text variant={'bodyLarge'} style={{}}>
                            2. The first rule applicable to a cart item (or group of cart items) that can compute a valid shipping cost will be applied for the item(s).
                        </Text>
                        <Text variant={'bodyLarge'} style={{}}>
                            3. Drag & Drop the rules to reorder them.
                        </Text>
                    </Card.Content>
                </Card>
            }

            <ReorderableList
                data={rules}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={(item) => item.ruleId}
            />

            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Button
                icon="plus"
                mode="outlined"
                onPress={handleAddRule}
                style={styles.addButton}
                labelStyle={{color: theme.colors.success}}
            >
                Add Shipping Rule
            </Button>
            </View>
        </View>
        </>
    );
}

const makeStyles =  (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.surface,
    },
    description: {
        marginBottom: 16,
        color: '#666',
    },
    ruleCard: {
        marginVertical: 10,
        position: 'relative',
        padding: 16,
        backgroundColor: 'white'
    },
    addButton: {
        marginTop: 16,
        marginBottom: 24,
        borderColor: theme.colors.success,
    },
    statusChip: {
        // height: 24,
        marginVertical: 8
    },

});