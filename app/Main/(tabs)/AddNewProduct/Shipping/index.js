import React, {useContext} from 'react';
import {ScrollView, View} from "react-native";
import {Button, Card, IconButton, RadioButton, Text, useTheme} from "react-native-paper";
import {useState} from "react";
import {router, useRouter} from "expo-router";
import {ProductWorkflowContext} from "../../../../../components/ProductWorkflowContext";
import {useDispatch, useSelector} from "react-redux";
import {setShippingRuleChoice} from "../../../../../store/shippingRuleSlice";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


export default function Shipping () {

    const router = useRouter();
    const dispatch = useDispatch();
    const theme = useTheme();
    const {shippingRuleChoice} = useSelector((state) => state.shippingRule);
    const [localShippingRuleChoice, setLocalShippingRuleChoice] = useState(shippingRuleChoice);

    const handleShippingRuleChoiceConfirm = () => {
        if (!localShippingRuleChoice) return;
        setLocalShippingRuleChoice(localShippingRuleChoice);
        dispatch(setShippingRuleChoice(localShippingRuleChoice));

        if (localShippingRuleChoice === 'useExisting') {
            router.push('/Main/(tabs)/AddNewProduct/Shipping/SelectExistingShippingRule');
        }
        else if (localShippingRuleChoice === 'cloneExisting') {
            router.push('/Main/(tabs)/AddNewProduct/Shipping/CloneExistingShippingRule');
        }
        else if (localShippingRuleChoice === 'createNew') {
            router.push('/Main/(tabs)/AddNewProduct/Shipping/CreateNewShippingRule');
        }
        else if (localShippingRuleChoice === 'noShipping') {
            router.push('/Main/(tabs)/AddNewProduct/Preview');
        }
    }

    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
            <Card
                mode={'elevated'}
                style={{ backgroundColor: 'white', marginBottom: 16, borderRadius: 0, borderWidth: 1, borderColor: localShippingRuleChoice === 'useExisting' ? theme.colors.primary : 'white' }}
                onPress={() => setLocalShippingRuleChoice('useExisting')}
            >
                <Card.Title
                    title="Use an Existing Shipping Rule"
                    subtitle="Assign a shared shipping rule."
                    left={(props) => <MaterialIcons name="check-box" size={32} />}
                    right={(props) => <RadioButton.Android {...props} value="useExisting" status={localShippingRuleChoice === 'useExisting' ? 'checked' : 'unchecked'} />}
                />
            </Card>

            <Card
                mode={'elevated'}
                style={{ backgroundColor: 'white', marginBottom: 16, borderRadius: 0, borderWidth: 1, borderColor: localShippingRuleChoice === 'cloneExisting' ? theme.colors.primary : 'white' }}
                onPress={() => setLocalShippingRuleChoice('cloneExisting')}
            >
                <Card.Title
                    title="Copy and Edit an Existing Rule"
                    subtitle="Customize an existing rule"
                    left={(props) => <MaterialIcons size={32} name="content-copy" />}
                    right={(props) => <RadioButton.Android {...props} value="cloneExisting" status={localShippingRuleChoice === 'cloneExisting' ? 'checked' : 'unchecked'} />}
                />
            </Card>

            <Card
                mode={'elevated'}
                style={{ backgroundColor: 'white', marginBottom: 16, borderRadius: 0, borderWidth: 1, borderColor: localShippingRuleChoice === 'createNew' ? theme.colors.primary : 'white' }}
                onPress={() => setLocalShippingRuleChoice('createNew')}
            >
                <Card.Title
                    title="Create a New Shipping Rule"
                    subtitle="Create new rule for this product"
                    left={(props) => <MaterialIcons name="add" size={32}/>}
                    right={(props) => <RadioButton.Android {...props} value="createNew" status={localShippingRuleChoice === 'createNew' ? 'checked' : 'unchecked'} />}
                />
            </Card>

            <Card
                mode={'elevated'}
                style={{ backgroundColor: 'white', marginBottom: 16, borderRadius: 0, borderWidth: 1, borderColor: localShippingRuleChoice === 'noShipping' ? theme.colors.primary : 'white' }}
                onPress={() => setLocalShippingRuleChoice('noShipping')}
            >
                <Card.Title
                    title="No Shipping Required"
                    subtitle="No shipping cost needed"
                    left={(props) => <MaterialIcons name="block" size={32} />}
                    right={(props) => <RadioButton.Android {...props} value="noShipping" status={localShippingRuleChoice === 'noShipping' ? 'checked' : 'unchecked'} />}
                />
            </Card>

            {/* Below the Cards */}

            {/*{localShippingRuleChoice === 'useExisting' && (*/}
            {/*    <ExistingGroupRulesSelector />*/}
            {/*)}*/}

            {/*{localShippingRuleChoice === 'cloneExisting' && (*/}
            {/*    <CloneExistingRulesSelector />*/}
            {/*)}*/}

            {/* No extra input needed for createNew, just go to CreateRule screen */}

            <View style={{alignSelf: 'center'}}>
            <Button
                mode="contained"
                style={{ marginTop: 16, borderRadius: 8 }}
                disabled={!localShippingRuleChoice}
                onPress={handleShippingRuleChoiceConfirm}
            >
                Continue
            </Button>
            </View>
        </ScrollView>
    );
}