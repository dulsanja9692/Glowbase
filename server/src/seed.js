// Seeds the Firebase Firestore database with a superadmin, two admin sellers,
// a customer, sample products, an order, and a pending seller application.
// Run with: npm run seed
require("dotenv").config();
require("./config/firebase");
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const SellerRequest = require("./models/SellerRequest");

async function seed() {
  console.log("Clearing existing Firestore data...");
  await Promise.all([
    User.deleteAll(),
    Product.deleteAll(),
    Order.deleteAll(),
    SellerRequest.deleteAll(),
  ]);

  console.log("Creating users...");
  const superadmin = await User.createUser({
    name: "Nadeesha Kumari",
    email: "nadeesha@glowbase.lk",
    password: "password123",
    role: "superadmin",
  });
  const admin1 = await User.createUser({
    name: "Tharindu Bandara",
    email: "tharindu@glowbase.lk",
    password: "password123",
    role: "admin",
  });
  const admin2 = await User.createUser({
    name: "Sanduni Rathnayake",
    email: "sanduni@glowbase.lk",
    password: "password123",
    role: "admin",
  });
  const customer = await User.createUser({
    name: "Ishara Perera",
    email: "ishara@client.lk",
    password: "password123",
    role: "user",
    address: "No. 12, Flower Road, Colombo 07",
    phone: "+94 77 123 4567",
  });

  console.log("Creating products...");
  const admin1Id = admin1.id || admin1._id;
  const admin2Id = admin2.id || admin2._id;
  const products = await Product.insertMany([
    { name: "Silk Repair Shampoo", category: "Hair", price: 2400, stock: 42, seller: admin1Id, imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=60" },
    { name: "Argan Gloss Conditioner", category: "Hair", price: 2600, stock: 8, seller: admin1Id, imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&q=60" },
    { name: "Overnight Renewal Serum", category: "Skin", price: 3800, stock: 15, seller: admin2Id, imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=60" },
    { name: "Rose Clay Mask", category: "Skin", price: 2200, stock: 30, seller: admin2Id, imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=60" },
    { name: "Ceramic Round Brush", category: "Tools", price: 3200, stock: 20, seller: admin1Id, imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=60" },
  ]);

  console.log("Creating a sample order...");
  const customerId = customer.id || customer._id;
  const firstProdId = products[0].id || products[0]._id;
  await Order.createOrder({
    customer: customerId,
    items: [{ product: firstProdId, name: products[0].name, price: products[0].price, quantity: 2, seller: admin1Id }],
    total: products[0].price * 2,
    shippingAddress: "No. 12, Flower Road, Colombo 07",
    phone: "+94 77 123 4567",
    payment: { method: "mock-card", status: "paid", reference: "MOCK-SEED-0001" },
  });

  console.log("Creating a sample pending seller application...");
  await SellerRequest.createRequest({
    name: "Kavindu Perera",
    email: "kavindu@newseller.lk",
    password: "password123",
    businessName: "Kavindu's Curl Co.",
    message: "We specialize in curly-hair products and would love to list our range.",
  });

  console.log("\nSeed complete! Login with:");
  console.log("  Super Admin -> nadeesha@glowbase.lk / password123");
  console.log("  Admin       -> tharindu@glowbase.lk / password123");
  console.log("  Admin       -> sanduni@glowbase.lk / password123");
  console.log("  Customer    -> ishara@client.lk / password123");
  console.log("\nA sample pending seller application (kavindu@newseller.lk) is");
  console.log("waiting for review under Dashboard -> Team & Access as the Super Admin.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
