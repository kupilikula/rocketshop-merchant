const orderStatusList = [
  "Order Created",
  "Payment Initiated",
  "Payment Failed",
  "Payment Received",
  "Processing",
  "Ready for Pickup",
  "Awaiting Shipment",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "On Hold",
  "Canceled",
  "Refund Requested",
  "Refund Processed",
  "Failed",
  "Returned",
];

// === Semantic Groups ===

const PENDING_STATUSES = [
  "Order Created",
  "Payment Initiated",
];

const IN_PROGRESS_STATUSES = [
  "Payment Received",
  "Processing",
  "Ready for Pickup",
  "Awaiting Shipment",
];

const FULFILLED_STATUSES = [
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const ON_HOLD_STATUSES = [
  "On Hold",
];

const CANCELED_OR_FAILED_STATUSES = [
  "Canceled",
  "Payment Failed",
  "Failed",
];

const REFUNDED_OR_RETURNED_STATUSES = [
  "Refund Requested",
  "Refund Processed",
  "Returned",
];

// === Functions to expose ===

const getPendingOrderStatuses = () => PENDING_STATUSES;

const getInProgressOrderStatuses = () => IN_PROGRESS_STATUSES;

const getFulfilledOrderStatuses = () => FULFILLED_STATUSES;

const getOnHoldOrderStatuses = () => ON_HOLD_STATUSES;

const getCanceledOrFailedOrderStatuses = () => CANCELED_OR_FAILED_STATUSES;

const getRefundedOrReturnedOrderStatuses = () => REFUNDED_OR_RETURNED_STATUSES;

const getSalesEligibleOrderStatuses = () => [
  ...IN_PROGRESS_STATUSES,
  ...FULFILLED_STATUSES,
];

const getReviewEligibleOrderStatuses = () => [
  ...IN_PROGRESS_STATUSES,
  ...FULFILLED_STATUSES,
];


const getCompletedOrderStatuses = () => FULFILLED_STATUSES;

const orderStatusColors = {
  "Order Created": "#E3F2FD", // Soft Primary Blue
  "Payment Initiated": "#FFBE0B", // Warning Gold
  "Payment Received": "#DFF3E2", // Soft Success Green
  "Payment Failed": "#D72638", // Soft Success Green
  Processing: "#FFF9C4", // Light Yellow (neutral)
  "Ready for Pickup": "#FFD180", // Soft Orange (pickup indicator)
  "Awaiting Shipment": "#FFE0B2", // Pale Orange
  Shipped: "#C5E1A5", // Light Cyan
  "Out for Delivery": "#85C185", // Muted Green (progress indicator)
  Delivered: "#37A745", // Success Green
  "On Hold": "#FFCCBC", // Soft Coral
  Canceled: "#FAD4D8", // Soft Error Red
  "Refund Requested": "#F48FB1", // Soft Pink (request indicator)
  "Refund Processed": "#D1C4E9", // Soft Lavender (processed indicator)
  Failed: "#D72638", // Bright Red (Error color)
  Returned: "#B3E5FC", // Soft Cyan (return indicator)
};

const ActiveStatusColors = {
  Active: "#85C185",
  Inactive: "#D0D0D0",
};

module.exports = {
  orderStatusList,
  orderStatusColors,
  ActiveStatusColors,
  getPendingOrderStatuses,
  getInProgressOrderStatuses,
  getFulfilledOrderStatuses,
  getOnHoldOrderStatuses,
  getCanceledOrFailedOrderStatuses,
  getRefundedOrReturnedOrderStatuses,
  getSalesEligibleOrderStatuses,
  getReviewEligibleOrderStatuses,
  getCompletedOrderStatuses,
};
