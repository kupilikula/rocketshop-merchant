import React, {useState, useEffect, useContext} from 'react';
import { ScrollView, View } from 'react-native';
import { Text, ActivityIndicator, RadioButton, Card, Button, useTheme } from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetShippingRuleForProduct } from '../../../../api/hooks/useGetShippingRuleForProduct';
import { useCreateShippingRule } from '../../../../api/hooks/useCreateShippingRule';
import { useUpdateShippingRule } from '../../../../api/hooks/useUpdateShippingRule';
import {useAssignShippingRule} from '../../../../api/hooks/useAssignShippingRule';
import ShippingRuleEditor from '../../../../components/ShippingRuleEditor';
import {updateField as updateEditProductField} from '../../../../store/editProductSlice';
import _ from "lodash";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";

export default function EditShippingRuleScreen() {
    const {productId} = useSelector((state) => state.editProduct);
    const { storeId } = useSelector((state) => state.store);
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const [editChoice, setEditChoice] = useState('');
    const [mode, setMode] = useState(null); // "loading", "choice", "edit"
    console.log('productId:', productId);
    const {
        data: shippingRule,
        isLoading,
        isError,
    } = useGetShippingRuleForProduct(productId, storeId);

    const createShippingRule = useCreateShippingRule(storeId);
    const updateShippingRule = useUpdateShippingRule(storeId);
    const associateRule = useAssignShippingRule(storeId);
    const {setShippingChanged} = useContext(ProductWorkflowContext);

    console.log('shippingRule:', shippingRule);

    useEffect(() => {
        if (shippingRule) {
            setMode(shippingRule.groupingEnabled ? 'choice' : 'edit');
            setEditChoice(shippingRule.groupingEnabled ? '' : 'editOnlyThis');
        }
    }, [shippingRule]);


    const handleEditorSubmit = (rulePayload) => {
        if (!rulePayload) return;

        // Remove transient fields before comparison
        const normalize = (rule) => ({
            ruleName: rule.ruleName,
            groupingEnabled: rule.groupingEnabled,
            isActive: rule.isActive !== false,
            conditions: rule.conditions?.map(cond => ({
                when: cond.when,
                baseCost: Number(cond.baseCost),
                costModifiers: cond.costModifiers,
            })) || [],
        });

        const current = normalize(shippingRule);
        const submitted = normalize(rulePayload);

        const hasChanged = !_.isEqual(current, submitted);

        if (hasChanged) {
            dispatch(updateEditProductField({field: 'shippingRuleChoice', value: editChoice})); // 'editAll' or 'editOnlyThis'
            dispatch(updateEditProductField({field: 'shippingRuleDraft', value: rulePayload}));
            setShippingChanged(true);
        } else {
            setShippingChanged(false);
        }

        router.push('/Main/(tabs)/EditProduct/EditPreview');
    };



    if (isLoading || mode === 'loading') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <ActivityIndicator animating />
                <Text>Loading shipping rule…</Text>
            </View>
        );
    }

    if (isError || !shippingRule) {
        return (
            <View style={{ padding: 16 }}>
                <Text>Error loading shipping rule. Please try again later.</Text>
            </View>
        );
    }

    if (mode === 'choice') {
        return (
            <ScrollView style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surface }}>
                <Card
                    mode="elevated"
                    style={{
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: editChoice === 'editOnlyThis' ? theme.colors.primary : 'white',
                        backgroundColor: theme.colors.surface,
                        padding: 8,
                        borderRadius: 0
                    }}
                    onPress={() => setEditChoice('editOnlyThis')}
                >
                    <Card.Title
                        title="Edit Shipping For This Product Only"
                        titleNumberOfLines={5}
                        subtitle={`This rule is shared with ${shippingRule.usageCount} products. A new rule will be created and assigned to this product.`}
                        subtitleNumberOfLines={5}
                        right={(props) => (
                            <RadioButton.Android
                                {...props}
                                value="editOnlyThis"
                                status={editChoice === 'editOnlyThis' ? 'checked' : 'unchecked'}
                            />
                        )}
                    />
                </Card>

                <Card
                    mode="elevated"
                    style={{
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: editChoice === 'editAll' ? theme.colors.primary : 'white',
                        backgroundColor: theme.colors.surface,
                        padding: 8,
                        borderRadius: 0

                    }}
                    onPress={() => setEditChoice('editAll')}
                >
                    <Card.Title
                        title="Edit Shipping for All Covered Products"
                        titleNumberOfLines={5}
                        subtitle={`Changes will apply to ${shippingRule.usageCount} products sharing this rule.`}
                        subtitleNumberOfLines={5}
                        right={(props) => (
                            <RadioButton.Android
                                {...props}
                                value="editAll"
                                status={editChoice === 'editAll' ? 'checked' : 'unchecked'}
                            />
                        )}
                    />
                </Card>

                <Button
                    mode="contained"
                    disabled={!editChoice}
                    onPress={() => setMode('edit')}
                >
                    Continue
                </Button>
            </ScrollView>
        );
    }

    // Show ShippingRuleEditor
    return (
        <ShippingRuleEditor
            initialData={shippingRule}
            mode={editChoice === 'editAll' ? 'edit' : 'clone'}
            onCancel={() => router.back()}
            onSave={handleEditorSubmit}
        />
    );
}
