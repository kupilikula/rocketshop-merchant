import {LinearGradient} from "expo-linear-gradient";
import {Text, useTheme} from "react-native-paper";
import {View} from "react-native";
import {offerConditionsText, offerTypeLabelMap} from "../utils/offerTypeLabelMap";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";


const randomFloat = (min, max) => (Math.random()*(max - min) + min);
const randomStart = () => {return {x: randomFloat(0, 0.4), y: randomFloat(0,1)}}
const randomEnd = () => {return {x: randomFloat(0.6, 1), y: randomFloat(0,1)}};

const OfferBar = ({offer, styles, showDisplayText = true, showCheckmark=false, fullWidth=true, applyCount=null}) => {

    const theme = useTheme();
    const start = randomStart();
    const end = randomEnd();
    let conditionsText = offerConditionsText(offer);

    return <View style={[styles]}>
        <LinearGradient start={start} end={end} colors={[theme.colors.primary, theme.colors.secondary]} style={{position: 'relative', paddingHorizontal: 8, paddingVertical: 8, borderRadius: 0, alignSelf: fullWidth ? 'stretch' : 'flex-start'}}>
            <View style={{display: 'flex', flexDirection: 'column'}}>
                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={{color: 'white'}} variant={'titleMedium'}>{offerTypeLabelMap(offer)}</Text>
                        {/*{showCheckmark &&*/}
                        {/*<MaterialIcons name={'check'} color={'white'} size={24} style={{marginHorizontal: 8}}/>*/}
                        {/*}*/}
                    </View>
                    {showDisplayText && <Text style={{color: 'white', marginRight: 16}} variant={'titleMedium'}>{offer.offerDisplayText}</Text>}
                </View>
                {conditionsText.trim() && <Text variant={"bodyMedium"} style={{color:'white'}}>{conditionsText}</Text>}
            </View>
            {applyCount &&
                <Text variant={'titleMedium'} style={{color: 'white', position: 'absolute', bottom: 0, right: 5}}>{'×' + applyCount}</Text>}
        </LinearGradient>
    </View>
}

export default OfferBar;