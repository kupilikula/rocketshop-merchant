import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Divider, Surface } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit'; // Use any chart library of choice
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
    const navigation = useNavigation();

    const handleNavigateOrders = (filter) => {
        navigation.navigate('Orders', { filter });
    };

    const data = {
        labels: ['Day', 'Week', 'Month'],
        datasets: [
            {
                data: [5000, 15000, 45000], // Example data for sales/revenue
            },
        ],
    };

    return (
        <Surface style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Summary of Open Orders */}
                <Card style={styles.card}>
                    <Card.Title title="Open Orders" />
                    <Card.Content>
                        <Text variant="headlineLarge">24</Text>
                        <Text>Orders Pending</Text>
                        <Button mode="text" onPress={() => handleNavigateOrders('openOrders')}>
                            View Open Orders
                        </Button>
                    </Card.Content>
                </Card>

                {/* New Orders Summary */}
                <Card style={styles.card}>
                    <Card.Title title="New Orders" />
                    <Card.Content>
                        <View style={styles.row}>
                            <Text variant="bodyLarge">Last Day: 8</Text>
                            <Text variant="bodyLarge">Last Week: 36</Text>
                            <Text variant="bodyLarge">Last Month: 120</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Sales and Revenue */}
                <Card style={styles.card}>
                    <Card.Title title="Sales & Revenue" />
                    <Card.Content>
                        <BarChart
                            data={data}
                            width={300} // Adjust for your layout
                            height={220}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                            }}
                            style={styles.chart}
                        />
                    </Card.Content>
                </Card>

                {/* Top Customers */}
                <Card style={styles.card}>
                    <Card.Title title="Top Customers" />
                    <Card.Content>
                        <Text>1. John Doe - ₹15,000</Text>
                        <Text>2. Jane Smith - ₹12,000</Text>
                        <Text>3. Alice Johnson - ₹10,500</Text>
                    </Card.Content>
                </Card>

                {/* Top Products */}
                <Card style={styles.card}>
                    <Card.Title title="Top Products" />
                    <Card.Content>
                        <Text>1. Product A - ₹20,000</Text>
                        <Text>2. Product B - ₹15,500</Text>
                        <Text>3. Product C - ₹12,000</Text>
                    </Card.Content>
                </Card>

                {/* Useful Links */}
                <Card style={styles.card}>
                    <Card.Title title="Quick Links" />
                    <Card.Content>
                        <Button mode="contained" onPress={() => handleNavigateOrders('openOrders')}>
                            View Open Orders
                        </Button>
                        <Button mode="contained" style={styles.linkButton} onPress={() => navigation.navigate('LowStock')}>
                            View Low Stock Products
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    card: {
        marginBottom: 10,
        padding: 10,
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
    linkButton: {
        marginTop: 10,
    },
});

export default Dashboard;
