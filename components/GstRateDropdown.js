// components/GstRateDropdown.js
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { TextInput, Menu, Button } from "react-native-paper";

const GST_RATES = [0, 5, 12, 18, 28];

export default function GstRateDropdown({ value, onChange, label = "GST (%)" , style}) {
    const inputRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 150 });

    const openMenu = () => {
        inputRef.current?.measureInWindow((x, y, width, height) => {
            setDropdownPosition({ x, y: y + 2*height, width });
            setMenuVisible(true);
        });
    };

    return (
        <View ref={inputRef} style={[{ flex: 1 }, style]}>
            <TextInput
                label={label}
                mode="outlined"
                value={value.toString() + "%"}
                editable={false}
                style={{ flex: 1 }}
                right={<TextInput.Icon icon="chevron-down" onPress={openMenu} />}
            />
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={{ x: dropdownPosition.x, y: dropdownPosition.y }}
                style={{ width: dropdownPosition.width }}
            >
                {GST_RATES.map((rate) => (
                    <Menu.Item
                        key={rate}
                        title={rate + "%"}
                        onPress={() => {
                            onChange(rate);
                            setMenuVisible(false);
                        }}
                    />
                ))}
            </Menu>
        </View>
    );
}