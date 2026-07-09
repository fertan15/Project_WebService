# Anime Subscription API

Anime Subscription API is a RESTful web service built with **Node.js**, **Express.js**, and **MongoDB**. The service acts as the backend for a simple anime streaming/subscription platform. It handles user registration and login, anime catalog management, premium subscription plans, payment transactions, premium anime access checking, anime reviews, and user watchlists.

This README explains not only how to run the project, but also **what the web service is for**, **why every endpoint exists**, and **how the program flow works from request to response**.

---

## Table of Contents

- [1. Web Service Overview](#1-web-service-overview)
- [2. Main Idea of the Application](#2-main-idea-of-the-application)
- [3. User Roles](#3-user-roles)
- [4. Main Features](#4-main-features)
- [5. Technology Stack](#5-technology-stack)
- [6. Project Structure](#6-project-structure)
- [7. Environment Variables](#7-environment-variables)
- [8. Installation and Setup](#8-installation-and-setup)
- [9. Seeded Test Accounts](#9-seeded-test-accounts)
- [10. How the Program Works](#10-how-the-program-works)
- [11. Database Collections and Relationships](#11-database-collections-and-relationships)
- [12. Endpoint Summary](#12-endpoint-summary)
- [13. Detailed Endpoint Explanation](#13-detailed-endpoint-explanation)
- [14. CRUD Modules Explanation](#14-crud-modules-explanation)
- [15. Business Logic Explanation](#15-business-logic-explanation)
- [16. Middleware Flow](#16-middleware-flow)
- [17. Validation Rules](#17-validation-rules)
- [18. File Upload Rules](#18-file-upload-rules)
- [19. Postman Collection Testing](#19-postman-collection-testing)
- [20. Recommended Manual Testing Flow](#20-recommended-manual-testing-flow)
- [21. Common Response Status Codes](#21-common-response-status-codes)
- [22. Important Fixes in This Version](#22-important-fixes-in-this-version)
- [23. Possible Future Improvements](#23-possible-future-improvements)
- [24. Conclusion](#24-conclusion)

---

## 1. Web Service Overview

This project is a **backend web service**. It does not include a frontend user interface. Instead, it provides API endpoints that can be consumed by tools or applications such as:

- Postman
- Mobile applications
- Web frontend applications
- Admin dashboards
- Other backend services

The API uses JSON as the main request and response format. For anime cover upload, the API also supports `multipart/form-data`.

### What problem does this service solve?

The service simulates a backend for an anime platform where:

1. Users can create an account.
2. Users can login and receive a JWT token.
3. Users can browse anime.
4. Users can buy premium subscription plans.
5. Premium users can access premium anime.
6. Users can write reviews for anime.
7. Users can save anime to their watchlist.
8. Admin users can manage anime, subscription plans, users, and transactions.

### Main web service concept

The API is organized around these main resources:

| Resource        | Meaning in the Application                     |
| --------------- | ---------------------------------------------- |
| `auth`          | Handles register and login.                    |
| `anime`         | Stores and manages anime catalog data.         |
| `subscriptions` | Stores premium subscription packages.          |
| `transactions`  | Stores user purchase/payment records.          |
| `users`         | Stores registered user accounts.               |
| `reviews`       | Stores user rating and comment data for anime. |
| `watchlist`     | Stores anime saved by each user.               |

Each resource is accessed using HTTP endpoints such as `GET`, `POST`, `PUT`, and `DELETE`.

---

## 2. Main Idea of the Application

The project is designed as a simplified anime subscription platform.

### Example real-world scenario

A user named Wawa opens an anime streaming app. Wawa can register and login. After login, Wawa can browse anime. Some anime are free, while some anime are marked as premium.

If Wawa wants to watch a premium anime, Wawa must buy a premium subscription plan first. The platform provides plans such as:

- 7-day premium access
- 30-day premium access
- 90-day premium access
- 1-year premium access

After buying a plan, Wawa's account becomes premium until a certain date. As long as the premium date has not expired, Wawa can watch premium anime.

Wawa can also:

- Add anime to a watchlist
- Set watchlist status such as `watching` or `completed`
- Give anime a rating and review comment
- View transaction history

Admin users are responsible for maintaining the platform data. Admins can:

- Add new anime
- Edit anime information
- Delete anime
- Create subscription plans
- Update transaction statuses
- Manage users

---

## 3. User Roles

The API has two roles: `user` and `admin`.

### `user`

A normal user can:

- Register and login
- View anime
- Search anime from Jikan API
- View subscription plans
- Purchase subscription plans
- View their own transaction history
- Watch anime if allowed
- Create, update, and delete their own reviews
- Create, update, and delete their own watchlist items

### `admin`

An admin can do everything a user can do, plus admin-only management features:

- Create anime
- Update anime
- Delete anime
- Create subscription plans
- Update subscription plans
- Delete subscription plans
- View all users
- Update users
- Delete users
- View all transactions
- Update transaction status
- Delete transaction records

### Why role separation is important

Role separation protects sensitive features. For example, a normal user should not be able to delete anime from the platform or change another user's wallet balance. That is why admin endpoints require both:

1. A valid JWT token
2. The `admin` role inside the token

---

## 4. Main Features

### 4.1 Authentication

Users can register and login. Passwords are hashed using `bcrypt` before being stored. Login returns a JWT token that must be sent in the `Authorization` header for protected endpoints.

### 4.2 Authorization

Admin-only routes are protected using role-based middleware. If a normal user tries to access an admin route, the API returns `403 Forbidden`.

### 4.3 Anime Catalog

Anime data is stored in the `animes` collection. Each anime can have:

- Title
- Synopsis
- Episode count
- Type
- Premium status
- Cover image

### 4.4 Premium Subscription Plans

Subscription plans are stored in the `subscriptionplans` collection. Each plan defines:

- Plan name
- Price
- Duration in days
- Description

### 4.5 Transactions

Transactions are stored in the `invoices` collection. A transaction records which user bought which plan, the payment method, total amount, status, and premium end date after success.

### 4.6 Premium Access Check

When a user tries to watch anime, the system checks whether the anime requires premium access. If the anime is premium, the system checks the user's `subscription_status` and `premium_until` date.

### 4.7 Review CRUD

Users can rate anime from 1 to 5 and write a comment. One user can only create one review per anime.

### 4.8 Watchlist CRUD

Users can save anime to their own watchlist and track watching progress using statuses such as `plan_to_watch`, `watching`, `completed`, and `dropped`.

### 4.9 Jikan API Integration

The project includes a third-party API endpoint that searches anime from Jikan API. This shows how the backend can call an external service using `axios`.

### 4.10 Seeder

The seeder creates test users, anime, subscription plans, transactions, reviews, and watchlist data so the project can be tested quickly.

---

## 5. Technology Stack

| Technology   | Purpose                                              |
| ------------ | ---------------------------------------------------- |
| Node.js      | Runs JavaScript on the server.                       |
| Express.js   | Creates the HTTP API routes and middleware.          |
| MongoDB      | Stores application data.                             |
| Mongoose     | Handles MongoDB connection and transaction sessions. |
| bcrypt       | Hashes user passwords.                               |
| jsonwebtoken | Creates and verifies JWT tokens.                     |
| Joi          | Validates request bodies.                            |
| multer       | Handles anime cover image uploads.                   |
| axios        | Calls the external Jikan API.                        |
| dotenv       | Loads environment variables from `.env`.             |
| Postman      | Tests all API endpoints using `wawa.json`.           |

---

## 6. Project Structure

```txt
anime-subscription-api/
├── index.js
├── package.json
├── package-lock.json
├── .env.example
├── README.md
├── wawa.json
├── uploads/
│   └── uploaded anime cover images
└── src/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── animeController.js
    │   ├── authController.js
    │   ├── reviewController.js
    │   ├── subscriptionController.js
    │   ├── transactionController.js
    │   ├── userController.js
    │   └── watchlistController.js
    ├── middlewares/
    │   ├── auth.js
    │   ├── index.js
    │   ├── upload.js
    │   └── validate.js
    ├── routes/
    │   ├── anime.js
    │   ├── auth.js
    │   ├── index.js
    │   ├── review.js
    │   ├── subscription.js
    │   ├── transaction.js
    │   ├── user.js
    │   └── watchlist.js
    ├── Schema/
    │   ├── animeSchema.js
    │   ├── authSchema.js
    │   ├── reviewSchema.js
    │   ├── subscriptionSchema.js
    │   ├── transactionSchema.js
    │   ├── userSchema.js
    │   └── watchlistSchema.js
    └── utils/
        └── objectId.js
```

### File and folder explanation

| File/Folder                   | Explanation                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `index.js`                    | Main entry point. Loads `.env`, starts Express, connects to MongoDB, registers routes, and starts the server. |
| `src/routes`                  | Defines endpoint URLs and attaches middleware/controllers to each endpoint.                                   |
| `src/controllers`             | Contains the main logic for each request. Controllers read data, write data, and return responses.            |
| `src/Schema`                  | Contains Joi schemas for validating incoming request bodies.                                                  |
| `src/middlewares/auth.js`     | Contains JWT authentication and role authorization middleware.                                                |
| `src/middlewares/validate.js` | Validates request body using Joi before the controller runs.                                                  |
| `src/middlewares/upload.js`   | Handles anime image upload using multer.                                                                      |
| `src/config/db.js`            | Seeder file. Inserts sample data into MongoDB.                                                                |
| `src/utils/objectId.js`       | Converts and validates MongoDB ObjectId values safely.                                                        |
| `uploads/`                    | Stores uploaded anime cover image files.                                                                      |
| `wawa.json`                   | Postman collection for testing the endpoints.                                                                 |

---

## 7. Environment Variables

Create a `.env` file in the project root. You can copy the example file:

```bash
cp .env.example .env
```

Example `.env`:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/anime_subscription_db
JWT_SECRET=change_this_secret
```

| Variable     | Required | Explanation                                           |
| ------------ | -------: | ----------------------------------------------------- |
| `PORT`       |       No | Server port. If empty, the server uses `3000`.        |
| `MONGO_URI`  |      Yes | MongoDB connection string.                            |
| `JWT_SECRET` |      Yes | Secret key used for signing and verifying JWT tokens. |

The server will not start if `MONGO_URI` or `JWT_SECRET` is missing.

---

## 8. Installation and Setup

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Create `.env`

```bash
cp .env.example .env
```

Then fill in `MONGO_URI` and `JWT_SECRET`.

### Step 3: Seed the database

```bash
npm run seed
```

The seeder creates sample data for testing.

### Step 4: Start the server

```bash
npm start
```

Expected console output:

```txt
✅ Connected to MongoDB via Mongoose! Silakan cek di Compass.
🚀 Server berjalan di http://localhost:3000
```

### Step 5: Test the root endpoint

```txt
GET http://localhost:3000/
```

Expected response:

```json
{
  "message": "Anime Subscription API is running",
  "routes": {
    "auth": "/api/auth",
    "anime": "/api/anime",
    "subscriptions": "/api/subscriptions",
    "transactions": "/api/transactions",
    "users": "/api/users",
    "reviews": "/api/reviews",
    "watchlist": "/api/watchlist"
  }
}
```

---

## 9. Seeded Test Accounts

After running `npm run seed`, these accounts are available:

| Role         | Email            | Password  | What It Is For                                      |
| ------------ | ---------------- | --------- | --------------------------------------------------- |
| Admin        | `admin@stts.edu` | `wawa123` | Testing admin-only endpoints.                       |
| Premium User | `user@stts.edu`  | `wawa123` | Testing premium access and user endpoints.          |
| Basic User   | `basic@stts.edu` | `wawa123` | Testing normal user access and premium restriction. |

To use protected endpoints, login first:

```txt
POST /api/auth/login
```

Then send the token in this header:

```txt
Authorization: Bearer <your_token_here>
```

---

## 10. How the Program Works

This section explains the program flow, from server startup to individual feature flows.

### 10.1 Server startup flow

When `npm start` is executed, the program runs `index.js`.

```txt
npm start
   ↓
node index.js
   ↓
Load environment variables using dotenv
   ↓
Create Express app
   ↓
Register global middleware:
- express.json()
- express.urlencoded()
- static uploads route
   ↓
Register root endpoint `/`
   ↓
Register API routes under `/api`
   ↓
Connect to MongoDB using MONGO_URI
   ↓
Start server on PORT
```

If MongoDB connection fails or required environment variables are missing, the server stops and prints an error.

### 10.2 General request flow

Every request follows this general pattern:

```txt
Client / Postman
   ↓
Express route
   ↓
Middleware, if the route uses middleware
   ↓
Controller function
   ↓
MongoDB or external API operation
   ↓
JSON response
```

Example for creating anime:

```txt
POST /api/anime
   ↓
authenticate middleware checks JWT token
   ↓
authorize middleware checks admin role
   ↓
upload middleware handles optional coverImage file
   ↓
validate middleware checks body fields
   ↓
createAnime controller inserts anime into MongoDB
   ↓
API returns created anime data
```

### 10.3 Authentication flow

```txt
User sends email and password
   ↓
API searches user by email
   ↓
API compares password with hashed password using bcrypt
   ↓
If valid, API creates JWT token
   ↓
Client stores token
   ↓
Client sends token in Authorization header for protected routes
```

### 10.4 Register flow

```txt
POST /api/auth/register
   ↓
validate register body
   ↓
normalize email to lowercase
   ↓
check if email already exists
   ↓
hash password with bcrypt
   ↓
insert user into users collection
   ↓
return userId
```

### 10.5 Login flow

```txt
POST /api/auth/login
   ↓
validate login body
   ↓
find user by email
   ↓
compare password with bcrypt
   ↓
create JWT token containing id, role, and email
   ↓
return token and safe user data
```

The password is never returned in the login response.

### 10.6 Anime browsing flow

```txt
GET /api/anime
   ↓
getAllAnime controller
   ↓
read all anime from animes collection
   ↓
sort by newest createdAt
   ↓
normalize anime fields
   ↓
return anime list
```

This endpoint is public, so users do not need to login just to browse anime.

### 10.7 Anime watch flow

```txt
GET /api/anime/:id/watch
   ↓
authenticate user token
   ↓
find anime by id
   ↓
find logged-in user by token id
   ↓
check if anime is premium
   ↓
if anime is free, allow watch
   ↓
if anime is premium, check user's subscription_status and premium_until
   ↓
if premium is active, allow watch
   ↓
if premium expired, set user back to basic and block watch
```

This flow is important because it separates **viewing anime data** from **watching anime content**.

- Viewing anime data can be public.
- Watching premium anime requires login and active premium status.

### 10.8 Subscription purchase flow with Wallet

```txt
POST /api/transactions/purchase
   ↓
authenticate user token
   ↓
validate planId and paymentMethod
   ↓
start MongoDB session/transaction
   ↓
find subscription plan
   ↓
find logged-in user
   ↓
check wallet balance
   ↓
deduct wallet balance
   ↓
activate premium subscription
   ↓
create invoice with status Success
   ↓
commit MongoDB transaction
   ↓
return transaction result
```

Wallet payment is completed immediately because the system can directly deduct the user's wallet balance.

### 10.9 Subscription purchase flow with non-wallet payment

```txt
POST /api/transactions/purchase
   ↓
authenticate user token
   ↓
validate planId and paymentMethod
   ↓
find subscription plan
   ↓
create invoice with status Pending
   ↓
return pending transaction result
```

For methods such as `bank_transfer`, `credit_card`, and `e-wallet`, this project simulates manual confirmation. The transaction starts as `Pending`. Admin later updates it to `Success`.

### 10.10 Admin transaction confirmation flow

```txt
PUT /api/transactions/:id
   ↓
authenticate admin token
   ↓
authorize admin role
   ↓
find transaction
   ↓
if status changes from Pending/Failed to Success:
     find subscription plan
     activate user's premium subscription
     save premium_until_after_success
   ↓
update transaction
   ↓
return updated transaction
```

### 10.11 Premium extension flow

If a user still has active premium time and buys another plan, the new duration is added after the current premium end date.

```txt
Current date: 2026-07-09
Current premium_until: 2026-08-01
User buys 30-day plan
New premium_until: 2026-08-31
```

If the user's premium is already expired, the new duration starts from the current date.

### 10.12 Review flow

```txt
POST /api/reviews
   ↓
authenticate user token
   ↓
validate anime_id, rating, and comment
   ↓
check anime exists
   ↓
check user has not reviewed the same anime before
   ↓
insert review
   ↓
return created review
```

The API prevents duplicate reviews by the same user for the same anime.

### 10.13 Watchlist flow

```txt
POST /api/watchlist
   ↓
authenticate user token
   ↓
validate anime_id and status
   ↓
check anime exists
   ↓
check anime is not already in user's watchlist
   ↓
insert watchlist item
   ↓
return created watchlist item
```

The API prevents duplicate watchlist rows for the same anime and user.

### 10.14 Admin maintenance flow

Admin maintenance means managing master data and user data.

```txt
Admin login
   ↓
Admin receives JWT token
   ↓
Admin sends token to admin endpoint
   ↓
authenticate checks token
   ↓
authorize checks role = admin
   ↓
controller performs create/update/delete/list action
   ↓
response returned to admin
```

Admin endpoints are useful for building an admin dashboard later.

---

## 11. Database Collections and Relationships

The project uses MongoDB collections directly through `mongoose.connection.db`.

### 11.1 Relationship overview

```txt
users
  ├── reviews.user_id
  ├── watchlists.user_id
  └── invoices.user_id

animes
  ├── reviews.anime_id
  └── watchlists.anime_id

subscriptionplans
  └── invoices.plan_id
```

### 11.2 `users` collection

Stores account data.

Example:

```json
{
  "_id": "ObjectId",
  "username": "wawa_user",
  "email": "user@stts.edu",
  "password": "hashed_password",
  "role": "user",
  "wallet": 500000,
  "subscription_status": "premium",
  "premium_until": "2026-08-08T00:00:00.000Z",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Important fields:

| Field                 | Explanation                                            |
| --------------------- | ------------------------------------------------------ |
| `username`            | Display name of the user.                              |
| `email`               | Login identifier. Stored in lowercase.                 |
| `password`            | Hashed password. Not returned in normal API responses. |
| `role`                | Either `user` or `admin`.                              |
| `wallet`              | User balance used for wallet payment.                  |
| `subscription_status` | Either `basic` or `premium`.                           |
| `premium_until`       | Date when premium access ends.                         |

### 11.3 `animes` collection

Stores local anime catalog data.

Example:

```json
{
  "_id": "ObjectId",
  "title": "One Piece",
  "synopsis": "Monkey D. Luffy sails with his crew to find the legendary treasure One Piece.",
  "episodes": 1000,
  "isPremium": false,
  "coverImage": "uploads/one-piece-1783064070109.jpeg",
  "type": "TV",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 11.4 `subscriptionplans` collection

Stores subscription plan/package data.

Example:

```json
{
  "_id": "ObjectId",
  "plan_name": "1 Month Premium Access",
  "price": 50000,
  "duration_days": 30,
  "description": "Akses penuh premium 30 hari.",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 11.5 `invoices` collection

Stores purchase transaction records.

Example:

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "plan_id": "ObjectId",
  "invoice_date": "Date",
  "total_amount": 50000,
  "payment_method": "Wallet",
  "status": "Success",
  "premium_until_after_success": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 11.6 `reviews` collection

Stores user ratings and comments.

Example:

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "anime_id": "ObjectId",
  "rating": 5,
  "comment": "Great anime and fun to watch.",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### 11.7 `watchlists` collection

Stores saved anime and user watch progress.

Example:

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "anime_id": "ObjectId",
  "status": "watching",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 12. Endpoint Summary

Base URL:

```txt
http://localhost:3000
```

### 12.1 Root endpoint

| Method | Endpoint | Access | What It Is For                                                 |
| ------ | -------- | ------ | -------------------------------------------------------------- |
| `GET`  | `/`      | Public | Checks if the API is running and shows available route groups. |

### 12.2 Auth endpoints

| Method | Endpoint             | Access | What It Is For                          |
| ------ | -------------------- | ------ | --------------------------------------- |
| `POST` | `/api/auth/register` | Public | Creates a new user account.             |
| `POST` | `/api/auth/login`    | Public | Logs in a user and returns a JWT token. |

### 12.3 Anime endpoints

| Method   | Endpoint                           | Access         | What It Is For                                                   |
| -------- | ---------------------------------- | -------------- | ---------------------------------------------------------------- |
| `GET`    | `/api/anime/jikan/search?q=naruto` | Public         | Searches anime from Jikan external API.                          |
| `GET`    | `/api/anime`                       | Public         | Gets all anime from local database.                              |
| `GET`    | `/api/anime/:id`                   | Public         | Gets detail of one anime.                                        |
| `POST`   | `/api/anime`                       | Admin          | Creates a new anime.                                             |
| `PUT`    | `/api/anime/:id`                   | Admin          | Updates anime data.                                              |
| `DELETE` | `/api/anime/:id`                   | Admin          | Deletes anime and related review/watchlist rows.                 |
| `GET`    | `/api/anime/:id/watch`             | Logged-in user | Checks if user can watch the anime and returns a fake watch URL. |

### 12.4 Subscription endpoints

| Method   | Endpoint                 | Access | What It Is For                    |
| -------- | ------------------------ | ------ | --------------------------------- |
| `GET`    | `/api/subscriptions`     | Public | Gets all available premium plans. |
| `GET`    | `/api/subscriptions/:id` | Public | Gets detail of one premium plan.  |
| `POST`   | `/api/subscriptions`     | Admin  | Creates a new premium plan.       |
| `PUT`    | `/api/subscriptions/:id` | Admin  | Updates a premium plan.           |
| `DELETE` | `/api/subscriptions/:id` | Admin  | Deletes a premium plan.           |

### 12.5 Transaction endpoints

| Method   | Endpoint                     | Access         | What It Is For                             |
| -------- | ---------------------------- | -------------- | ------------------------------------------ |
| `POST`   | `/api/transactions/purchase` | Logged-in user | Buys a subscription plan.                  |
| `GET`    | `/api/transactions/history`  | Logged-in user | Gets logged-in user's transaction history. |
| `GET`    | `/api/transactions`          | Admin          | Gets all transaction records.              |
| `PUT`    | `/api/transactions/:id`      | Admin          | Updates transaction status/payment method. |
| `DELETE` | `/api/transactions/:id`      | Admin          | Deletes a transaction record.              |

### 12.6 User endpoints

| Method   | Endpoint         | Access | What It Is For                                      |
| -------- | ---------------- | ------ | --------------------------------------------------- |
| `GET`    | `/api/users`     | Admin  | Gets all users without passwords.                   |
| `GET`    | `/api/users/:id` | Admin  | Gets one user without password.                     |
| `PUT`    | `/api/users/:id` | Admin  | Updates user data, wallet, role, or premium status. |
| `DELETE` | `/api/users/:id` | Admin  | Deletes a user and related review/watchlist rows.   |

### 12.7 Review endpoints

| Method   | Endpoint                      | Access                | What It Is For                                     |
| -------- | ----------------------------- | --------------------- | -------------------------------------------------- |
| `GET`    | `/api/reviews/anime/:animeId` | Public                | Gets all reviews and average rating for one anime. |
| `GET`    | `/api/reviews/my`             | Logged-in user        | Gets reviews made by the logged-in user.           |
| `POST`   | `/api/reviews`                | Logged-in user        | Creates a review for an anime.                     |
| `PUT`    | `/api/reviews/:id`            | Review owner or admin | Updates a review.                                  |
| `DELETE` | `/api/reviews/:id`            | Review owner or admin | Deletes a review.                                  |

### 12.8 Watchlist endpoints

| Method   | Endpoint             | Access                   | What It Is For                   |
| -------- | -------------------- | ------------------------ | -------------------------------- |
| `GET`    | `/api/watchlist`     | Logged-in user           | Gets logged-in user's watchlist. |
| `POST`   | `/api/watchlist`     | Logged-in user           | Adds anime to watchlist.         |
| `PUT`    | `/api/watchlist/:id` | Watchlist owner or admin | Updates watchlist status.        |
| `DELETE` | `/api/watchlist/:id` | Watchlist owner or admin | Removes anime from watchlist.    |

---

## 13. Detailed Endpoint Explanation

This section explains each endpoint in more detail: purpose, access, body, and the internal flow.

---

### 13.1 `GET /`

**Purpose:** Check whether the server is running.

**Access:** Public

**When to use it:** Use this first after running `npm start` to confirm that the API is alive.

**Internal flow:**

```txt
request reaches index.js
   ↓
root route returns message and route list
```

---

### 13.2 `POST /api/auth/register`

**Purpose:** Create a new user account.

**Access:** Public

**Request body:**

```json
{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

**Field explanation:**

| Field      | Required | Explanation                                                   |
| ---------- | -------: | ------------------------------------------------------------- |
| `username` |      Yes | Name for the user account. Minimum 3 characters.              |
| `email`    |      Yes | User email. Must be unique.                                   |
| `password` |      Yes | Plain password from request. It will be hashed before saving. |
| `role`     |       No | Either `user` or `admin`. Defaults to `user`.                 |

**Internal flow:**

```txt
validate body
   ↓
check duplicate email
   ↓
hash password
   ↓
insert into users collection
   ↓
return created userId
```

**Important note:** In a real production app, normal public registration usually should not allow users to register as `admin`. For this school/testing project, the schema allows it so role-based testing is easier.

---

### 13.3 `POST /api/auth/login`

**Purpose:** Authenticate a user and return a JWT token.

**Access:** Public

**Request body:**

```json
{
  "email": "user@stts.edu",
  "password": "wawa123"
}
```

**Success result:**

- Returns a JWT token.
- Returns safe user data without password.
- Token expires in 1 day.

**Internal flow:**

```txt
validate body
   ↓
find user by email
   ↓
compare password using bcrypt
   ↓
create JWT token
   ↓
return token and user data
```

**How to use the token:**

```txt
Authorization: Bearer <token>
```

---

### 13.4 `GET /api/anime/jikan/search?q=naruto`

**Purpose:** Search anime from the Jikan public API.

**Access:** Public

**Query parameter:**

| Parameter | Required | Explanation                                                     |
| --------- | -------: | --------------------------------------------------------------- |
| `q`       |      Yes | Search keyword, for example `naruto`, `one piece`, or `bleach`. |

**Internal flow:**

```txt
read q query parameter
   ↓
if q is empty, return 400
   ↓
call https://api.jikan.moe/v4/anime using axios
   ↓
return Jikan data
```

**What it is for:** This endpoint demonstrates third-party API integration. The data is not saved automatically into MongoDB. It only searches and returns external anime data.

---

### 13.5 `GET /api/anime`

**Purpose:** Get all anime stored in the local database.

**Access:** Public

**What it is for:** Use this to show the anime catalog on a homepage or anime list page.

**Internal flow:**

```txt
read all documents from animes collection
   ↓
sort newest first
   ↓
normalize field names
   ↓
return anime list
```

---

### 13.6 `GET /api/anime/:id`

**Purpose:** Get detailed information about one anime.

**Access:** Public

**Path parameter:**

| Parameter | Explanation                    |
| --------- | ------------------------------ |
| `id`      | MongoDB ObjectId of the anime. |

**Internal flow:**

```txt
validate anime id
   ↓
find anime by _id
   ↓
if not found, return 404
   ↓
return anime data
```

---

### 13.7 `POST /api/anime`

**Purpose:** Create a new anime in the local catalog.

**Access:** Admin only

**Content type:** `multipart/form-data`

**Headers:**

```txt
Authorization: Bearer <admin_token>
```

**Form-data fields:**

| Field        | Required | Type    | Explanation                                      |
| ------------ | -------: | ------- | ------------------------------------------------ |
| `title`      |      Yes | text    | Anime title.                                     |
| `synopsis`   |      Yes | text    | Anime description.                               |
| `episodes`   |      Yes | number  | Number of episodes.                              |
| `isPremium`  |       No | boolean | Whether this anime requires premium access.      |
| `type`       |       No | text    | Anime type, for example `TV`, `Movie`, or `OVA`. |
| `coverImage` |       No | file    | Anime cover image.                               |

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
process image upload if provided
   ↓
validate body using Joi
   ↓
insert anime into animes collection
   ↓
return created anime
```

**What it is for:** Admin uses this endpoint to add new content to the platform.

---

### 13.8 `PUT /api/anime/:id`

**Purpose:** Update anime data.

**Access:** Admin only

**Content type:** `multipart/form-data`

**Body:** You can send one or more anime fields, such as:

```json
{
  "title": "Updated Anime Title",
  "episodes": 24,
  "isPremium": true
}
```

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
validate anime id
   ↓
process new image if provided
   ↓
validate update body
   ↓
update anime document
   ↓
return updated anime
```

---

### 13.9 `DELETE /api/anime/:id`

**Purpose:** Delete anime from the local catalog.

**Access:** Admin only

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
validate anime id
   ↓
delete anime
   ↓
delete related reviews
   ↓
delete related watchlist rows
   ↓
return success message
```

**Why related data is deleted:** If anime is deleted, reviews and watchlist items that point to that anime would become broken references. The controller cleans them up.

---

### 13.10 `GET /api/anime/:id/watch`

**Purpose:** Check if a logged-in user can watch an anime.

**Access:** Logged-in user

**Headers:**

```txt
Authorization: Bearer <user_token>
```

**Internal flow:**

```txt
authenticate token
   ↓
validate anime id and user id
   ↓
find anime
   ↓
find logged-in user
   ↓
check if anime is premium
   ↓
if anime is free, allow watch
   ↓
if anime is premium, check active premium subscription
   ↓
return fake videoUrl if allowed
```

**What it is for:** This endpoint represents the streaming access check. It does not stream a real video file. It returns a fake URL to show that the user is allowed to watch.

---

### 13.11 `GET /api/subscriptions`

**Purpose:** Get all available subscription plans.

**Access:** Public

**What it is for:** Use this endpoint to display available premium packages to users before they purchase.

**Internal flow:**

```txt
read all subscriptionplans
   ↓
sort by price ascending
   ↓
return plan list
```

---

### 13.12 `GET /api/subscriptions/:id`

**Purpose:** Get one subscription plan by ID.

**Access:** Public

**Internal flow:**

```txt
validate plan id
   ↓
find plan by _id
   ↓
return plan or 404
```

---

### 13.13 `POST /api/subscriptions`

**Purpose:** Create a new subscription plan.

**Access:** Admin only

**Request body:**

```json
{
  "plan_name": "1 Month Premium Access",
  "price": 50000,
  "duration_days": 30,
  "description": "Akses penuh premium 30 hari."
}
```

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
validate body
   ↓
insert plan into subscriptionplans
   ↓
return created plan
```

**What it is for:** Admin can create new premium packages without changing application code.

---

### 13.14 `PUT /api/subscriptions/:id`

**Purpose:** Update an existing subscription plan.

**Access:** Admin only

**Example body:**

```json
{
  "price": 55000,
  "description": "Updated premium package."
}
```

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
validate plan id
   ↓
validate body
   ↓
update plan
   ↓
return updated plan
```

---

### 13.15 `DELETE /api/subscriptions/:id`

**Purpose:** Delete a subscription plan.

**Access:** Admin only

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
validate plan id
   ↓
delete plan
   ↓
return success message
```

**Note:** Existing transaction records may still reference the deleted plan ID. In a production system, you may prefer soft delete instead.

---

### 13.16 `POST /api/transactions/purchase`

**Purpose:** Buy a subscription plan.

**Access:** Logged-in user

**Request body:**

```json
{
  "planId": "subscription_plan_id",
  "paymentMethod": "Wallet"
}
```

**Allowed payment methods:**

- `Wallet`
- `e-wallet`
- `credit_card`
- `bank_transfer`

**Internal flow for Wallet:**

```txt
authenticate user
   ↓
validate request body
   ↓
start MongoDB session
   ↓
find plan and user
   ↓
check wallet balance
   ↓
deduct wallet
   ↓
activate premium
   ↓
create invoice with Success status
   ↓
commit session
```

**Internal flow for non-Wallet:**

```txt
authenticate user
   ↓
validate request body
   ↓
find plan and user
   ↓
create invoice with Pending status
   ↓
admin confirms later
```

**What it is for:** This endpoint represents the user's checkout/purchase action.

---

### 13.17 `GET /api/transactions/history`

**Purpose:** Get the logged-in user's own transaction history.

**Access:** Logged-in user

**Internal flow:**

```txt
authenticate token
   ↓
read user id from token
   ↓
find invoices with user_id
   ↓
lookup subscription plan details
   ↓
return user's transaction history
```

**What it is for:** A user can see what plans they bought and whether payments are pending or successful.

---

### 13.18 `GET /api/transactions`

**Purpose:** Get all transactions in the system.

**Access:** Admin only

**Internal flow:**

```txt
authenticate token
   ↓
authorize admin role
   ↓
read all invoices
   ↓
lookup user data
   ↓
lookup subscription plan data
   ↓
hide user password
   ↓
return transaction list
```

**What it is for:** Admin can monitor all purchases and payments.

---

### 13.19 `PUT /api/transactions/:id`

**Purpose:** Update a transaction status or payment method.

**Access:** Admin only

**Example body:**

```json
{
  "status": "Success",
  "payment_method": "bank_transfer"
}
```

**Allowed statuses:**

- `Success`
- `Pending`
- `Failed`

**Internal flow:**

```txt
authenticate admin
   ↓
authorize admin role
   ↓
validate transaction id
   ↓
find existing transaction
   ↓
if changing to Success and old status was not Success:
     activate user's premium subscription
   ↓
update transaction
   ↓
return updated transaction
```

**What it is for:** This simulates payment confirmation for manual payment methods.

---

### 13.20 `DELETE /api/transactions/:id`

**Purpose:** Delete a transaction record.

**Access:** Admin only

**Internal flow:**

```txt
authenticate admin
   ↓
authorize admin role
   ↓
validate transaction id
   ↓
delete invoice
   ↓
return success message
```

---

### 13.21 `GET /api/users`

**Purpose:** Get all users.

**Access:** Admin only

**Internal flow:**

```txt
authenticate admin
   ↓
authorize admin role
   ↓
find all users
   ↓
exclude password field
   ↓
return user list
```

**What it is for:** Admin user management page.

---

### 13.22 `GET /api/users/:id`

**Purpose:** Get one user by ID.

**Access:** Admin only

**Internal flow:**

```txt
authenticate admin
   ↓
authorize admin role
   ↓
validate user id
   ↓
find user
   ↓
exclude password
   ↓
return user detail
```

---

### 13.23 `PUT /api/users/:id`

**Purpose:** Update user data.

**Access:** Admin only

**Example body:**

```json
{
  "username": "updated_user",
  "wallet": 250000,
  "subscription_status": "premium",
  "premium_until": "2026-12-31T00:00:00.000Z"
}
```

**Allowed fields:**

- `role`
- `username`
- `email`
- `password`
- `wallet`
- `subscription_status`
- `premium_until`

**Internal flow:**

```txt
authenticate admin
   ↓
authorize admin role
   ↓
validate user id
   ↓
validate body
   ↓
if email changes, check duplicate email
   ↓
if password changes, hash password
   ↓
update user
   ↓
return updated user without password
```

**What it is for:** Admin can correct user data, top up wallet, change role, or manually adjust premium status.

---

### 13.24 `DELETE /api/users/:id`

**Purpose:** Delete a user.

**Access:** Admin only

**Internal flow:**

```txt
authenticate admin
   ↓
authorize admin role
   ↓
validate user id
   ↓
delete user
   ↓
delete user's reviews
   ↓
delete user's watchlist rows
   ↓
return success message
```

**Why related data is deleted:** If user is deleted, their reviews and watchlist items should not stay as orphan data.

---

### 13.25 `GET /api/reviews/anime/:animeId`

**Purpose:** Get reviews for one anime.

**Access:** Public

**Response includes:**

- Total review count
- Average rating
- Review list
- User data without password

**Internal flow:**

```txt
validate anime id
   ↓
find reviews by anime_id
   ↓
lookup user data
   ↓
hide user password
   ↓
calculate totalReviews and averageRating
   ↓
return summary and data
```

**What it is for:** Display anime review section on an anime detail page.

---

### 13.26 `GET /api/reviews/my`

**Purpose:** Get reviews created by the logged-in user.

**Access:** Logged-in user

**Internal flow:**

```txt
authenticate token
   ↓
read user id from token
   ↓
find reviews by user_id
   ↓
lookup anime data
   ↓
return user's reviews
```

---

### 13.27 `POST /api/reviews`

**Purpose:** Create a review for an anime.

**Access:** Logged-in user

**Request body:**

```json
{
  "anime_id": "anime_id_here",
  "rating": 5,
  "comment": "Great anime and fun to watch."
}
```

**Rules:**

- `anime_id` must be a valid ObjectId.
- Anime must exist.
- `rating` must be between 1 and 5.
- One user can only review the same anime once.

**Internal flow:**

```txt
authenticate token
   ↓
validate body
   ↓
check anime exists
   ↓
check duplicate review
   ↓
insert review
   ↓
return created review
```

---

### 13.28 `PUT /api/reviews/:id`

**Purpose:** Update a review.

**Access:** Review owner or admin

**Example body:**

```json
{
  "rating": 4,
  "comment": "Updated review comment."
}
```

**Internal flow:**

```txt
authenticate token
   ↓
validate review id
   ↓
find review
   ↓
check if requester is owner or admin
   ↓
validate body
   ↓
update review
   ↓
return updated review
```

---

### 13.29 `DELETE /api/reviews/:id`

**Purpose:** Delete a review.

**Access:** Review owner or admin

**Internal flow:**

```txt
authenticate token
   ↓
validate review id
   ↓
find review
   ↓
check if requester is owner or admin
   ↓
delete review
   ↓
return success message
```

---

### 13.30 `GET /api/watchlist`

**Purpose:** Get logged-in user's watchlist.

**Access:** Logged-in user

**Internal flow:**

```txt
authenticate token
   ↓
read user id from token
   ↓
find watchlist items by user_id
   ↓
lookup anime data
   ↓
return watchlist
```

**What it is for:** Display a user's saved anime list.

---

### 13.31 `POST /api/watchlist`

**Purpose:** Add anime to logged-in user's watchlist.

**Access:** Logged-in user

**Request body:**

```json
{
  "anime_id": "anime_id_here",
  "status": "plan_to_watch"
}
```

**Allowed statuses:**

- `plan_to_watch`
- `watching`
- `completed`
- `dropped`

**Internal flow:**

```txt
authenticate token
   ↓
validate body
   ↓
check anime exists
   ↓
check duplicate watchlist item
   ↓
insert watchlist item
   ↓
return created item
```

---

### 13.32 `PUT /api/watchlist/:id`

**Purpose:** Update watchlist status.

**Access:** Watchlist owner or admin

**Request body:**

```json
{
  "status": "completed"
}
```

**Internal flow:**

```txt
authenticate token
   ↓
validate watchlist id
   ↓
find watchlist item
   ↓
check if requester is owner or admin
   ↓
validate status
   ↓
update status
   ↓
return updated item
```

---

### 13.33 `DELETE /api/watchlist/:id`

**Purpose:** Remove anime from watchlist.

**Access:** Watchlist owner or admin

**Internal flow:**

```txt
authenticate token
   ↓
validate watchlist id
   ↓
find watchlist item
   ↓
check if requester is owner or admin
   ↓
delete item
   ↓
return success message
```

---

## 14. CRUD Modules Explanation

This project contains several CRUD modules. CRUD means:

| Letter | Meaning | HTTP Method Usually Used |
| ------ | ------- | ------------------------ |
| C      | Create  | `POST`                   |
| R      | Read    | `GET`                    |
| U      | Update  | `PUT`                    |
| D      | Delete  | `DELETE`                 |

### 14.1 Anime CRUD

Anime CRUD is used by admin to manage the anime catalog.

| CRUD   | Endpoint                               | Purpose            |
| ------ | -------------------------------------- | ------------------ |
| Create | `POST /api/anime`                      | Add a new anime.   |
| Read   | `GET /api/anime`, `GET /api/anime/:id` | View anime data.   |
| Update | `PUT /api/anime/:id`                   | Edit anime data.   |
| Delete | `DELETE /api/anime/:id`                | Remove anime data. |

### 14.2 Subscription Plan CRUD

Subscription CRUD is used by admin to manage premium packages.

| CRUD   | Endpoint                                               | Purpose                    |
| ------ | ------------------------------------------------------ | -------------------------- |
| Create | `POST /api/subscriptions`                              | Add a new premium package. |
| Read   | `GET /api/subscriptions`, `GET /api/subscriptions/:id` | View plans.                |
| Update | `PUT /api/subscriptions/:id`                           | Edit plan data.            |
| Delete | `DELETE /api/subscriptions/:id`                        | Remove plan.               |

### 14.3 Review CRUD

Review CRUD is used by users to rate and comment on anime.

| CRUD   | Endpoint                                                 | Purpose                               |
| ------ | -------------------------------------------------------- | ------------------------------------- |
| Create | `POST /api/reviews`                                      | Create a review.                      |
| Read   | `GET /api/reviews/anime/:animeId`, `GET /api/reviews/my` | Read anime reviews or user's reviews. |
| Update | `PUT /api/reviews/:id`                                   | Update a review.                      |
| Delete | `DELETE /api/reviews/:id`                                | Delete a review.                      |

### 14.4 Watchlist CRUD

Watchlist CRUD is used by users to manage saved anime.

| CRUD   | Endpoint                    | Purpose                      |
| ------ | --------------------------- | ---------------------------- |
| Create | `POST /api/watchlist`       | Add anime to watchlist.      |
| Read   | `GET /api/watchlist`        | View personal watchlist.     |
| Update | `PUT /api/watchlist/:id`    | Update watching status.      |
| Delete | `DELETE /api/watchlist/:id` | Remove anime from watchlist. |

### 14.5 User CRUD

User CRUD is admin-only. It is used for user management.

| CRUD   | Endpoint                               | Purpose             |
| ------ | -------------------------------------- | ------------------- |
| Read   | `GET /api/users`, `GET /api/users/:id` | View user accounts. |
| Update | `PUT /api/users/:id`                   | Edit user data.     |
| Delete | `DELETE /api/users/:id`                | Remove a user.      |

User create is done through `POST /api/auth/register`, not under `/api/users`.

### 14.6 Transaction CRUD

Transaction endpoints handle purchases and admin transaction management.

| CRUD   | Endpoint                                                 | Purpose                           |
| ------ | -------------------------------------------------------- | --------------------------------- |
| Create | `POST /api/transactions/purchase`                        | Create a purchase transaction.    |
| Read   | `GET /api/transactions/history`, `GET /api/transactions` | View own or all transactions.     |
| Update | `PUT /api/transactions/:id`                              | Admin updates transaction status. |
| Delete | `DELETE /api/transactions/:id`                           | Admin deletes transaction record. |

---

## 15. Business Logic Explanation

### 15.1 Premium subscription logic

A user is premium only when both conditions are true:

```txt
subscription_status = "premium"
premium_until > current date
```

If the user has `subscription_status = "premium"` but `premium_until` is already expired, the API changes the user back to:

```txt
subscription_status = "basic"
premium_until = null
```

This check happens when the user tries to watch premium anime.

### 15.2 Free anime vs premium anime

Each anime has an `isPremium` field.

| `isPremium` | Meaning                                                |
| ----------- | ------------------------------------------------------ |
| `false`     | Logged-in user can watch without premium subscription. |
| `true`      | User must have active premium subscription.            |

### 15.3 Wallet payment logic

Wallet payment is immediate.

```txt
User chooses Wallet
   ↓
System checks wallet balance
   ↓
If balance is enough, deduct price
   ↓
Activate premium
   ↓
Create invoice with Success status
```

If wallet balance is not enough, the API returns an error and does not create a successful transaction.

### 15.4 Non-wallet payment logic

Non-wallet payment is simulated as pending.

```txt
User chooses bank_transfer / credit_card / e-wallet
   ↓
System creates invoice with Pending status
   ↓
Admin manually confirms later
   ↓
When admin sets status to Success, premium is activated
```

### 15.5 Premium extension logic

The function `calculatePremiumUntil` is used to calculate the new premium end date.

If the user is currently premium:

```txt
new premium date = current premium_until + plan duration
```

If the user is not currently premium:

```txt
new premium date = today + plan duration
```

### 15.6 Duplicate review prevention

The same user cannot review the same anime twice. This keeps rating data cleaner.

```txt
user_id + anime_id must be unique logically
```

If the user wants to change the review, they should use `PUT /api/reviews/:id`.

### 15.7 Duplicate watchlist prevention

The same user cannot add the same anime twice to the watchlist. If the user wants to change progress, they should update the existing item.

---

## 16. Middleware Flow

Middleware is code that runs before the controller.

### 16.1 `authenticate`

Used for protected routes.

```txt
read Authorization header
   ↓
extract Bearer token
   ↓
verify token using JWT_SECRET
   ↓
store decoded user in req.user
   ↓
continue to next middleware/controller
```

If token is missing or invalid, returns `401 Unauthorized`.

### 16.2 `authorize(["admin"])`

Used for admin-only routes.

```txt
check req.user.role
   ↓
if role is admin, continue
   ↓
if not admin, return 403
```

### 16.3 `validate(schema)`

Used to validate request bodies.

```txt
receive req.body
   ↓
validate with Joi schema
   ↓
convert strings to numbers/booleans when possible
   ↓
remove unknown fields
   ↓
continue to controller
```

### 16.4 `upload.single("coverImage")`

Used for anime image upload.

```txt
read multipart/form-data
   ↓
check file type
   ↓
check file size
   ↓
save file to uploads folder
   ↓
store file info in req.file
```

---

## 17. Validation Rules

### 17.1 Register validation

| Field      | Rule                                 |
| ---------- | ------------------------------------ |
| `username` | Required, minimum 3 characters.      |
| `email`    | Required, valid email.               |
| `password` | Required, minimum 6 characters.      |
| `role`     | Optional, must be `user` or `admin`. |

### 17.2 Login validation

| Field      | Rule                   |
| ---------- | ---------------------- |
| `email`    | Required, valid email. |
| `password` | Required.              |

### 17.3 Anime validation

Create anime requires:

- `title`
- `synopsis`
- `episodes`

Optional fields:

- `isPremium`
- `type`

### 17.4 Subscription validation

Create subscription requires:

- `plan_name`
- `price`
- `duration_days`

### 17.5 Transaction validation

Purchase requires:

- `planId`
- `paymentMethod`

Allowed payment methods:

- `Wallet`
- `e-wallet`
- `credit_card`
- `bank_transfer`

### 17.6 Review validation

Create review requires:

- `anime_id`
- `rating`

Rating must be an integer from `1` to `5`.

### 17.7 Watchlist validation

Create watchlist requires:

- `anime_id`

Allowed statuses:

- `plan_to_watch`
- `watching`
- `completed`
- `dropped`

---

## 18. File Upload Rules

Anime cover image upload uses multer.

Allowed file extensions:

- `.jpeg`
- `.jpg`
- `.png`
- `.webp`

Maximum size:

```txt
5 MB
```

Uploaded files are stored in:

```txt
uploads/
```

Uploaded files can be accessed through:

```txt
/uploads/filename.jpg
```

Example:

```txt
http://localhost:3000/uploads/one-piece-1783064070109.jpeg
```

---

## 19. Postman Collection Testing

The project includes a complete Postman collection:

```txt
wawa.json
```

The collection is named:

```txt
Anime Subscription API - Complete Endpoint Testing
```

It is prepared to test:

- Root endpoint
- Auth register and login
- Anime CRUD
- Jikan API search
- Watch anime access check
- Subscription CRUD
- Transaction purchase and admin confirmation
- User admin endpoints
- Review CRUD
- Watchlist CRUD
- Cleanup/delete endpoints

### 19.1 Before importing the collection

Install dependencies, configure `.env`, seed the database, and start the server.

```bash
npm install
cp .env.example .env
npm run seed
npm start
```

The collection assumes the API is running at:

```txt
http://localhost:3000
```

If your server uses a different port, update the `base_url` variable in Postman.

### 19.2 How to import

1. Open Postman.
2. Click **Import**.
3. Choose `wawa.json`.
4. Open the imported collection.
5. Check the **Variables** tab.
6. Make sure `base_url` is `http://localhost:3000`.
7. Save the collection.

### 19.3 Collection variables

| Variable                  | Purpose                                 |
| ------------------------- | --------------------------------------- |
| `base_url`                | Base API URL.                           |
| `admin_email`             | Seeded admin email.                     |
| `user_email`              | Seeded user email.                      |
| `test_password`           | Seeded password.                        |
| `admin_token`             | Saved after admin login.                |
| `user_token`              | Saved after user login.                 |
| `anime_id`                | Saved anime ID for testing.             |
| `created_anime_id`        | Anime ID created by collection test.    |
| `premium_anime_id`        | Premium anime ID for watch access test. |
| `subscription_id`         | Subscription plan ID.                   |
| `created_subscription_id` | Plan ID created by collection test.     |
| `transaction_id`          | Transaction ID.                         |
| `created_transaction_id`  | Transaction created by purchase test.   |
| `review_id`               | Review ID created by test.              |
| `watchlist_id`            | Watchlist ID created by test.           |

### 19.4 Recommended Postman run order

Run the folders in this order:

| Order | Folder                                | Purpose                                           |
| ----: | ------------------------------------- | ------------------------------------------------- |
|     1 | `00. Health Check`                    | Confirms the server is running.                   |
|     2 | `01. Auth`                            | Registers test user and logs in admin/user.       |
|     3 | `02. Load Seed Data IDs`              | Saves important IDs into variables.               |
|     4 | `03. Anime Endpoints`                 | Tests anime routes.                               |
|     5 | `04. Subscription Plan Endpoints`     | Tests subscription routes.                        |
|     6 | `05. Transaction Endpoints`           | Tests purchase/history/admin transaction routes.  |
|     7 | `06. Review Endpoints`                | Tests review CRUD.                                |
|     8 | `07. Watchlist Endpoints`             | Tests watchlist CRUD.                             |
|     9 | `08. User Endpoints (Admin)`          | Tests user management.                            |
|    10 | `09. Cleanup / Delete Endpoint Tests` | Tests delete endpoints and cleans temporary data. |

### 19.5 Testing image upload in Postman

The anime create/update requests use `multipart/form-data`.

By default, the `coverImage` row may be disabled so the request can run without a local file. To test upload:

1. Open `Create Anime (Admin) - Save Created Anime ID`.
2. Go to **Body**.
3. Choose **form-data**.
4. Enable the `coverImage` row.
5. Select an image from your computer.
6. Send the request.

---

## 20. Recommended Manual Testing Flow

Use this flow if you want to test without the full collection runner.

### Step 1: Seed and start

```bash
npm run seed
npm start
```

### Step 2: Check server

```txt
GET /
```

### Step 3: Login as admin

```txt
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@stts.edu",
  "password": "wawa123"
}
```

Copy `token` as `admin_token`.

### Step 4: Login as user

```txt
POST /api/auth/login
```

Body:

```json
{
  "email": "user@stts.edu",
  "password": "wawa123"
}
```

Copy `token` as `user_token`.

### Step 5: Get anime list

```txt
GET /api/anime
```

Copy one anime `_id`.

### Step 6: Get subscription plans

```txt
GET /api/subscriptions
```

Copy one plan `_id`.

### Step 7: Buy subscription

```txt
POST /api/transactions/purchase
Authorization: Bearer <user_token>
```

Body:

```json
{
  "planId": "plan_id_here",
  "paymentMethod": "Wallet"
}
```

### Step 8: Watch anime

```txt
GET /api/anime/:id/watch
Authorization: Bearer <user_token>
```

### Step 9: Create review

```txt
POST /api/reviews
Authorization: Bearer <user_token>
```

Body:

```json
{
  "anime_id": "anime_id_here",
  "rating": 5,
  "comment": "This anime is very good."
}
```

### Step 10: Add to watchlist

```txt
POST /api/watchlist
Authorization: Bearer <user_token>
```

Body:

```json
{
  "anime_id": "anime_id_here",
  "status": "watching"
}
```

### Step 11: Test admin CRUD

Use `admin_token` to test:

```txt
POST /api/anime
PUT /api/anime/:id
DELETE /api/anime/:id
POST /api/subscriptions
PUT /api/subscriptions/:id
DELETE /api/subscriptions/:id
GET /api/users
GET /api/transactions
```

---

## 21. Common Response Status Codes

|                      Status | Meaning                                   | Example Situation                                     |
| --------------------------: | ----------------------------------------- | ----------------------------------------------------- |
|                    `200 OK` | Request successful.                       | Login, get list, update, delete.                      |
|               `201 Created` | New data created.                         | Register, create anime, create review, purchase.      |
|           `400 Bad Request` | Invalid input.                            | Invalid ObjectId, validation error, duplicate review. |
|          `401 Unauthorized` | Missing or invalid token.                 | Protected route without token.                        |
|             `403 Forbidden` | Token valid, but role/access not allowed. | Normal user accesses admin endpoint.                  |
|             `404 Not Found` | Requested data does not exist.            | Anime ID not found.                                   |
| `500 Internal Server Error` | Server/database error.                    | Unexpected backend error.                             |
|           `502 Bad Gateway` | External API call failed.                 | Jikan API request failed.                             |

---

## 22. Important Fixes in This Version

This version includes fixes and improvements:

1. Fixed `proccess.env.MONGO_URI` to `process.env.MONGO_URI`.
2. Added fallback port using `process.env.PORT || 3000`.
3. Added required checks for `MONGO_URI` and `JWT_SECRET`.
4. Added MongoDB ObjectId validation.
5. Improved anime create/update validation.
6. Improved type conversion for numbers and booleans from request bodies.
7. Prevented user passwords from being returned in user endpoints.
8. Added `GET /api/users/:id`.
9. Added `GET /api/subscriptions/:id`.
10. Added Review CRUD.
11. Added Watchlist CRUD.
12. Added cleanup logic when anime or users are deleted.
13. Fixed transaction logic for wallet and pending payment methods.
14. Added premium extension logic.
15. Removed hardcoded MongoDB URI from seeder.
16. Added `.env.example`.
17. Updated Postman collection to test all endpoints.
18. Expanded README with detailed endpoint and program flow explanations.

---

## 23. Possible Future Improvements

This project can be improved further with:

1. Episode CRUD for individual anime episodes.
2. Real video URL storage instead of fake watch URLs.
3. Payment gateway integration.
4. User profile endpoint for users to update their own profile.
5. Refresh token system.
6. Pagination for anime, reviews, watchlists, users, and transactions.
7. Search/filter/sort for local anime database.
8. Cloud image upload using Cloudinary or similar services.
9. Soft delete for important records.
10. Swagger/OpenAPI documentation.
11. Unit and integration tests.
12. Stronger production security for admin registration.

---

## 24. Conclusion

Anime Subscription API is a backend web service for an anime streaming subscription platform. It demonstrates many important backend concepts:

- REST API design
- CRUD operations
- Authentication using JWT
- Role-based authorization
- MongoDB database operations
- Request validation
- File upload
- Third-party API integration
- Transaction and subscription business logic
- User-generated reviews
- Personal watchlist management

The main program flow is simple:

```txt
User registers/logs in
   ↓
User browses anime and subscription plans
   ↓
User buys premium subscription
   ↓
System activates premium access
   ↓
User can watch premium anime
   ↓
User can review anime and manage watchlist
   ↓
Admin manages anime, plans, users, and transactions
```

This makes the project suitable for demonstrating a complete Express.js and MongoDB REST API with multiple CRUD modules and realistic backend logic.
