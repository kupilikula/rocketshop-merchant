export const orderStatusList = [
  "Order Placed", // Order has been placed by the customer
  "Payment Pending", // Payment is not yet confirmed
  "Payment Received", // Payment has been successfully processed
  "Processing", // Order is being prepared
  "Ready for Pickup", // For pickup orders, when ready at the store
  "Awaiting Shipment", // Order is packed but not shipped
  "Shipped", // Order has been dispatched
  "Out for Delivery", // Order is out for delivery
  "Delivered", // Order has been delivered
  "On Hold", // Order is temporarily on hold
  "Canceled", // Order has been canceled
  "Refund Requested", // Customer has requested a refund
  "Refund Processed", // Refund has been issued
  "Failed", // Order failed (e.g., payment or processing issue)
  "Returned", // Product has been returned by the customer
];

export const orderStatusColors = {
  "Order Placed": "#E3F2FD", // Soft Primary Blue
  "Payment Pending": "#FFBE0B", // Warning Gold
  "Payment Received": "#DFF3E2", // Soft Success Green
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

export const ActiveStatusColors = {
  Active: "#85C185",
  Inactive: "#D0D0D0",
};
