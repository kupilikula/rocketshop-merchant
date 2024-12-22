import React, {useState} from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {Card, Text, Button, Divider, Surface, RadioButton, useTheme} from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit'; // Use any chart library of choice
import { useNavigation } from '@react-navigation/native';
import {useRouter} from "expo-router";
import {faker} from '@faker-js/faker';
import {VictoryAxis, VictoryBar, VictoryChart, VictoryTheme} from "victory-native";
import {getCustomer, getProductForStore} from "../../../utils/fakeDataMethods";
import {ProductDisplayCompactMerchant} from "../../../components/ProductDisplayCompactMerchant";
import {CustomerListItem} from "../../../components/CustomerListItem";

const Dashboard = () => {
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const routeToOpenOrders = (filter) => {
        router.push('Orders', { filter: 'open' });
    };

    const data = {
        orders: {
            day: faker.number.int({min: 5, max: 30}),
            week: faker.helpers.multiple(() => faker.number.int({min: 8, max: 25}), {count: 7}),
            month: faker.helpers.multiple(() => faker.number.int({min: 50, max: 200}), {count: 4}),
        },
        sales: {
            day: faker.number.int({min: 1000, max: 20000}),
            week: faker.helpers.multiple(() => faker.number.int({min: 2000, max: 25000}), {count: 7}),
            month: faker.helpers.multiple(() => faker.number.int({min: 15000, max: 200000}), {count: 4}),
        },
    };

    const [ordersChartTimeWindow, setOrdersChartTimeWindow] = useState("week");
    const [salesChartTimeWindow, setSalesChartTimeWindow] = useState("week");

    function lastNDays (n) {
        var result = [];
        for (var i= n-1; i>=0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.push( d.getDate() + '/' + (d.getMonth()+1));
        }
        return result;
    }

    return (
        <Surface style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Useful Links */}
                <Text variant={'titleLarge'} style={{marginVertical: 10}}>Quick Links</Text>
                <View>

                    <View style={{display: 'flex', flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                        <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Button icon={'receipt'} mode="contained" style={{borderRadius:8, marginRight: 10}} onPress={() => handleNavigateOrders('openOrders')}>
                            Open Orders
                        </Button>
                        </View>
                        <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Button icon={'battery-20'} mode="contained" style={{borderRadius:8}} onPress={() => navigation.navigate('LowStock')}>
                            Low Stock Products
                        </Button>
                        </View>
                    </View>
                </View>

                {/* Summary of Open Orders */}
                <View style={{margin: 4}}>
                <Text variant={'titleLarge'} style={{marginVertical: 10}}>Today</Text>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <Card style={styles.card}>
                        <Text variant={'titleMedium'} style={{alignSelf: 'center'}}>Open Orders</Text>
                        <Text variant="headlineLarge" style={{alignSelf: 'center', marginVertical: 8}}>24</Text>
                        <View style={{display: 'flex', flexDirection: 'row', alignSelf: 'center', marginVertical: 8}}>
                        </View>
                </Card>
                    <Card style={styles.card}>
                        <Text variant={'titleMedium'} style={{alignSelf: 'center'}}>New Orders</Text>
                        <Text variant="headlineLarge" style={{alignSelf: 'center', marginVertical: 8}}>17</Text>
                    </Card>

                    <Card style={styles.card}>
                        <Text variant={'titleMedium'} style={{alignSelf: 'center'}}>Sales</Text>
                        <Text variant="headlineLarge" style={{alignSelf: 'center', marginVertical: 8}}>₹7854</Text>
                        <View style={{display: 'flex', flexDirection: 'row', alignSelf: 'center', marginVertical: 8}}>
                        </View>
                    </Card>
                </View>
                </View>

                <Text variant={'titleLarge'} style={{marginVertical: 10}}>Recent Trend</Text>
                {/* Sales */}
                <Card style={styles.card}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text variant={'titleLarge'}>Sales</Text>
                        <RadioButton.Group onValueChange={(newValue) => setSalesChartTimeWindow(newValue)} value={salesChartTimeWindow}>
                            <View style={styles.radioRow}>
                                <RadioButton.Item
                                    label="Week"
                                    value="week"
                                    color={theme.colors.primary}
                                    position="leading"
                                    style={styles.radioButton}
                                />
                                <RadioButton.Item
                                    label="Month"
                                    value="month"
                                    color={theme.colors.primary}
                                    position="leading"
                                    style={styles.radioButton}
                                />
                            </View>
                        </RadioButton.Group>
                    </View>
                    {/*<Card.Content>*/}
                    <View style={{justifyContent: 'center', display: 'flex', flexDirection: 'row'}}>
                        <VictoryChart
                            // domainPadding={{ x: 20 }}
                            theme={VictoryTheme.clean}
                        >
                            <VictoryAxis />
                            <VictoryAxis dependentAxis={true} style={{ axis: { display: 'none' }, ticks: { display: 'none' }, tickLabels: { display: 'none' } }} />
                            {salesChartTimeWindow==='week' && <VictoryBar
                                data={data.sales.week.map((v,i) => {
                                    let past7days = lastNDays(7);
                                    return ({x: past7days[i], y: v, label: '₹' + v })
                                })} />}
                            {salesChartTimeWindow==='month' && <VictoryBar
                                data={['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w,i) => ({x: w, y: data.sales.month[i], label: '₹' + data.sales.month[i] }))}/>}

                        </VictoryChart>
                    </View>
                </Card>

                {/* Orders*/}
                <Card style={styles.card}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text variant={'titleLarge'}>Orders</Text>
                        <RadioButton.Group onValueChange={(newValue) => setOrdersChartTimeWindow(newValue)} value={ordersChartTimeWindow}>
                            <View style={styles.radioRow}>
                                <RadioButton.Item
                                    label="Week"
                                    value="week"
                                    color={theme.colors.primary}
                                    position="leading"
                                    style={styles.radioButton}
                                />
                                <RadioButton.Item
                                    label="Month"
                                    value="month"
                                    color={theme.colors.primary}
                                    position="leading"
                                    style={styles.radioButton}
                                />
                            </View>
                        </RadioButton.Group>
                    </View>
                    {/*<Card.Content>*/}
                    <View style={{justifyContent: 'center', display: 'flex', flexDirection: 'row'}}>
                        <VictoryChart
                            // domainPadding={{ x: 20 }}
                            theme={VictoryTheme.clean}
                        >
                            <VictoryAxis />
                            <VictoryAxis dependentAxis={true} style={{ axis: { display: 'none' }, ticks: { display: 'none' }, tickLabels: { display: 'none' } }} />
                            {ordersChartTimeWindow==='week' && <VictoryBar
                                data={data.orders.week.map((v,i) => {
                                let past7days = lastNDays(7);
                                return ({x: past7days[i], y: v, label: v })
                            })} />}
                            {ordersChartTimeWindow==='month' && <VictoryBar
                                data={['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w,i) => ({x: w, y: data.orders.month[i], label: data.orders.month[i].toString() }))} />}

                        </VictoryChart>
                    </View>
                </Card>
                {/* Top Products */}
                <Text variant={'titleLarge'} style={{marginVertical: 8}}>Top Products</Text>
                {/*<Card style={styles.card}>*/}
                    {faker.helpers.multiple(getProductForStore, {count: 3}).map((p) => <View key={p.productId}><ProductDisplayCompactMerchant product={p} key={p.productId}/><Divider style={{marginVertical: 8}}/></View>)}
                {/*</Card>*/}


                {/* Top Customers */}
                <Text variant={'titleLarge'} style={{marginVertical: 8}}>Top Customers</Text>
                {faker.helpers.multiple(getCustomer, {count: 3}).map((c) => <View key={c.customerId}><CustomerListItem customer={c} key={c.customerId}/><Divider style={{marginVertical: 8}}/></View>)}
            </ScrollView>
        </Surface>
    );
};

const makeStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: theme.colors.surface,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    card: {
        flex: 0.31,
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'white'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    radioRow: {
        flexDirection: 'row', // Arrange items in a row
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    radioButton: {
        flex: 1, // Each button occupies equal space
        width: 120
    },
});

export default Dashboard;
