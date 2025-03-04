import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {Text, Button, Card, IconButton, useTheme, Chip} from 'react-native-paper';
import ReorderableList, {
    ReorderableListItem,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {useRouter} from "expo-router";
import { useGetShippingRules } from '../../../../api/hooks/useGetShippingRules';
import { useReorderShippingRules } from '../../../../api/hooks/useReorderShippingRules';

import {useSelector} from "react-redux";

const RuleElement = React.memo(({ rule }) => {
    const drag = useReorderableDrag();
    const theme = useTheme();
    const router = useRouter();

    return (
        <ReorderableListItem>
            <Pressable onLongPress={drag}>
                <Card style={styles.ruleCard}>
                    <Card.Title
                        title={rule.ruleName}
                        subtitle={<Text>Priority: {rule.priority}</Text>}
                        right={(props) => (
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
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
                            <IconButton
                                {...props}
                                icon="pencil"
                                onPress={() => router.push(`/Main/(tabs)/Shipping/AddEditShippingRule?ruleId=${rule.ruleId}`)}
                            />
                            </View>
                        )}
                    />
                    <Card.Content>
                        <Text>Base Cost: ${rule.baseCost}</Text>
                        <Text>Shipping Cost: ${rule.formula}</Text>
                        {/* Render conditions */}
                    </Card.Content>
                </Card>
            </Pressable>
        </ReorderableListItem>
    );
});

export default function ShippingScreen() {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector((state) => state.store);
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


    const renderItem = ({ item }) => <RuleElement rule={item} />;

    return (
        <View style={styles.container}>
            <Text style={styles.description}>
                Configure shipping rules for your store. Rules are applied in order of priority.
            </Text>

            <ReorderableList
                data={rules}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={(item) => item.ruleId}
            />

            <Button
                mode="contained"
                onPress={handleAddRule}
                style={styles.addButton}
            >
                Add Shipping Rule
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    description: {
        marginBottom: 16,
        color: '#666',
    },
    ruleCard: {
        marginBottom: 12,
    },
    addButton: {
        marginTop: 16,
        marginBottom: 24,
    },
    statusChip: {
        // height: 24,
        margin: 8
    },

});