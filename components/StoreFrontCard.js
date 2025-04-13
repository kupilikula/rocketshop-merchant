import {Card, Text, useTheme} from "react-native-paper";
import {Pressable, StyleSheet, View} from "react-native";
import {Image} from "expo-image";
import React from "react";


export const StoreFrontCard = ({storeLogoImage, storeName, storeDescription}) => {

    const theme = useTheme();

    return (<Card
        style={{
            // flex: 1,
            height: "auto",
            // paddingVertical: 16,
            padding: 16,
            backgroundColor: theme.colors.white,
        }}
    >
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            // margin: 16,
            width: '100%',
            alignSelf: 'stretch',
            backgroundColor: 'white'
        }}>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: 'center',
                    alignSelf: 'stretch',
                    // width: "100%",
                    height: "auto",
                    // backgroundColor: 'green'
                }}
            >
                <Image
                    source={storeLogoImage}
                    style={{
                        height: 80,
                        width: 80,
                        borderRadius: 40,
                        borderStyle: "solid",
                        borderWidth: 2,
                        borderColor: 'black',
                        margin: 0,
                        padding: 0,
                    }}
                />
                <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    marginLeft: 8,
                    flex: 1
                }}>
                    <Text
                        // variant={"displaySmall"}
                        style={{color: 'black', fontSize: 20}}
                        // adjustsFontSizeToFit={true}
                        numberOfLines={2}
                    >
                        {storeName}
                    </Text>
                    <View>
                        <Text variant={"titleMedium"} style={{color: 'black'}}>
                            {"0 Products " +  "1 Collection"}
                        </Text>
                    </View>
                    <View>
                        <Pressable onPress={() => router.push('./FollowersList')}>
                            <Text variant={"titleMedium"} style={{ color: 'black' }}>
                                0 Followers
                            </Text>
                        </Pressable>
                    </View>
                </View>

            </View>
            <View style={{ width:'100%', marginTop: 10}}>
                <Text variant={"bodyLarge"} style={{color: 'black'}}>
                    {storeDescription}
                </Text>
            </View>
        </View>
    </Card>)
}
