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
import {ShippingRuleSummary} from "../../../../components/ShippingRuleSummary";

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: theme.colors.surface }}>
                <ActivityIndicator animating={true} size={100} color={theme.colors.primary} />
            </View>
        );
    }

    if (mode === 'choice') {
        return (
            <ScrollView style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surface }}>

                {shippingRule &&
                <View style={{marginVertical: 16}}>
                <Text variant={'titleMedium'} style={{marginBottom: 16}}>Current Shipping Rule Summary</Text>
                    <ShippingRuleSummary shippingRule={shippingRule} />
                </View>
                }

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
                            router.push('/Main/(tabs)/EditProduct/EditPreview');
                        } else if (editChoice === 'assignExisting') {
                            router.push('/Main/(tabs)/EditProduct/SelectExistingShippingRule');
                        } else {
                            setMode('edit');
                        }
                    }}
                    style={{  borderRadius: 8 }}
                >
                    Continue
                </Button>
                </View>
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
            saveButtonLabel={'Continue'}
        />
    );
}
