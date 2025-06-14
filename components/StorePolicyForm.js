// StorePolicyForm.js  (mobile-aware wrapper added)
//
// • On web: behaves exactly as before (simple ScrollView).
// • On mobile (iOS / Android): wrapped in your <KeyboardAwareScrollableScreen>
//   so fields don’t hide behind the keyboard.
//
// Assumes you already have `KeyboardAwareScrollableScreen` in the project
// (the same helper you’re using in the Rate-and-Review modal).

import React from 'react';
import {
    ScrollView,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import {
    TextInput,
    Switch,
    Button,
    HelperText,
    Text,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import KeyboardAwareScrollableScreen from './KeyboardAwareScrollableScreen'; // adjust path if different

/* ------------ constants ------------ */
const IS_WEB = Platform.OS === 'web';

const defaultVals = {
    handlingTimeDays: 2,
    cancellationWindowHours: 12,
    returnsAccepted: true,
    returnWindowDays: 7,
    refundProcessingTimeDays: 5,
};

/* ------------ component ------------ */
export default function StorePolicyForm({
                                            defaultValues = defaultVals,
                                            onSubmit,
                                        }) {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues, mode: 'onBlur' });

    const returnsAccepted = watch('returnsAccepted');

    const numRules = (min, max) => ({
        required: 'This field is required.',
        validate: v =>
            String(v).trim() === '' || isNaN(v)
                ? 'Enter a number.'
                : v < min || v > max
                    ? `Enter a value between ${min} and ${max}.`
                    : true,
    });

    /* ---------- form body (shared) ---------- */
    const FormFields = () => (
        <>
            {/* Handling time */}
            <Controller
                control={control}
                name="handlingTimeDays"
                rules={numRules(0, 30)}
                render={({ field: { onChange, value } }) => (
                    <View style={styles.field}>
                        <Text variant="titleMedium" style={styles.label}>
                            Handling Time Before Dispatch
                        </Text>
                        <TextInput
                            mode="outlined"
                            label="Days"
                            value={String(value)}
                            inputMode="numeric"
                            onChangeText={txt =>
                                onChange(Number(txt.replace(/[^0-9]/g, '')))
                            }
                        />
                        <HelperText type="error" visible={!!errors.handlingTimeDays}>
                            {errors.handlingTimeDays?.message}
                        </HelperText>
                    </View>
                )}
            />

            {/* Cancellation window */}
            <Controller
                control={control}
                name="cancellationWindowHours"
                rules={numRules(0, 168)}
                render={({ field: { onChange, value } }) => (
                    <View style={styles.field}>
                        <Text variant="titleMedium" style={styles.label}>
                            Order Cancellation Window
                        </Text>
                        <TextInput
                            mode="outlined"
                            label="Hours"
                            value={String(value)}
                            inputMode="numeric"
                            onChangeText={txt =>
                                onChange(Number(txt.replace(/[^0-9]/g, '')))
                            }
                        />
                        <HelperText
                            type="error"
                            visible={!!errors.cancellationWindowHours}
                        >
                            {errors.cancellationWindowHours?.message}
                        </HelperText>
                    </View>
                )}
            />

            {/* Returns accepted */}
            <Controller
                control={control}
                name="returnsAccepted"
                render={({ field: { onChange, value } }) => (
                    <View style={[styles.field, styles.row]}>
                        <Text variant="titleMedium" style={styles.labelRow}>
                            Accept Returns?
                        </Text>
                        <Switch value={value} onValueChange={onChange} />
                    </View>
                )}
            />

            {/* Return window */}
            {returnsAccepted && (
                <Controller
                    control={control}
                    name="returnWindowDays"
                    rules={numRules(0, 60)}
                    render={({ field: { onChange, value } }) => (
                        <View style={styles.field}>
                            <Text variant="titleMedium" style={styles.label}>
                                Return Window
                            </Text>
                            <TextInput
                                mode="outlined"
                                label="Days"
                                value={String(value)}
                                inputMode="numeric"
                                onChangeText={txt =>
                                    onChange(Number(txt.replace(/[^0-9]/g, '')))
                                }
                            />
                            <HelperText type="error" visible={!!errors.returnWindowDays}>
                                {errors.returnWindowDays?.message}
                            </HelperText>
                        </View>
                    )}
                />
            )}

            {/* Refund processing */}
            <Controller
                control={control}
                name="refundProcessingTimeDays"
                rules={numRules(1, 30)}
                render={({ field: { onChange, value } }) => (
                    <View style={styles.field}>
                        <Text variant="titleMedium" style={styles.label}>
                            Refund Processing Time
                        </Text>
                        <TextInput
                            mode="outlined"
                            label="Days"
                            value={String(value)}
                            inputMode="numeric"
                            onChangeText={txt =>
                                onChange(Number(txt.replace(/[^0-9]/g, '')))
                            }
                        />
                        <HelperText
                            type="error"
                            visible={!!errors.refundProcessingTimeDays}
                        >
                            {errors.refundProcessingTimeDays?.message}
                        </HelperText>
                    </View>
                )}
            />

            {/* Submit */}
            <Button
                mode="contained"
                style={styles.button}
                loading={isSubmitting}
                onPress={handleSubmit(onSubmit)}
            >
                Save Policy
            </Button>
        </>
    );

    /* ---------- wrapper selection ---------- */
    if (IS_WEB) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <FormFields />
            </ScrollView>
        );
    }

    // Mobile (iOS / Android) → use KeyboardAwareScrollableScreen
    return (
        <KeyboardAwareScrollableScreen
            backgroundColor="#fff"
            extraScrollHeight={20}
            enableOnAndroid
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
        >
            <FormFields />
        </KeyboardAwareScrollableScreen>
    );
}

/* ------------ styles ------------ */
const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 60,
        width: '100%',
        maxWidth: IS_WEB ? 700 : undefined,
        alignSelf: 'center' },
    field: { marginBottom: 12 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: { marginVertical: 8 },
    labelRow: { marginVertical: 8, flex: 1 },
    button: { marginTop: 12 },
});