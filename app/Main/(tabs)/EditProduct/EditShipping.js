import React, {useState, useEffect, useContext} from 'react';
import {Platform, ScrollView, View} from 'react-native';
import { Text, ActivityIndicator, RadioButton, Card, Button, useTheme } from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import { useRouter } from 'expo-router';
import { useGetShippingRuleForProduct } from '../../../../api/hooks/useGetShippingRuleForProduct';
import ShippingRuleEditor from '../../../../components/ShippingRuleEditor';
import {updateField as updateEditProductField} from '../../../../store/editProductSlice';
import _ from "lodash";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";
import {ShippingRuleSummary} from "../../../../components/ShippingRuleSummary";

const IS_WEB = Platform.OS === 'web';

export default function EditShippingRuleScreen() {
    const {productId} = useSelector((state) => state.editProduct);
    const { storeId } = useSelector((state) => state.store);
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const [editChoice, setEditChoice] = useState('');
    const [currentMode, setCurrentMode] = useState('loading');

    const {
        data: shippingRule,
        isLoading,
        isError, // Keep isError in case you want to handle it later
    } = useGetShippingRuleForProduct(productId, storeId);

    const {setShippingChanged} = useContext(ProductWorkflowContext);

    useEffect(() => {
        if (!isLoading) {
            if (shippingRule) {
                setCurrentMode(shippingRule.groupingEnabled && shippingRule.usageCount > 1 ? 'choice' : 'edit');
                setEditChoice(shippingRule.groupingEnabled && shippingRule.usageCount > 1 ? '' : 'editOnlyThis');
            } else {
                // No existing rule, go directly to editor to create one
                setCurrentMode('edit');
                setEditChoice('editOnlyThis');
            }
        }
    }, [shippingRule, isLoading]);


    const handleEditorSubmit = (rulePayload) => {
        if (!rulePayload) return;

        const normalize = (rule) => ({
            ruleName: rule.ruleName,
            groupingEnabled: rule.groupingEnabled,
            is_international_shipping_enabled: rule.is_international_shipping_enabled,
            isActive: rule.isActive !== false,
            conditions: rule.conditions?.map(cond => ({
                when: cond.when,
                baseCost: Number(cond.baseCost),
                costModifiers: cond.costModifiers,
            })) || [],
        });

        const current = shippingRule ? normalize(shippingRule) : null;
        const submitted = normalize(rulePayload);
        const hasChanged = current ? !_.isEqual(current, submitted) : true;

        if (hasChanged) {
            dispatch(updateEditProductField({field: 'shippingRuleChoice', value: editChoice}));
            dispatch(updateEditProductField({field: 'shippingRuleDraft', value: rulePayload}));
            setShippingChanged(true);
        } else {
            setShippingChanged(false);
        }
        router.push(IS_WEB ? '/(web_merchant)/(protected)/edit_product/preview' : '/Main/(tabs)/EditProduct/EditPreview');
    };

    if (isLoading || currentMode === 'loading') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: theme.colors.surface }}>
                <ActivityIndicator animating={true} size={IS_WEB ? 'large' : 100} color={theme.colors.primary} />
            </View>
        );
    }

    if (currentMode === 'choice' && shippingRule) {
        return (
            <ScrollView
                style={{ flex: 1, backgroundColor: theme.colors.surface }}
                contentContainerStyle={
                    IS_WEB
                        ? { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 }
                        : { padding: 16 }
                }
            >
                <View style={IS_WEB ? { width: '100%', maxWidth: 700 } : {}}>

                    {shippingRule.groupingEnabled && shippingRule.usageCount > 1 && (
                        <View style={{marginVertical: 16}}>
                            <Text variant={'titleMedium'} style={{marginBottom: 16}}>Current Shipping Rule Summary</Text>
                            <ShippingRuleSummary shippingRule={shippingRule} />
                        </View>
                    )}

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

                    <Card
                        mode="elevated"
                        style={{
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: editChoice === 'assignExisting' ? theme.colors.primary : 'white',
                            backgroundColor: theme.colors.surface,
                            padding: 8,
                            borderRadius: 0
                        }}
                        onPress={() => setEditChoice('assignExisting')}
                    >
                        <Card.Title
                            title="Assign Different Existing Shipping Rule"
                            titleNumberOfLines={5}
                            subtitle="Choose from already created rules and assign it to this product."
                            subtitleNumberOfLines={5}
                            right={(props) => (
                                <RadioButton.Android
                                    {...props}
                                    value="assignExisting"
                                    status={editChoice === 'assignExisting' ? 'checked' : 'unchecked'}
                                />
                            )}
                        />
                    </Card>
                    <Card
                        mode="elevated"
                        style={{
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: editChoice === 'editNone' ? theme.colors.primary : 'white',
                            backgroundColor: theme.colors.surface,
                            padding: 8,
                            borderRadius: 0
                        }}
                        onPress={() => setEditChoice('editNone')}
                    >
                        <Card.Title
                            title="Skip Editing Shipping"
                            titleNumberOfLines={5}
                            subtitle={`No changes to Shipping Cost`}
                            subtitleNumberOfLines={5}
                            right={(props) => (
                                <RadioButton.Android
                                    {...props}
                                    value="editNone"
                                    status={editChoice === 'editNone' ? 'checked' : 'unchecked'}
                                />
                            )}
                        />
                    </Card>

                    <View style={{alignSelf: 'center'}}>
                        <Button
                            mode="contained"
                            disabled={!editChoice}
                            onPress={() => {
                                if (editChoice === 'editNone') {
                                    setShippingChanged(false);
                                    router.push(IS_WEB ? '/(web_merchant)/(protected)/edit_product/preview' : '/Main/(tabs)/EditProduct/EditPreview');
                                } else if (editChoice === 'assignExisting') {
                                    router.push(IS_WEB ? '/(web_merchant)/(protected)/edit_product/select_shipping_rule' : '/Main/(tabs)/EditProduct/SelectExistingShippingRule');
                                } else {
                                    setCurrentMode('edit');
                                }
                            }}
                            style={{ borderRadius: 8 }} // Original button style
                        >
                            Continue
                        </Button>
                    </View>
                </View>
            </ScrollView>
        );
    }

    let editorMode = 'create';
    if (shippingRule) {
        editorMode = (editChoice === 'editAll' && currentMode === 'edit') ? 'edit' : 'clone';
    }

    return (
        <ShippingRuleEditor
            initialData={shippingRule}
            mode={editorMode}
            onCancel={() => {
                if (currentMode === 'edit' && shippingRule && shippingRule.groupingEnabled && shippingRule.usageCount > 1) {
                    setCurrentMode('choice');
                    setEditChoice('');
                } else {
                    router.back();
                }
            }}
            onSave={handleEditorSubmit}
            saveButtonLabel={'Save and Continue to Preview'}
        />
    );
}