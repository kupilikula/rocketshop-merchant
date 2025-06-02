import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "@/store/actions/resetAll";

const initialState = {
  shippingRuleChoice: null,
  newShippingRule: {
    ruleName: 'Clothing Shipping',
    groupingEnabled: true,
    is_international_shipping_enabled: false,
    isActive: true,
    conditions: []
  },
  selectedExistingShippingRuleId: null,
};

const shippingRuleSlice = createSlice({
  name: "shippingRule",
  initialState,
  reducers: {
    setShippingRuleChoice: (state, action) => {
      return {...state, shippingRuleChoice: action.payload}
    },
    setNewShippingRule: (state, action) => {
      return {...state, newShippingRule: action.payload}
    },
    setSelectedExistingShippingRuleId: (state, action) => {
      return {...state, selectedExistingShippingRuleId: action.payload}
    },
    // setClonedExistingShippingRule: (state, action) => {
    //   return {...state, clonedExistingShippingRule: action.payload}
    // },
    resetShipping: (state, action) => {
      return {...initialState}
    }
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_ALL, () => initialState);
  },
});

export const {
  setShippingRuleChoice,
    setNewShippingRule,
    setSelectedExistingShippingRuleId,
    resetShipping,
    resetAll,
} = shippingRuleSlice.actions;

export default shippingRuleSlice.reducer;
