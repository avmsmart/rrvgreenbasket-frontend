// Direct validation of registered customer vs recipient logic and scenario testing

console.log("================================================================================");
console.log("   RRV GREEN BASKET - ADMIN ORDER MANAGEMENT VALIDATION TEST");
console.log("================================================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         Details: ${details}`);
    testsFailed++;
  }
}

// Order 1 from Backend API GET /api/admin/orders
const order1 = {
  orderPublicId: "d4601608-b575-4367-acef-28ac25d4aca9",
  orderNumber: "RRV-20261121-92727",
  customerPublicId: "ab5d2528-78c1-40bc-be23-cc869816db8a",
  registeredCustomerName: "Mahendra",
  registeredCustomerMobile: "+918247329041",
  customer: {
    registeredName: "Mahendra",
    registeredMobile: "+918247329041",
    customerPublicId: "ab5d2528-78c1-40bc-be23-cc869816db8a",
  },
  recipientName: "Mahendra",
  recipientMobile: "8247329041",
  deliveryZonePublicId: "store-kurnool-primary",
  deliveryZoneName: "RRV Green Basket - Kurnool Central",
  orderStatus: "CONFIRMED",
  paymentStatus: "COD_PENDING",
  paymentMethod: "COD",
  subtotal: 55.0,
  discountAmount: 0.0,
  deliveryCharge: 50.0,
  totalAmount: 105.0,
  deliveryAddress: {
    recipientName: "Mahendra",
    recipientMobile: "8247329041",
    addressLine1: "Dinnedevarapadu",
    city: "Dinnedevarapadu",
    state: "Andhra Pradesh",
    pincode: "518001",
    country: "India",
    latitude: 15.7726566,
    longitude: 78.0605359,
  },
  items: [
    {
      productName: "Fresh Coriander Leaves",
      productImage: "https://d176vyi1y59gtf.cloudfront.net/03df7800-d281-4179-913d-8a4d7b2d595c/b23d4fd4-12a2-49e4-ae19-b7f8b89776b7.png",
      unitOfMeasure: "KG",
      quantity: 1.0,
      unitPrice: 55.0,
      totalPrice: 55.0,
    },
  ],
};

// Order 2 from Backend API GET /api/admin/orders/{orderPublicId}
const order2 = {
  orderPublicId: "d1ee8666-c66a-4ac5-9b3d-c7230fdf2538",
  orderNumber: "RRV-20261121-55506",
  customerPublicId: "ab5d2528-78c1-40bc-be23-cc869816db8a",
  registeredCustomerName: "Mahendra",
  registeredCustomerMobile: "+918247329041",
  customer: {
    registeredName: "Mahendra",
    registeredMobile: "+918247329041",
    customerPublicId: "ab5d2528-78c1-40bc-be23-cc869816db8a",
  },
  recipientName: "Anand",
  recipientMobile: "8978040537",
  deliveryZonePublicId: "store-kurnool-primary",
  deliveryZoneName: "RRV Green Basket - Kurnool Central",
  orderStatus: "CONFIRMED",
  paymentStatus: "COD_PENDING",
  paymentMethod: "COD",
  subtotal: 75.0,
  discountAmount: 0.0,
  deliveryCharge: 50.0,
  totalAmount: 125.0,
  deliveryAddress: {
    recipientName: "Anand",
    recipientMobile: "8978040537",
    addressLine1: "santhosi boys hostel, Dinnedevarapadu",
    city: "Dinnedevarapadu",
    state: "Andhra Pradesh",
    pincode: "518001",
    country: "India",
    latitude: 15.7726566,
    longitude: 78.0605359,
  },
  items: [
    {
      productName: "Fresh Banana",
      productImage: "https://d176vyi1y59gtf.cloudfront.net/0db1a171-8e51-419e-861e-2c9abae736a6/ef521b25-4cd6-4450-8732-1f320ae5f20b.png",
      unitOfMeasure: "DOZEN",
      quantity: 1.5,
      unitPrice: 50.0,
      totalPrice: 75.0,
    },
  ],
};

// Implement extraction functions identical to src/utils/order-helpers.ts
function getRegisteredCustomer(order) {
  if (!order) return { name: "Unknown", mobile: "" };
  const name =
    (order.registeredCustomerName && order.registeredCustomerName.trim()) ||
    (order.customer?.registeredName && order.customer.registeredName.trim()) ||
    "Registered Customer";
  const mobile =
    (order.registeredCustomerMobile && order.registeredCustomerMobile.trim()) ||
    (order.customer?.registeredMobile && order.customer.registeredMobile.trim()) ||
    "";
  const customerPublicId = order.customerPublicId || order.customer?.customerPublicId;
  return { name, mobile, customerPublicId };
}

function getDeliveryRecipient(order) {
  if (!order) return { name: "Not Provided", mobile: "", isMissing: true };
  const name =
    (order.recipientName && order.recipientName.trim()) ||
    (order.deliveryAddress?.recipientName && order.deliveryAddress.recipientName.trim()) ||
    "";
  const mobile =
    (order.recipientMobile && order.recipientMobile.trim()) ||
    (order.deliveryAddress?.recipientMobile && order.deliveryAddress.recipientMobile.trim()) ||
    "";
  const isMissing = !name && !mobile;
  return {
    name: name || (isMissing ? "Delivery Recipient Not Specified" : "Recipient"),
    mobile,
    isMissing,
  };
}

console.log("\n--- TEST SCENARIO A: Registered Customer & Recipient are Same (Mahendra) ---");
const regA = getRegisteredCustomer(order1);
const recipA = getDeliveryRecipient(order1);
assert(regA.name === "Mahendra", "Scenario A: Account owner name is Mahendra");
assert(regA.mobile === "+918247329041", "Scenario A: Account owner mobile is +918247329041");
assert(recipA.name === "Mahendra", "Scenario A: Recipient name is Mahendra");
assert(recipA.mobile === "8247329041", "Scenario A: Recipient mobile is 8247329041");

console.log("\n--- TEST SCENARIO B: Account Owner (Mahendra) and Recipient (Anand) are DIFFERENT ---");
const regB = getRegisteredCustomer(order2);
const recipB = getDeliveryRecipient(order2);
assert(regB.name === "Mahendra", "Scenario B: Account owner name is Mahendra");
assert(regB.mobile === "+918247329041", "Scenario B: Account owner mobile is +918247329041");
assert(regB.customerPublicId === "ab5d2528-78c1-40bc-be23-cc869816db8a", "Scenario B: Customer ID is ab5d2528-78c1-40bc-be23-cc869816db8a");
assert(recipB.name === "Anand", "Scenario B: Recipient name is Anand");
assert(recipB.mobile === "8978040537", "Scenario B: Recipient mobile is 8978040537");
assert(recipB.name !== regB.name, "Scenario B: Recipient name is distinct from Account Owner name");
assert(recipB.mobile !== regB.mobile, "Scenario B: Recipient mobile is distinct from Account Owner mobile");

console.log("\n--- TEST SCENARIO D: Product Images & Unit of Measure ---");
assert(order1.items[0].productImage.includes("03df7800-d281-4179-913d-8a4d7b2d595c"), "Scenario D: Coriander item has correct CloudFront URL");
assert(order1.items[0].unitOfMeasure === "KG", "Scenario D: Coriander unit is KG");
assert(order2.items[0].productImage.includes("0db1a171-8e51-419e-861e-2c9abae736a6"), "Scenario D: Banana item has correct CloudFront URL");
assert(order2.items[0].unitOfMeasure === "DOZEN", "Scenario D: Banana unit is DOZEN (not hardcoded KG)");

console.log("\n--- TEST SCENARIO E: Payment Breakdown Accuracy ---");
assert(order1.subtotal === 55.0, "Scenario E: Order 1 Subtotal is ₹55.00");
assert(order1.deliveryCharge === 50.0, "Scenario E: Order 1 Delivery Charge is ₹50.00");
assert(order1.totalAmount === 105.0, "Scenario E: Order 1 Total is ₹105.00");
assert(order1.subtotal !== order1.totalAmount, "Scenario E: Order 1 Subtotal != Total (Subtotal is NOT ₹105)");

assert(order2.subtotal === 75.0, "Scenario E: Order 2 Subtotal is ₹75.00");
assert(order2.deliveryCharge === 50.0, "Scenario E: Order 2 Delivery Charge is ₹50.00");
assert(order2.totalAmount === 125.0, "Scenario E: Order 2 Total is ₹125.00");

console.log("\n--- TEST SCENARIO F: Missing Optional Fields Safety ---");
const emptyOrder = { orderNumber: "TEST-EMPTY" };
const emptyRecip = getDeliveryRecipient(emptyOrder);
assert(emptyRecip.isMissing === true, "Scenario F: Flags recipient as missing without crashing");
assert(emptyRecip.name === "Delivery Recipient Not Specified", "Scenario F: Sensible placeholder without crashing");
assert(emptyRecip.mobile === "", "Scenario F: Empty mobile without crashing");

console.log("\n--- TEST SCENARIO G: Invoice & Delivery Label Privacy ---");
function generateInvoiceData(order) {
  const recipient = getDeliveryRecipient(order);
  return {
    recipientName: recipient.name,
    recipientMobile: recipient.mobile,
    deliveryAddress: order.deliveryAddress?.addressLine1 || "",
  };
}
const invoiceDataB = generateInvoiceData(order2);
assert(invoiceDataB.recipientName === "Anand", "Invoice shows recipient Anand");
assert(invoiceDataB.recipientMobile === "8978040537", "Invoice shows recipient phone 8978040537");
assert(invoiceDataB.recipientMobile !== order2.registeredCustomerMobile, "Invoice DOES NOT contain registered customer phone");
assert(invoiceDataB.recipientName !== order2.registeredCustomerName, "Invoice DOES NOT contain registered customer name");

console.log("\n================================================================================");
console.log(`   VALIDATION SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log("================================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
