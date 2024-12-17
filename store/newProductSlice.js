import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    productName: "",
    price: "",
    description: "",
    stock: "",
    gstRate: 18,
    attributes: [],
    collections: [],
    tags: [],
    mediaItems: []

};

const newProductSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        updateField: (state, action) => {
            const { field, value } = action.payload;

            if (field === "all") {
                // Replace the entire state with the provided value
                return { ...state, ...value };
            }

            // Update a specific field
            state[field] = value;
        },
        addAttribute: (state) => {
            state.attributes.push({ key: "", value: "" });
        },
        updateAttribute: (state, action) => {
            const { index, field, value } = action.payload;
            state.attributes[index][field] = value;
        },
        removeAttribute: (state, action) => {
            const index = action.payload;
            state.attributes.splice(index, 1);
        },
    },
});

export const {
    updateField,
    addAttribute,
    updateAttribute,
    removeAttribute,
} = newProductSlice.actions;

export default newProductSlice.reducer;
