import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
  productId: null,
  productName: "",
  price: "",
  stock: "",
  description: "",
  gstRate: 18,
  attributes: [],
  collections: [],
  productTags: [],
  rating: null,
  numberOfRatings: 0,
  gstInclusive: true,
  isActive: true,
  shippingRuleChoice: null,
  shippingRuleDraft: {}
};

const editProductSlice = createSlice({
  name: "editProduct",
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
    resetEditProduct: () => {
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
  extraReducers: (builder) => {
    builder.addCase(RESET_ALL, () => initialState);
  },
});

export const {
  updateField,
  addAttribute,
  updateAttribute,
  removeAttribute,
  resetEditProduct,
} = editProductSlice.actions;

export default editProductSlice.reducer;
