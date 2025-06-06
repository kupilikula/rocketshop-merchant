import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Keyboard,
    ScrollView,
    TouchableWithoutFeedback
} from "react-native";
import {Button, Checkbox, TextInput, Text, useTheme} from "react-native-paper";
import { Country, State, City } from "country-state-city";

export const NewAddressForm = (props) => {
    const [newAddress, setNewAddress] = useState({
        street1: "",
        street2: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
    });
    const [isPrimary, setIsPrimary] = useState(false);
    const [errors, setErrors] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        setCountries(Country.getAllCountries());
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!newAddress.street1) newErrors.street1 = "Street Line 1 is required.";
        if (!newAddress.city) newErrors.city = "City is required.";
        if (!newAddress.state) newErrors.state = "State is required.";
        if (!newAddress.country) newErrors.country = "Country is required.";
        if (!newAddress.postalCode) {
            newErrors.postalCode = "Postal Code must be nonempty.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            props.onSaveHandler({ ...newAddress, isPrimary });
        }
    };

    const handleCountryChange = (text) => {
        setNewAddress((prev) => ({ ...prev, country: text, state: "", city: "" }));
        const filtered = countries.filter((c) =>
            c.name.toLowerCase().startsWith(text.toLowerCase())
        );
        setFilteredCountries(filtered);
        setStates([]);
        setCities([]);
    };

    const handleStateChange = (text) => {
        setNewAddress((prev) => ({ ...prev, state: text, city: "" }));
        if (newAddress.country) {
            const countryCode = countries.find((c) => c.name === newAddress.country)?.isoCode;
            const filtered = State.getStatesOfCountry(countryCode).filter((s) =>
                s.name.toLowerCase().startsWith(text.toLowerCase())
            );
            setFilteredStates(filtered);
        }
        setCities([]);
    };

    const handleCityChange = (text) => {
        setNewAddress((prev) => ({ ...prev, city: text }));
        if (newAddress.country && newAddress.state) {
            const countryCode = countries.find((c) => c.name === newAddress.country)?.isoCode;
            const stateCode = states.find((s) => s.name === newAddress.state)?.isoCode;
            const filtered = City.getCitiesOfState(countryCode, stateCode).filter((c) =>
                c.name.toLowerCase().startsWith(text.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    };

    const selectCountry = (name) => {
        setNewAddress((prev) => ({ ...prev, country: name, state: "", city: "" }));
        const countryCode = countries.find((c) => c.name === name)?.isoCode;
        setStates(State.getStatesOfCountry(countryCode));
        setFilteredCountries([]);
    };

    const selectState = (name) => {
        setNewAddress((prev) => ({ ...prev, state: name, city: "" }));
        const countryCode = countries.find((c) => c.name === newAddress.country)?.isoCode;
        const stateCode = states.find((s) => s.name === name)?.isoCode;
        setCities(City.getCitiesOfState(countryCode, stateCode));
        setFilteredStates([]);
    };

    const selectCity = (name) => {
        setNewAddress((prev) => ({ ...prev, city: name }));
        setFilteredCities([]);
    };

    useEffect(() => {
        if (props.initialValues) {
            setNewAddress({
                street1: props.initialValues.street1 || '',
                street2: props.initialValues.street2 || '',
                city: props.initialValues.city || '',
                state: props.initialValues.state || '',
                country: props.initialValues.country || '',
                postalCode: props.initialValues.postalCode || ''
            });
        }
    }, [props.initialValues]);

    return (
        <View style={styles.container}>
            {/* Street Address */}
            {["street1", "street2"].map((field, index) => (
                <View key={field} style={styles.inputContainer}>
                    <TextInput
                        label={`Street Line ${index + 1}`}
                        mode="outlined"
                        value={newAddress[field]}
                        onChangeText={(text) =>
                            setNewAddress((prev) => ({ ...prev, [field]: text }))
                        }
                        style={styles.input}
                        error={!!errors[field]}
                    />
                    {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
                </View>
            ))}

            {/* Country */}
            <View style={styles.inputContainer}>
                <TextInput
                    label="Country"
                    mode="outlined"
                    value={newAddress.country}
                    onChangeText={handleCountryChange}
                    style={styles.input}
                    error={!!errors.country}
                />
                {filteredCountries.length > 0 && (
                    <ScrollView style={styles.suggestionsContainer} keyboardDismissMode={'none'} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                        {filteredCountries.map((item) => (
                            <TouchableOpacity
                                key={item.isoCode}
                                onPress={(e) => {
                                    e.preventDefault();
                                    selectCountry(item.name)
                                }
                            }
                            >
                                <Text style={styles.suggestion}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
            </View>

            {/* State */}
            <View style={styles.inputContainer}>
                <TextInput
                    label="State"
                    mode="outlined"
                    value={newAddress.state}
                    onChangeText={handleStateChange}
                    style={styles.input}
                    error={!!errors.state}
                />
                {filteredStates.length > 0 && (
                    <ScrollView style={styles.suggestionsContainer} keyboardDismissMode={'none'} keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {filteredStates.map((item) => (
                            <TouchableOpacity
                                key={item.isoCode}
                                onPress={() => selectState(item.name)}
                            >
                                <Text style={styles.suggestion}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            {/* City */}
            <View style={styles.inputContainer}>
                <TextInput
                    label="City"
                    mode="outlined"
                    value={newAddress.city}
                    onChangeText={handleCityChange}
                    style={styles.input}
                    error={!!errors.city}
                />
                {filteredCities.length > 0 && (
                    <ScrollView style={styles.suggestionsContainer} keyboardDismissMode={'none'} keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                        {filteredCities.map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                onPress={() => selectCity(item.name)}
                            >
                                <Text style={styles.suggestion}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            {/* Postal Code */}
            <View style={styles.inputContainer}>
                <TextInput
                    label="Postal Code"
                    mode="outlined"
                    value={newAddress.postalCode}
                    onChangeText={(text) =>
                        setNewAddress((prev) => ({ ...prev, postalCode: text }))
                    }
                    style={styles.input}
                    error={!!errors.postalCode}
                />
                {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
            </View>

            {/* Default Checkbox */}
            {props.showDefaultCheckbox &&
            <View style={styles.checkboxContainer}>
                <Checkbox.Item
                    label="Set as Default Address"
                    status={isPrimary ? "checked" : "unchecked"}
                    onPress={() => setIsPrimary((prev) => !prev)}
                    mode={"android"}
                    position="leading"
                />
                {/*<Text>Set as Default Address</Text>*/}
            </View>}

            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
                <Button mode="outlined" onPress={props.discard} style={{marginHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.error }} labelStyle={{color: theme.colors.error}}>
                    Cancel
                </Button>

                <Button mode="contained" onPress={handleSave} style={{marginHorizontal: 5, borderRadius: 8}} buttonColor={theme.colors.success}>
                {props.buttonLabel}
            </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'magenta'
    },
    inputContainer: {
        marginBottom: 10,
    },
    input: {
        marginVertical: 0,
        backgroundColor: "white",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 2,
    },
    suggestionsContainer: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        zIndex: 10,
    },
    suggestion: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    saveButton: {
        marginTop: 20,
    },
});