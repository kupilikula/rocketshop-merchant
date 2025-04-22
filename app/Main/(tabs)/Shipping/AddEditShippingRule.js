import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Text,
    Button,
    TextInput,
    SegmentedButtons,
    Card,
    IconButton,
    Switch,
    useTheme,
    Menu,
    Divider,
    HelperText,
    List, Portal, Dialog,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { validateShippingFormula } from '../../../../utils/validateShippingFormula';
import { useAddShippingRule } from '../../../../api/hooks/useAddShippingRule';
import { useEditShippingRule } from '../../../../api/hooks/useEditShippingRule';
import { useGetShippingRule } from '../../../../api/hooks/useGetShippingRule';
import {useSelector} from "react-redux";
import {useDeleteShippingRule} from "../../../../api/hooks/useDeleteShippingRule";
import ApplicableToSection from "../../../../components/ApplicableToSection";


const LOCATION_TYPES = {
    CITY: 'city',
    STATE: 'state',
    COUNTRY: 'country'
};


const OPERATORS = {
    EQUALS: '=',
    GREATER_THAN: '>',
    LESS_THAN: '<',
    GREATER_THAN_EQUALS: '>=',
    LESS_THAN_EQUALS: '<=',
    IN_RANGE: 'range'
};

const VARIABLES = {
    ITEM_COUNT: 'itemCount',
    ORDER_TOTAL: 'orderTotal',
    BASE_COST: 'baseCost'
};

const schema = yup.object({
    ruleName: yup.string().required('Rule name is required'),
    baseCost: yup.number()
        .typeError('Base shipping cost must be a number')
        .min(0, 'Base shipping cost must be non-negative')
        .required('Base shipping cost is required'),
    formula: yup.string()
        .required('Shipping cost formula is required')
        .test('valid-formula', 'Invalid shipping formula', (value) => {
            if (!value) return false;
            const result = validateShippingFormula(value);
            console.log('yup result:', result);
            return result.isValid;
        })
});

const AddEditShippingRule = () => {
    const { ruleId } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const {storeId} = useSelector((state) => state.store);
    const isEditing = !!ruleId;
    const addShippingRule = useAddShippingRule();
    const editShippingRule = useEditShippingRule();
    const {
        data: existingRule,
        isLoading: isLoadingRule,
        error: ruleError
    } = useGetShippingRule(storeId, ruleId);
    const deleteShippingRule = useDeleteShippingRule();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [applicableTo, setApplicableTo] = useState({
        storeWide: true,
        productIds: [],
        collectionIds: [],
        productTags: [],
    });

    const [conditions, setConditions] = useState([]);
    const [showFormulaHelp, setShowFormulaHelp] = useState(false);
    const { control, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            ruleName: 'Rule Name',
            baseCost: 0,
            formula: 'baseCost',
            isActive: true,
        }
    });
    const formRuleName = watch('ruleName');

    const handleDelete = async () => {
        try {
            await deleteShippingRule.mutateAsync({
                storeId,
                ruleId,
            });
            setShowDeleteDialog(false);
            router.back();
        } catch (error) {
            console.error('Failed to delete shipping rule:', error);
            // You might want to show an error snackbar here
        }
    };



    useEffect(() => {
        if (isEditing && existingRule) {
            reset({
                ruleName: existingRule.ruleName,
                baseCost: existingRule.baseCost,
                formula: existingRule.formula,
            });
            setConditions(existingRule.conditions || []);
            setApplicableTo(existingRule.applicableTo || {storeWide: true});
        }
    }, [isEditing, existingRule, reset]);

    const onSubmit = async (data) => {
        console.log('onSubmit')
        const ruleData = {
            ...data,
            conditions,
            applicableTo
        };

        try {
            if (isEditing) {
                await editShippingRule.mutateAsync({
                    storeId,
                    ruleId,
                    data: ruleData,
                });
            } else {
                console.log('adding rule');
                await addShippingRule.mutateAsync({
                    storeId,
                    data: ruleData,
                });
            }
            router.back();
        } catch (error) {
            console.error('Failed to save shipping rule:', error);
            // You might want to show an error alert here
        }
    };


    const addCondition = () => {
        setConditions([
            ...conditions,
            {
                type: 'location',
                locationType: LOCATION_TYPES.STATE,
                operator: 'inside',
                state: '',
                city: '',
                country: ''
            }
        ]);
    };


    const removeCondition = (index) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const updateCondition = (index, updates) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], ...updates };
        setConditions(newConditions);
    };

    const renderLocationCondition = (condition, index) => (
        <View>
            <SegmentedButtons
                value={condition.locationType}
                onValueChange={(value) => updateCondition(index, { locationType: value })}
                buttons={[
                    { value: LOCATION_TYPES.CITY, label: 'City' },
                    { value: LOCATION_TYPES.STATE, label: 'State' },
                    { value: LOCATION_TYPES.COUNTRY, label: 'Country' },
                ]}
            />
            <View style={styles.locationInputs}>
                {condition.locationType === LOCATION_TYPES.CITY && (
                    <>
                        <TextInput
                            label="City Name"
                            value={condition.city}
                            mode={'outlined'}
                            onChangeText={(value) => updateCondition(index, { city: value })}
                            style={styles.input}
                        />
                        <TextInput
                            label="State"
                            value={condition.state}
                            mode={'outlined'}
                            onChangeText={(value) => updateCondition(index, { state: value })}
                            style={styles.input}
                        />
                    </>
                )}
                {condition.locationType === LOCATION_TYPES.STATE && (
                    <TextInput
                        label="State Name"
                        value={condition.state}
                        mode={'outlined'}
                        onChangeText={(value) => updateCondition(index, { state: value })}
                        style={styles.input}
                    />
                )}
                {condition.locationType === LOCATION_TYPES.COUNTRY && (
                    <TextInput
                        label="Country Name"
                        value={condition.country}
                        mode={'outlined'}
                        onChangeText={(value) => updateCondition(index, { country: value })}
                        style={styles.input}
                    />
                )}
                <SegmentedButtons
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, { operator: value })}
                    buttons={[
                        { value: 'inside', label: 'Inside' },
                        { value: 'outside', label: 'Outside' },
                    ]}
                    style={styles.locationOperator}
                />
            </View>
        </View>
    );


    const renderOrderTotalCondition = (condition, index) => (
        <View>
            <SegmentedButtons
                value={condition.operator}
                onValueChange={(value) => updateCondition(index, { operator: value })}
                buttons={[
                    { value: OPERATORS.GREATER_THAN_EQUALS, label: '>=' },
                    { value: OPERATORS.LESS_THAN_EQUALS, label: '<=' },
                    { value: OPERATORS.IN_RANGE, label: 'Range' },
                ]}
            />
            {condition.operator === OPERATORS.IN_RANGE ? (
                <View style={styles.rangeContainer}>
                    <TextInput
                        label="Min Amount"
                        value={condition.minValue}
                        mode={'outlined'}
                        onChangeText={(value) => updateCondition(index, { minValue: value })}
                        inputMode={"numeric"}
                        style={[styles.input, styles.rangeInput]}
                    />
                    <TextInput
                        label="Max Amount"
                        value={condition.maxValue}
                        mode={'outlined'}
                        onChangeText={(value) => updateCondition(index, { maxValue: value })}
                        inputMode={"numeric"}
                        style={[styles.input, styles.rangeInput]}
                    />
                </View>
            ) : (
                <TextInput
                    label="Amount"
                    value={condition.value}
                    mode={'outlined'}
                    onChangeText={(value) => updateCondition(index, { value })}
                    inputMode={"numeric"}
                    style={styles.input}
                />
            )}
        </View>
    );

    const renderItemCountCondition = (condition, index) => (
        <View>
            <SegmentedButtons
                value={condition.operator}
                onValueChange={(value) => updateCondition(index, { operator: value })}
                buttons={[
                    { value: OPERATORS.GREATER_THAN_EQUALS, label: '>=' },
                    { value: OPERATORS.LESS_THAN_EQUALS, label: '<=' },
                    { value: OPERATORS.EQUALS, label: '=' },
                ]}
            />
            <TextInput
                label="Item Count"
                value={condition.value}
                mode={'outlined'}
                onChangeText={(value) => updateCondition(index, { value })}
                inputMode={"numeric"}
                style={styles.input}
            />
        </View>
    );

    const renderCondition = (condition, index) => (
        <Card key={index} style={styles.conditionCard}>
            <Card.Content>
                <View style={styles.conditionHeader}>
                    <Text variant="titleMedium">Condition {index + 1}</Text>
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={() => removeCondition(index)}
                    />
                </View>
                <SegmentedButtons
                    value={condition.type}
                    onValueChange={(value) => updateCondition(index, { type: value })}
                    buttons={[
                        { value: 'location', label: 'Location' },
                        { value: 'orderTotal', label: 'Order Total' },
                        { value: 'itemCount', label: 'Item Count' },
                    ]}
                />
                <View style={styles.conditionContent}>
                    {condition.type === 'location' && renderLocationCondition(condition, index)}
                    {condition.type === 'orderTotal' && renderOrderTotalCondition(condition, index)}
                    {condition.type === 'itemCount' && renderItemCountCondition(condition, index)}
                </View>
            </Card.Content>
        </Card>
    );

    return (<>
        <ScrollView style={styles.container}>
            <Controller
                control={control}
                name="ruleName"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        label="Rule Name"
                        mode={'outlined'}
                        value={value}
                        onChangeText={onChange}
                        error={!!errors.ruleName}
                        style={styles.input}
                    />
                )}
            />
            {errors.ruleName && (
                <HelperText type="error">{errors.ruleName.message}</HelperText>
            )}

            <Controller
                control={control}
                name="baseCost"
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        label="Base Shipping Cost"
                        value={value}
                        onChangeText={onChange}
                        inputMode={'numeric'}
                        mode={'outlined'}
                        error={!!errors.baseCost}
                        style={styles.input}
                        left={<TextInput.Affix text="₹" />}
                    />
                )}
            />
            {errors.baseCost && (
                <HelperText type="error">{errors.baseCost.message}</HelperText>
            )}

            <Controller
                control={control}
                name="formula"
                render={({ field: { onChange, value } }) => (
                    <View>
                        <TextInput
                            label="Shipping Cost Formula"
                            value={value}
                            onChangeText={onChange}
                            error={!!errors.formula}
                            style={styles.input}
                            multiline
                            numberOfLines={3}
                            mode={'outlined'}
                            right={
                                <TextInput.Icon
                                    icon="help-circle"
                                    onPress={() => setShowFormulaHelp(!showFormulaHelp)}
                                />
                            }
                        />
                        {errors.formula && (
                            <HelperText type="error">
                                {errors.formula.message}
                            </HelperText>
                        )}
                        {showFormulaHelp && (
                            <Card style={styles.helpCard}>
                                <Card.Content>
                                    <Text variant="titleSmall">Available Variables:</Text>
                                    <List.Item
                                        title="baseCost"
                                        description="Base shipping cost value"
                                    />
                                    <List.Item
                                        title="itemCount"
                                        description="Number of items in cart"
                                    />
                                    <List.Item
                                        title="orderTotal"
                                        description="Total order amount"
                                    />
                                    <Divider style={styles.divider} />
                                    <Text>Valid operators: +, -, *, /</Text>
                                    <Text>Valid functions: Max(), Min(), Floor(), Ceil()</Text>
                                    <Text variant="titleSmall">Example Formulas:</Text>
                                    <Text>baseCost + 20 * Max(0, itemCount - 3)</Text>
                                    <Text>baseCost * (orderTotal > 1000 ? 0.9 : 1)</Text>
                                </Card.Content>
                            </Card>
                        )}
                    </View>
                )}
            />

            <Controller
                control={control}
                name="isActive"
                render={({ field: { onChange, value } }) => (
                    <View style={styles.switchContainer}>
                        <Text style={{marginRight: 10}} variant={'bodyLarge'}>{value ? 'Active' : 'Inactive'}</Text>
                        <Switch
                            value={value}
                            onValueChange={onChange}
                            color={theme.colors.success}
                        />
                    </View>
                )}
            />

            <View style={styles.conditionsSection}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Conditions
                </Text>
                {conditions.map(renderCondition)}
                <View style={{alignSelf: 'center'}}>
                <Button
                    mode="contained"
                    icon={'plus'}
                    onPress={addCondition}
                    style={styles.addConditionButton}
                >
                    Add Condition
                </Button>
                </View>
            </View>

            <ApplicableToSection
                applicableTo={applicableTo}
                onUpdate={setApplicableTo}
                ruleName={formRuleName}
            />


            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={styles.cancelButton}
                >
                    Cancel
                </Button>
                <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    style={styles.submitButton}
                >
                    {isEditing ? 'Update Rule' : 'Create Rule'}
                </Button>
            </View>
            {isEditing && (
                <Button
                    mode="outlined"
                    onPress={() => setShowDeleteDialog(true)}
                    style={styles.deleteButton}
                    textColor={theme.colors.error}
                >
                    Delete Rule
                </Button>
            )}
        </ScrollView>
            <Portal>
                <Dialog
                    visible={showDeleteDialog}
                    onDismiss={() => setShowDeleteDialog(false)}
                >
                    <Dialog.Title>Delete Shipping Rule</Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Are you sure you want to delete this shipping rule? This action cannot be undone.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            textColor={theme.colors.error}
                            onPress={handleDelete}
                            loading={deleteShippingRule.isLoading}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
}

const makeStyles =  (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.surface,
    },
    title: {
        marginBottom: 24,
    },
    input: {
        marginVertical: 12,
        backgroundColor: 'white'
    },
    conditionsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    conditionCard: {
        marginBottom: 16,
        backgroundColor: 'white'
    },
    conditionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    conditionContent: {
        marginTop: 12,
    },
    addConditionButton: {
        // marginTop: 8,
        borderRadius: 8,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
        marginBottom: 32,
    },
    submitButton: {
        marginBottom: 12,
    },
    cancelButton: {
        marginBottom: 12,
    },
    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rangeInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    helpCard: {
        marginVertical: 16,
        backgroundColor: 'white'
    },
    divider: {
        marginVertical: 8,
    },
    locationInputs: {
        marginTop: 12,
    },
    locationOperator: {
        marginTop: 8,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    deleteButton: {
        marginHorizontal: 16,
        borderColor: theme.colors.error,
    },

});

export default AddEditShippingRule;