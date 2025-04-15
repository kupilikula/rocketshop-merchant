import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productId: null,
  productName: "",
  price: "",
  description: "",
  stock: "",
  gstRate: 18,
  attributes: [],
  collections: [],
  productTags: [],
  mediaItems: [],
  rating: null,
  numberOfRatings: 0,
  enableStockTracking: true,
  gstInclusive: true,
  isActive: true,
};

const newProductSlice = createSlice({
  name: "newProduct",
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
    resetNewProduct: () => {
      console.log("resetting: ", { ...initialState });
      return { ...initialState };
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
  resetNewProduct,
} = newProductSlice.actions;

export default newProductSlice.reducer;
