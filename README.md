# GlowBase Retail

A full-stack e-commerce platform for salon products, with three account
tiers: **Customer**, **Admin (seller)**, and **Super Admin**.

- **Backend**: Node.js + Express + MongoDB (Mongoose), JWT auth, role-based
  middleware, image upload via Multer, mock payment gateway.
- **Frontend**: Next.js (pages router) + Tailwind CSS, purple & black theme.

## Roles

| Role | Can do |
|---|---|
| **Customer** (`user`) | Browse/shop, beauty quiz, place orders, view own order history, **view product details only — cannot list products** |
| **Admin** (`admin`) | Everything a customer can do, **plus**: list/edit/delete **their own** products (with image upload) and view/update the status of all orders. **Cannot see, edit, or delete another seller's products** |
| **Super Admin** (`superadmin`) | Everything an Admin can do, **plus**: manage all products regardless of seller, approve/reject seller applications, promote/demote/remove admins, view analytics |

**How accounts are created:**
- **Customers** self-register at `/register` — they choose their own email and password.
- **Sellers (Admins)** apply themselves at `/sell` — they choose their own name, email, password, and business name. A Super Admin reviews the application from **Dashboard → Team & Access** and clicks Approve or Reject. **Nobody ever types a password on someone else's behalf** — the applicant's own password (hashed at submission) becomes their real login the moment it's approved.

## Project structure

```
glowbase-retail/
├── server/          Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          User, Product, Order
│   │   ├── middleware/      auth (JWT), roles, upload (multer), errors
│   │   ├── controllers/     auth, products, orders, users, payments
│   │   ├── routes/
│   │   ├── uploads/         product images land here
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js          demo data + accounts
│   ├── package.json
│   └── .env.example
└── client/          Next.js app
    ├── pages/        /, /shop, /login, /register, /quiz, /cart, /orders,
    │                  /dashboard, /dashboard/users, /dashboard/analytics
    ├── components/    Navbar, Footer, Layout, RoleBadge, SideRail,
    │                  ProtectedRoute, dashboard/ProductsTab, dashboard/OrdersTab
    ├── context/       AuthContext (JWT/user), CartContext (local cart)
    ├── lib/api.js     fetch wrapper
    └── package.json
```

## Getting started

### 1. MongoDB
You need a MongoDB instance — either local (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Grab the connection
string either way.

### 2. Backend
```bash
cd server
cp .env.example .env
# edit .env: set MONGODB_URI and a random JWT_SECRET
npm install
npm run seed     # creates demo accounts + products
npm run dev      # starts on http://localhost:5000
```

Seed accounts (password for all: `password123`):
- Super Admin — `nadeesha@glowbase.lk`
- Admin — `tharindu@glowbase.lk`
- Admin — `sanduni@glowbase.lk`
- Customer — `ishara@client.lk`

### 3. Frontend
```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev      # starts on http://localhost:3000
```

Open http://localhost:3000, log in with a seed account, and you're in.

## Access control

- **Every page requires login** except `/login` and `/register`. Visiting
  `/`, `/shop`, `/quiz`, `/cart`, `/orders`, or any `/dashboard/*` route
  without a valid session redirects straight to `/login`.
- **Logout is a hard redirect** (`window.location.replace("/login")`),
  which drops all in-memory app state rather than just navigating within
  the single-page app. Combined with a `pageshow`/bfcache check in
  `ProtectedRoute` (which re-verifies the session and bounces to `/login`
  if it's no longer valid) and `Cache-Control: no-store` on every response,
  pressing the browser's Back button after logging out cannot land you on
  a page that was rendered while you were still authenticated.
- **Customer signup is self-serve** via `/register` — always creates a
  `user` account.
- **Seller (Admin) accounts are provisioned by a Super Admin only**, from
  the Team & Access page (`/dashboard/users`): the Super Admin enters the
  new seller's name, email, and a temporary password. There is no public
  way to create an Admin or Super Admin account — this is intentional.

- **Customer signup is self-serve** via `/register` — always creates a
  `user` account.
- **Seller (Admin) accounts start as an application**, submitted by the
  seller themselves at `/sell` (name, email, password, business name).
  It's stored as a `SellerRequest` with a bcrypt-hashed password. A Super
  Admin reviews pending applications at `/dashboard/users` and clicks
  Approve or Reject:
  - **Approve** creates the real `User` (role `admin`) using the
    applicant's own hashed password as-is (see the `skipPasswordHash`
    flag in `models/User.js` — this avoids double-hashing it), then
    deletes the request.
  - **Reject** just deletes the request. No account is created either way
    until a decision is made, and no plaintext password is stored beyond
    the review window.
  - There is no endpoint for a Super Admin to create an Admin directly
    with a password they typed — that path was removed on purpose.
- **Admins only ever see their own products.** The dashboard's Products
  tab calls `GET /api/products/mine` for Admins (filtered server-side to
  `seller: req.user._id`) and `GET /api/products` for Super Admins (who
  see everyone's). Edit/delete are blocked server-side for anyone who
  isn't the product's seller or a Super Admin — see `productController.js`.
- **Customers can only view products.** There is no product-creation UI
  or route reachable by role `user`; `POST/PATCH/DELETE /api/products`
  all require `admin` or `superadmin`.

## Notes

- **Payments are mocked.** `/api/payments/mock-charge` simulates a card
  charge with no real gateway involved — a card number ending in `0000`
  simulates a decline so the failure path is testable. Swapping in real
  Stripe later means replacing `paymentController.js` with a real
  `PaymentIntent` call; the request/response shape was kept Stripe-like
  on purpose.
- **Product images** can be uploaded as a file (stored in
  `server/src/uploads`, served at `/uploads/<file>`) or supplied as an
  external image URL — either works when adding a product from the
  Admin/Super Admin dashboard.
- **Cart** is stored client-side (localStorage) rather than in the
  database, so it survives refreshes but isn't shared across devices.
