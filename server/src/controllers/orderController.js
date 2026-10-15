const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// POST /api/orders  (user) - creates an order from cart items after "payment"
// { items: [{ productId, quantity }], shippingAddress, phone, paymentReference }
async function createOrder(req, res) {
  const { items, shippingAddress, phone, paymentReference } = req.body;
  if (!items || !items.length) return res.status(400).json({ message: "Cart is empty." });

  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ message: "Shipping address is required." });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  const resolvedItems = [];
  let total = 0;

  for (const line of items) {
    const requestedId = line.productId || line.product;
    const product = await Product.findById(requestedId);
    if (!product) return res.status(404).json({ message: `Product ${requestedId} not found.` });
    if (product.stock < line.quantity) {
      return res.status(400).json({ message: `${product.name} only has ${product.stock} in stock.` });
    }
    const pid = product.id || product._id;
    const sellerId = typeof product.seller === "object" ? (product.seller.id || product.seller._id) : product.seller;

    resolvedItems.push({
      product: pid,
      _id: pid,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      seller: sellerId,
    });
    total += product.price * line.quantity;
    // Decrement stock
    await Product.updateById(pid, { stock: product.stock - line.quantity });
  }

  const userId = req.user.id || req.user._id;

  // 1. Create the order with customer details
  const order = await Order.createOrder({
    customer: userId,
    items: resolvedItems,
    total,
    shippingAddress: shippingAddress.trim(),
    phone: phone.trim(),
    payment: { method: "mock-card", status: "paid", reference: paymentReference || `MOCK-${Date.now()}` },
  });

  // 2. Automatically update customer profile with latest address and phone
  // so future checkouts auto-populate seamlessly
  await User.updateById(userId, {
    address: shippingAddress.trim(),
    phone: phone.trim(),
  });

  res.status(201).json({ order });
}

// GET /api/orders/mine  (user) - the logged-in customer's own orders (strictly private)
async function myOrders(req, res) {
  const userId = req.user.id || req.user._id;
  const orders = await Order.findByCustomer(userId);
  res.json({ orders });
}

// GET /api/orders  (admin, superadmin) - sellers only see orders containing their products
async function listOrders(req, res) {
  let orders = await Order.findAll();
  const userId = req.user.id || req.user._id;

  // Sellers (admin) can ONLY see orders for products they sell
  if (req.user.role === "admin") {
    const sellerProducts = await Product.findBySeller(userId);
    const sellerProductIds = new Set(sellerProducts.map((p) => p.id || p._id));

    orders = orders.filter((o) => {
      return o.items?.some((item) => {
        const itemSeller = item.seller;
        const itemProdId = typeof item.product === "object" ? (item.product.id || item.product._id) : item.product;
        return itemSeller === userId || sellerProductIds.has(itemProdId);
      });
    });
  }

  // Populate customer info for seller fulfillment
  const customerIds = [...new Set(orders.map((o) => o.customer))];
  const customerMap = {};
  for (const cid of customerIds) {
    const customer = await User.findById(cid);
    if (customer) {
      customerMap[cid] = {
        _id: customer.id,
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
      };
    }
  }
  const populated = orders.map((o) => ({
    ...o,
    customer: customerMap[o.customer] || o.customer,
  }));

  res.json({ orders: populated });
}

// PATCH /api/orders/:id/status
// - superadmin: can update any order to any valid status
// - admin (seller): can update orders containing their products to any valid status
// - user (customer): can ONLY update their own order to "Delivered", AND ONLY IF all preceding steps
//   have been completed by the seller (Order must be "Out for Delivery")
async function updateStatus(req, res) {
  let { status } = req.body;
  const allowed = [
    "Processing",
    "Ready to Ship",
    "In Transit",
    "Out for Delivery",
    "Out For Delivery",
    "Delivered",
    "Shipped",
  ];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status. Allowed: Processing, Ready to Ship, In Transit, Out for Delivery, Delivered" });
  }

  // Normalize casing
  if (status === "Out For Delivery") status = "Out for Delivery";

  const existingOrder = await Order.findById(req.params.id);
  if (!existingOrder) return res.status(404).json({ message: "Order not found." });

  const userId = req.user.id || req.user._id;
  const userRole = req.user.role;
  let extraUpdateFields = {};

  if (userRole === "user") {
    // 1. Verify customer owns this order
    const customerId = typeof existingOrder.customer === "object"
      ? (existingOrder.customer.id || existingOrder.customer._id)
      : existingOrder.customer;

    if (String(customerId) !== String(userId)) {
      return res.status(403).json({ message: "You can only update your own orders." });
    }

    // 2. Customer can only select "Delivered"
    if (status !== "Delivered") {
      return res.status(403).json({ message: "Customers can only confirm an order as Delivered." });
    }

    // 3. Customer can only mark "Delivered" if all other preceding steps have been updated in order by the seller
    const validPreceding = ["Out for Delivery", "Shipped"];
    if (!validPreceding.includes(existingOrder.status)) {
      return res.status(400).json({
        message: "You can only mark this order as Delivered once all preceding fulfillment steps have been completed by the seller (Order must be Out for Delivery).",
      });
    }

    extraUpdateFields = {
      deliveredBy: "customer",
      deliveredAt: new Date().toISOString(),
    };
  } else if (userRole === "admin") {
    // Sellers (admin) can ONLY update status if the order belongs to their products
    const sellerProducts = await Product.findBySeller(userId);
    const sellerProductIds = new Set(sellerProducts.map((p) => p.id || p._id));

    const isSellerOrder = existingOrder.items?.some((item) => {
      const itemSeller = item.seller;
      const itemProdId = typeof item.product === "object" ? (item.product.id || item.product._id) : item.product;
      return itemSeller === userId || sellerProductIds.has(itemProdId);
    });

    if (!isSellerOrder) {
      return res.status(403).json({ message: "You can only update orders for your own products." });
    }
  } else if (userRole !== "superadmin") {
    return res.status(403).json({ message: "Unauthorized." });
  }

  const order = await Order.updateStatus(req.params.id, status, extraUpdateFields);
  res.json({ order });
}

module.exports = { createOrder, myOrders, listOrders, updateStatus };
