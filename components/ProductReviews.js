import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import {Text, Chip, Checkbox, Button, useTheme} from "react-native-paper";
import { useInfiniteProductReviews } from "../api/hooks/useInfiniteProductReviews";
import {useSelector} from "react-redux";

export function ProductReviewsList({ productId }) {
    const [sort, setSort] = useState("latest");
    const [ratingFilter, setRatingFilter] = useState(undefined);
    const [hasTextOnly, setHasTextOnly] = useState(false);
    const {storeId} = useSelector((state) => state.store);
    const theme = useTheme();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteProductReviews(storeId, productId, {
        sort,
        rating: ratingFilter,
        hasTextOnly,
        limit: 10,
    });

    const allReviews = data?.pages.flatMap((page) => page.reviews) ?? [];
    const totalReviewCount = data?.pages[0]?.pagination?.totalCount ?? 0;
    const filteredReviewCount = data?.pages[0]?.pagination?.filteredCount ?? 0;
    console.log('totalReviewCount:',totalReviewCount);
    const sortOptions = ["latest", "oldest", "highest", "lowest"];
    const ratingOptions = [1, 2, 3, 4, 5];
    console.log('allReviews:',allReviews);

    return ( totalReviewCount > 0 &&
        <View style={{ padding: 4 }}>
            <Text variant={"titleLarge"} style={{ marginTop: 16 }}>
                Reviews
            </Text>

            {/* Filters */}
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Sort By</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
                {sortOptions.map((option) => (
                    <Chip
                        key={option}
                        style={{
                            margin: 2, backgroundColor: theme.colors.softPrimary, borderColor: "black",
                        }}
                        textStyle={{
                            color: sort===option ? "black" : theme.colors.primary,
                        }}
                        selectedColor={theme.colors.black}

                        selected={sort === option}
                        onPress={() => setSort(option)}
                    >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Chip>
                ))}
            </View>

            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Filter by Rating</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
                {ratingOptions.map((r) => (
                    <Chip
                        key={r}
                        selected={ratingFilter === r}
                        onPress={() => setRatingFilter(ratingFilter === r ? undefined : r)}
                        style={{
                            margin: 2, backgroundColor: theme.colors.softPrimary, borderColor: "black",
                        }}
                        textStyle={{
                            color: ratingFilter===r ? "black" : theme.colors.primary,
                        }}
                        selectedColor={theme.colors.black}

                    >
                        {r}★
                    </Chip>
                ))}
            </View>

            <Checkbox.Item
                mode={'android'}
                label="Only reviews with text"
                status={hasTextOnly ? "checked" : "unchecked"}
                onPress={() => setHasTextOnly(!hasTextOnly)}
            />

            {/* Review list or messages */}
            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : allReviews.length > 0 ? (
                allReviews.map((item, index) => (
                    <View
                        key={index}
                        style={{ paddingVertical: 12, borderBottomWidth: 0.5, borderColor: "#ccc" }}
                    >
                        <Text style={{ fontWeight: "bold" }}>{item.customerName}</Text>
                        <Text>
                            {item.rating} <Text style={{ color: "gold" }}>★</Text>
                        </Text>
                        {item.review && <Text style={{ marginTop: 4 }}>{item.review}</Text>}
                        <Text style={{ fontSize: 12, color: "gray", marginTop: 4 }}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={{ marginTop: 20, fontStyle: "italic", color: "gray" }}>
                    {totalReviewCount === 0
                        ? "No reviews yet for this product."
                        : "No reviews match the selected filters."}
                </Text>
            )}

            {/* Load more */}
            {hasNextPage && !isLoading && (
                <Button
                    mode="outlined"
                    onPress={() => fetchNextPage()}
                    loading={isFetchingNextPage}
                    disabled={isFetchingNextPage}
                    style={{ marginTop: 16 }}
                >
                    Load more reviews
                </Button>
            )}
        </View>
    );
}