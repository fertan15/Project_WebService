# Anime Subscription API

Anime Subscription API is a REST API project built with **Node.js**, **Express.js**, and **MongoDB**. The project simulates a simple backend system for an anime streaming/subscription platform where users can register, login, browse anime, buy premium subscription plans, watch premium anime if their subscription is active, review anime, and manage their personal watchlist.

This project also includes several CRUD modules, role-based access control, JWT authentication, file upload for anime cover images, third-party API integration using Jikan API, and database seeding for testing.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Main Features](#main-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Seeded Test Accounts](#seeded-test-accounts)
- [Postman Collection Testing](#postman-collection-testing)
- [Authentication and Authorization](#authentication-and-authorization)
- [Database Collections](#database-collections)
- [API Endpoint Documentation](#api-endpoint-documentation)
  - [Root Endpoint](#root-endpoint)
  - [Auth Endpoints](#auth-endpoints)
  - [Anime Endpoints](#anime-endpoints)
  - [Subscription Plan Endpoints](#subscription-plan-endpoints)
  - [Transaction Endpoints](#transaction-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Review Endpoints](#review-endpoints)
  - [Watchlist Endpoints](#watchlist-endpoints)
- [CRUD Explanation](#crud-explanation)
- [Business Logic Explanation](#business-logic-explanation)
- [Validation Rules](#validation-rules)
- [File Upload Rules](#file-upload-rules)
- [Example Testing Flow](#example-testing-flow)
- [Important Fixes in This Version](#important-fixes-in-this-version)
- [Possible Future Improvements](#possible-future-improvements)

---

## Project Purpose

The goal of this project is to create a backend API for an anime subscription platform. The platform has two types of users:

1. **Regular users** who can register, login, browse anime, buy premium plans, create reviews, and manage their watchlist.
2. **Admin users** who can manage anime data, subscription plans, users, and transactions.

The system demonstrates common backend concepts such as:

- REST API routing
- CRUD operations
- JWT authentication
- Role-based authorization
- MongoDB database operations
- Data validation using Joi
- Password hashing using bcrypt
- Image upload using multer
- External API integration
- Transaction and subscription logic

---

## Main Features

### 1. Authentication

Users can register and login. Passwords are hashed before being stored in the database. After login, the API returns a JWT token that must be used for protected routes.

### 2. Role-Based Access Control

There are two roles:

- `user`
- `admin`

Normal users can access user-level features. Admin users can manage master data such as anime, subscription plans, users, and transaction records.

### 3. Anime CRUD

Admins can create, read, update, and delete anime. Anime data can include title, synopsis, episode count, anime type, premium status, and cover image.

### 4. Subscription Plan CRUD

Admins can create, read, update, and delete subscription plans. Plans define the name, price, duration, and description of premium access.

### 5. Transaction System

Users can buy subscription plans. If the payment method is `Wallet`, the payment is processed immediately and the user's premium access is activated. If the payment method is another method, the transaction becomes `Pending` until an admin updates it to `Success`.

### 6. Premium Watch Access

Anime can be marked as premium. If an anime is premium, only users with an active premium subscription can watch it.

### 7. Review CRUD

Users can create, read, update, and delete reviews for anime. Each user can only review the same anime once. Users can update or delete their own reviews, while admins can also modify review data.

### 8. Watchlist CRUD

Users can add anime to their personal watchlist and update their watching status. The available statuses are:

- `plan_to_watch`
- `watching`
- `completed`
- `dropped`

### 9. Jikan API Integration

The project includes an endpoint to search anime from the public Jikan API. This is used as a third-party API integration feature.

### 10. Seeder

The project includes a database seeder that creates sample users, anime, subscription plans, invoices, reviews, and watchlist data.

---

## Tech Stack

| Technology   | Purpose                                 |
| ------------ | --------------------------------------- |
| Node.js      | JavaScript runtime                      |
| Express.js   | Backend web framework                   |
| MongoDB      | NoSQL database                          |
| Mongoose     | MongoDB connection and session handling |
| bcrypt       | Password hashing                        |
| jsonwebtoken | JWT token creation and verification     |
| Joi          | Request body validation                 |
| multer       | Image/file upload                       |
| axios        | Calling the external Jikan API          |
| dotenv       | Loading environment variables           |

---

## Project Structure

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

### Folder Explanation

| Folder/File             | Explanation                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`              | Main application entry point. It loads environment variables, connects to MongoDB, registers middleware, and starts the server. |
| `src/routes`            | Contains route definitions for each module.                                                                                     |
| `src/controllers`       | Contains the business logic for each endpoint.                                                                                  |
| `src/Schema`            | Contains Joi validation schemas for request bodies.                                                                             |
| `src/middlewares`       | Contains authentication, authorization, upload, and validation middleware.                                                      |
| `src/config/db.js`      | Contains database seeding logic.                                                                                                |
| `src/utils/objectId.js` | Helper for validating and converting MongoDB ObjectId values.                                                                   |
| `uploads`               | Stores uploaded anime cover images.                                                                                             |
| `wawa.json`             | Postman collection for testing all API endpoints.                                                                               |

---

## Environment Variables

Create a `.env` file in the project root. You can copy the example file:

```bash
cp .env.example .env
```

Example `.env` content:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/anime_subscription_db
JWT_SECRET=change_this_secret
```

### Environment Variable Explanation

| Variable     | Required | Explanation                                                       |
| ------------ | -------: | ----------------------------------------------------------------- |
| `PORT`       |       No | Port used to run the server. If empty, the app uses `3000`.       |
| `MONGO_URI`  |      Yes | MongoDB connection string. Can be MongoDB Atlas or local MongoDB. |
| `JWT_SECRET` |      Yes | Secret key used to sign and verify JWT tokens.                    |

---

## Installation and Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` and fill in `MONGO_URI` and `JWT_SECRET`.

```bash
cp .env.example .env
```

Then edit the `.env` file.

### 3. Seed the database

Run this command to insert sample data:

```bash
npm run seed
```

The seeder will clear old sample collections and insert default test data.

### 4. Start the server

```bash
npm start
```

If the server runs successfully, you should see a message similar to:

```txt
✅ Connected to MongoDB via Mongoose! Silakan cek di Compass.
🚀 Server berjalan di http://localhost:3000
```

### 5. Test root endpoint

Open this URL in a browser or Postman:

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

## Seeded Test Accounts

After running `npm run seed`, these accounts are available:

| Role         | Email            | Password  | Description                                       |
| ------------ | ---------------- | --------- | ------------------------------------------------- |
| Admin        | `admin@stts.edu` | `wawa123` | Can manage anime, plans, users, and transactions. |
| Premium User | `user@stts.edu`  | `wawa123` | Has wallet balance and active premium access.     |
| Basic User   | `basic@stts.edu` | `wawa123` | Has wallet balance but no premium access.         |

Use the login endpoint to get a token:

```txt
POST /api/auth/login
```

Then put the token in the request header for protected routes:

```txt
Authorization: Bearer <your_token_here>
```

---

## Postman Collection Testing

The project includes a complete Postman collection file:

```txt
wawa.json
```

This collection is prepared to test **all endpoints** in the project, including:

- Root health check
- Auth register and login
- Anime endpoints and Anime CRUD
- Subscription Plan CRUD
- Transaction CRUD
- User CRUD
- Review CRUD
- Watchlist CRUD
- Delete/cleanup endpoint tests

### Before Importing the Collection

Make sure the project is already installed and configured.

```bash
npm install
cp .env.example .env
```

Fill your `.env` file with your MongoDB URI and JWT secret.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Then run the seeder and start the server:

```bash
npm run seed
npm start
```

The collection assumes the API is running at:

```txt
http://localhost:3000
```

If your server uses another port, change the `base_url` collection variable in Postman.

### How to Import the Collection

1. Open Postman.
2. Click **Import**.
3. Choose the file `wawa.json`.
4. Open the imported collection named **Anime Subscription API - Complete Endpoint Testing**.
5. Go to the collection **Variables** tab.
6. Confirm that `base_url` is set to `http://localhost:3000`.
7. Save the collection.

### Collection Variables

The collection uses variables so you do not need to manually copy every ID and token.

| Variable                  | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `base_url`                | Base API URL, default `http://localhost:3000`.             |
| `admin_email`             | Seeded admin email, default `admin@stts.edu`.              |
| `user_email`              | Seeded user email, default `user@stts.edu`.                |
| `test_password`           | Seeded password, default `wawa123`.                        |
| `admin_token`             | Saved automatically after admin login.                     |
| `user_token`              | Saved automatically after user login.                      |
| `admin_user_id`           | Saved automatically after admin login.                     |
| `user_id`                 | Saved automatically after user login or user list request. |
| `registered_user_id`      | Saved after the temporary register request.                |
| `anime_id`                | Saved from seeded anime or created anime.                  |
| `created_anime_id`        | Saved after creating anime through Postman.                |
| `premium_anime_id`        | Saved from seeded premium anime.                           |
| `subscription_id`         | Saved from seeded subscription plans.                      |
| `created_subscription_id` | Saved after creating a temporary subscription plan.        |
| `transaction_id`          | Saved from transaction response/list.                      |
| `created_transaction_id`  | Saved after purchasing a plan through Postman.             |
| `review_id`               | Saved after creating a review.                             |
| `watchlist_id`            | Saved after adding anime to watchlist.                     |

### Recommended Collection Run Order

The collection is organized in this order:

| Folder                                | Purpose                                                           |
| ------------------------------------- | ----------------------------------------------------------------- |
| `00. Health Check`                    | Confirms the server is running.                                   |
| `01. Auth`                            | Registers a temporary user, logs in admin, and logs in user.      |
| `02. Load Seed Data IDs`              | Loads seeded anime, subscription, and user IDs into variables.    |
| `03. Anime Endpoints`                 | Tests Jikan search, anime read, create, update, and watch access. |
| `04. Subscription Plan Endpoints`     | Tests subscription plan read, create, and update.                 |
| `05. Transaction Endpoints`           | Tests purchase, transaction history, admin list, and update.      |
| `06. Review Endpoints`                | Tests review read, create, and update.                            |
| `07. Watchlist Endpoints`             | Tests watchlist read, create, and update.                         |
| `08. User Endpoints (Admin)`          | Tests admin user read and update.                                 |
| `09. Cleanup / Delete Endpoint Tests` | Tests delete endpoints and removes temporary data.                |

Run the folders from top to bottom. This matters because later requests depend on variables created by earlier requests.

### Important Testing Notes

1. **Run `npm run seed` before a full test run.**  
   This resets the database and creates clean sample data.

2. **Run Auth first.**  
   Protected routes need either `admin_token` or `user_token`.

3. **Do not skip `02. Load Seed Data IDs`.**  
   This folder saves important IDs such as `subscription_id`, `anime_id`, and `premium_anime_id`.

4. **The collection creates temporary data.**  
   It creates a temporary user, anime, subscription plan, transaction, review, and watchlist item.

5. **Run the cleanup folder at the end.**  
   The cleanup folder tests all delete endpoints and removes temporary data from the database.

6. **If you run only one request manually, make sure its variables already exist.**  
   For example, `GET /api/anime/{{created_anime_id}}` requires the create anime request to run first.

7. **If a duplicate review or watchlist error appears, run the seeder again.**  
   The API prevents one user from reviewing or adding the same anime twice.

### Testing Authentication in Postman

The collection already uses Bearer Token authentication.

Admin-only requests use:

```txt
{{admin_token}}
```

User requests use:

```txt
{{user_token}}
```

These are filled automatically by:

```txt
Login Admin - Save Admin Token
Login User - Save User Token
```

### Testing Anime Image Upload

The anime create and update requests use `multipart/form-data` because the API supports optional image upload.

By default, the `coverImage` file field is disabled so the request can run without choosing a local file.

To test image upload:

1. Open `Create Anime (Admin) - Save Created Anime ID`.
2. Go to **Body**.
3. Choose **form-data**.
4. Enable the `coverImage` row.
5. Select an image file from your computer.
6. Send the request.

Allowed image formats:

```txt
jpeg, jpg, png, webp
```

Maximum file size:

```txt
5 MB
```

### Expected Successful Status Codes

| Endpoint Type                              | Expected Status    |
| ------------------------------------------ | ------------------ |
| Successful `GET`                           | `200 OK`           |
| Successful `POST` create/register/purchase | `201 Created`      |
| Successful `PUT` update                    | `200 OK`           |
| Successful `DELETE`                        | `200 OK`           |
| Unauthorized request without token         | `401 Unauthorized` |
| Normal user accessing admin endpoint       | `403 Forbidden`    |
| Invalid MongoDB ObjectId                   | `400 Bad Request`  |
| Data not found                             | `404 Not Found`    |

### Quick Full Test Checklist

Use this checklist to test the whole project quickly:

1. `npm run seed`
2. `npm start`
3. Import `wawa.json` into Postman.
4. Run `00. Health Check`.
5. Run `01. Auth`.
6. Run `02. Load Seed Data IDs`.
7. Run `03` until `08` from top to bottom.
8. Run `09. Cleanup / Delete Endpoint Tests`.
9. Confirm every request returns a successful status code.

---

## Authentication and Authorization

### Authentication

Authentication is handled using JWT. Protected routes require this header:

```txt
Authorization: Bearer <token>
```

The token contains basic user information such as:

```json
{
  "id": "user_id",
  "role": "user",
  "email": "user@example.com"
}
```

### Authorization

Some endpoints require the user to have the `admin` role. For example:

- Creating anime
- Updating anime
- Deleting anime
- Creating subscription plans
- Managing users
- Viewing all transactions

If a normal user tries to access an admin-only endpoint, the API returns `403 Forbidden`.

---

## Database Collections

The project uses MongoDB collections directly through `mongoose.connection.db`.

### 1. `users`

Stores user account data.

Example document:

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
| `role`                | Determines whether the user is a normal user or admin. |
| `wallet`              | User balance for wallet payments.                      |
| `subscription_status` | Either `basic` or `premium`.                           |
| `premium_until`       | Date when premium access expires.                      |

### 2. `animes`

Stores anime data.

Example document:

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

### 3. `subscriptionplans`

Stores subscription plan data.

Example document:

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

### 4. `invoices`

Stores subscription purchase transactions.

Example document:

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

### 5. `reviews`

Stores user reviews for anime.

Example document:

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

### 6. `watchlists`

Stores anime saved by users.

Example document:

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

## API Endpoint Documentation

Base URL:

```txt
http://localhost:3000
```

If your `.env` uses another port, replace `3000` with your port.

---

## Root Endpoint

### Check API Status

```txt
GET /
```

This endpoint checks whether the API is running and returns the main route list.

---

## Auth Endpoints

### Register User

```txt
POST /api/auth/register
```

Access: Public

Request body:

```json
{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

Notes:

- `role` is optional.
- If role is not provided, it defaults to `user`.
- Password is hashed before being stored.

Success response:

```json
{
  "message": "User registered successfully",
  "userId": "generated_user_id"
}
```

### Login User

```txt
POST /api/auth/login
```

Access: Public

Request body:

```json
{
  "email": "user@stts.edu",
  "password": "wawa123"
}
```

Success response:

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "wawa_user",
    "email": "user@stts.edu",
    "role": "user",
    "wallet": 500000,
    "subscription_status": "premium",
    "premium_until": "Date"
  }
}
```

---

## Anime Endpoints

### Search Anime from Jikan API

```txt
GET /api/anime/jikan/search?q=naruto
```

Access: Public

This endpoint searches anime from the external Jikan API.

Query parameter:

| Parameter | Required | Explanation     |
| --------- | -------: | --------------- |
| `q`       |      Yes | Search keyword. |

### Get All Anime

```txt
GET /api/anime
```

Access: Public

Returns all anime stored in the local database.

### Get Anime by ID

```txt
GET /api/anime/:id
```

Access: Public

Returns one anime by MongoDB ObjectId.

### Create Anime

```txt
POST /api/anime
```

Access: Admin only

Headers:

```txt
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

Form-data fields:

| Field        | Type    | Required | Explanation                                      |
| ------------ | ------- | -------: | ------------------------------------------------ |
| `title`      | text    |      Yes | Anime title.                                     |
| `synopsis`   | text    |      Yes | Anime description.                               |
| `episodes`   | number  |      Yes | Total episode count.                             |
| `isPremium`  | boolean |       No | Whether anime requires premium access.           |
| `type`       | text    |       No | Anime type, for example `TV`, `Movie`, or `OVA`. |
| `coverImage` | file    |       No | Anime cover image.                               |

### Update Anime

```txt
PUT /api/anime/:id
```

Access: Admin only

Headers:

```txt
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

You can update one or more anime fields.

### Delete Anime

```txt
DELETE /api/anime/:id
```

Access: Admin only

When anime is deleted, related reviews and watchlist items are also deleted so there are no broken references.

### Watch Anime

```txt
GET /api/anime/:id/watch
```

Access: Logged-in user

This endpoint checks whether the user is allowed to watch the anime.

Logic:

- If anime is not premium, any logged-in user can watch it.
- If anime is premium, the user must have `subscription_status: "premium"` and `premium_until` must not be expired.
- If premium is expired, the API automatically changes the user back to `basic`.

---

## Subscription Plan Endpoints

### Get All Subscription Plans

```txt
GET /api/subscriptions
```

Access: Public

Returns all subscription plans sorted by price.

### Get Subscription Plan by ID

```txt
GET /api/subscriptions/:id
```

Access: Public

Returns one subscription plan by ID.

### Create Subscription Plan

```txt
POST /api/subscriptions
```

Access: Admin only

Request body:

```json
{
  "plan_name": "1 Month Premium Access",
  "price": 50000,
  "duration_days": 30,
  "description": "Akses penuh premium 30 hari."
}
```

### Update Subscription Plan

```txt
PUT /api/subscriptions/:id
```

Access: Admin only

Request body example:

```json
{
  "price": 55000,
  "description": "Updated premium package."
}
```

### Delete Subscription Plan

```txt
DELETE /api/subscriptions/:id
```

Access: Admin only

Deletes a subscription plan from the database.

---

## Transaction Endpoints

### Purchase Subscription Plan

```txt
POST /api/transactions/purchase
```

Access: Logged-in user

Request body:

```json
{
  "planId": "subscription_plan_id",
  "paymentMethod": "Wallet"
}
```

Allowed payment methods:

- `Wallet`
- `e-wallet`
- `credit_card`
- `bank_transfer`

Logic:

- If `paymentMethod` is `Wallet`, the system checks the user's wallet balance.
- If the wallet balance is enough, the balance is reduced and premium access is activated immediately.
- If the payment method is not `Wallet`, the transaction is created as `Pending`.
- Admin can later update the transaction status to `Success`.

### Get My Transaction History

```txt
GET /api/transactions/history
```

Access: Logged-in user

Returns the transaction history of the currently logged-in user.

### Get All Transactions

```txt
GET /api/transactions
```

Access: Admin only

Returns all transaction records with user and subscription plan details.

### Update Transaction

```txt
PUT /api/transactions/:id
```

Access: Admin only

Request body:

```json
{
  "status": "Success",
  "payment_method": "bank_transfer"
}
```

Allowed status values:

- `Success`
- `Pending`
- `Failed`

If a pending transaction is updated to `Success`, the system activates the user's premium subscription.

### Delete Transaction

```txt
DELETE /api/transactions/:id
```

Access: Admin only

Deletes a transaction record.

---

## User Endpoints

All user management endpoints are admin-only.

### Get All Users

```txt
GET /api/users
```

Access: Admin only

Returns all users without showing passwords.

### Get User by ID

```txt
GET /api/users/:id
```

Access: Admin only

Returns one user without showing password.

### Update User

```txt
PUT /api/users/:id
```

Access: Admin only

Request body example:

```json
{
  "username": "updated_user",
  "wallet": 250000,
  "subscription_status": "premium",
  "premium_until": "2026-12-31T00:00:00.000Z"
}
```

Allowed fields:

- `role`
- `username`
- `email`
- `password`
- `wallet`
- `subscription_status`
- `premium_until`

If password is updated, it is hashed before being stored.

### Delete User

```txt
DELETE /api/users/:id
```

Access: Admin only

When a user is deleted, related reviews and watchlist items are also deleted.

---

## Review Endpoints

Review CRUD allows users to give ratings and comments to anime.

### Get Reviews by Anime

```txt
GET /api/reviews/anime/:animeId
```

Access: Public

Returns all reviews for one anime, including summary data:

```json
{
  "summary": {
    "totalReviews": 1,
    "averageRating": 5
  },
  "data": []
}
```

### Get My Reviews

```txt
GET /api/reviews/my
```

Access: Logged-in user

Returns reviews created by the currently logged-in user.

### Create Review

```txt
POST /api/reviews
```

Access: Logged-in user

Request body:

```json
{
  "anime_id": "anime_id_here",
  "rating": 5,
  "comment": "Great anime and fun to watch."
}
```

Rules:

- `rating` must be between `1` and `5`.
- `anime_id` must be valid.
- The anime must exist.
- One user can only review the same anime once.

### Update Review

```txt
PUT /api/reviews/:id
```

Access: Review owner or admin

Request body:

```json
{
  "rating": 4,
  "comment": "Updated review comment."
}
```

### Delete Review

```txt
DELETE /api/reviews/:id
```

Access: Review owner or admin

Deletes the review.

---

## Watchlist Endpoints

Watchlist CRUD allows users to save anime and track their watching progress.

### Get My Watchlist

```txt
GET /api/watchlist
```

Access: Logged-in user

Returns the watchlist of the currently logged-in user with anime details.

### Add Anime to Watchlist

```txt
POST /api/watchlist
```

Access: Logged-in user

Request body:

```json
{
  "anime_id": "anime_id_here",
  "status": "plan_to_watch"
}
```

Allowed status values:

- `plan_to_watch`
- `watching`
- `completed`
- `dropped`

Rules:

- The anime must exist.
- The same anime cannot be added twice by the same user.

### Update Watchlist Item

```txt
PUT /api/watchlist/:id
```

Access: Watchlist owner or admin

Request body:

```json
{
  "status": "completed"
}
```

### Delete Watchlist Item

```txt
DELETE /api/watchlist/:id
```

Access: Watchlist owner or admin

Deletes one anime from the user's watchlist.

---

## CRUD Explanation

This project contains multiple CRUD modules.

### 1. Anime CRUD

Anime CRUD is used by admin to manage anime content.

| Operation | Endpoint                               | Explanation        |
| --------- | -------------------------------------- | ------------------ |
| Create    | `POST /api/anime`                      | Add new anime.     |
| Read      | `GET /api/anime`, `GET /api/anime/:id` | View anime data.   |
| Update    | `PUT /api/anime/:id`                   | Edit anime data.   |
| Delete    | `DELETE /api/anime/:id`                | Remove anime data. |

### 2. Subscription Plan CRUD

Subscription Plan CRUD is used by admin to manage available premium plans.

| Operation | Endpoint                                               | Explanation                |
| --------- | ------------------------------------------------------ | -------------------------- |
| Create    | `POST /api/subscriptions`                              | Add new subscription plan. |
| Read      | `GET /api/subscriptions`, `GET /api/subscriptions/:id` | View plans.                |
| Update    | `PUT /api/subscriptions/:id`                           | Edit plan data.            |
| Delete    | `DELETE /api/subscriptions/:id`                        | Remove plan.               |

### 3. Review CRUD

Review CRUD is used by users to rate and comment on anime.

| Operation | Endpoint                                                 | Explanation    |
| --------- | -------------------------------------------------------- | -------------- |
| Create    | `POST /api/reviews`                                      | Add review.    |
| Read      | `GET /api/reviews/anime/:animeId`, `GET /api/reviews/my` | View reviews.  |
| Update    | `PUT /api/reviews/:id`                                   | Edit review.   |
| Delete    | `DELETE /api/reviews/:id`                                | Delete review. |

### 4. Watchlist CRUD

Watchlist CRUD is used by users to manage saved anime.

| Operation | Endpoint                    | Explanation                  |
| --------- | --------------------------- | ---------------------------- |
| Create    | `POST /api/watchlist`       | Add anime to watchlist.      |
| Read      | `GET /api/watchlist`        | View personal watchlist.     |
| Update    | `PUT /api/watchlist/:id`    | Update watch status.         |
| Delete    | `DELETE /api/watchlist/:id` | Remove anime from watchlist. |

---

## Business Logic Explanation

### Premium Subscription Logic

The project uses `subscription_status` and `premium_until` to determine premium access.

A user is considered premium if:

```txt
subscription_status = "premium"
AND premium_until is later than the current date
```

If the user tries to watch premium anime but their premium date is expired, the system automatically changes them back to:

```txt
subscription_status = "basic"
premium_until = null
```

### Wallet Payment Logic

When the user buys a plan using `Wallet`:

1. The system checks whether the user's wallet balance is enough.
2. If enough, the plan price is deducted from the wallet.
3. The subscription is activated immediately.
4. The invoice status becomes `Success`.

### Non-Wallet Payment Logic

When the user buys a plan using `e-wallet`, `credit_card`, or `bank_transfer`:

1. The system creates an invoice.
2. The invoice status becomes `Pending`.
3. Admin must update the transaction to `Success`.
4. When updated to `Success`, the user's premium subscription is activated.

### Premium Extension Logic

If a premium user buys another plan before the old premium expires, the new duration is added after the current `premium_until` date instead of replacing it.

Example:

```txt
Current premium_until: 2026-08-01
Bought 30-day plan
New premium_until: 2026-08-31
```

---

## Validation Rules

Validation is handled using Joi middleware.

### Auth Validation

Register requires:

- `username`
- `email`
- `password`

Login requires:

- `email`
- `password`

### Anime Validation

Create anime requires:

- `title`
- `synopsis`
- `episodes`

Optional fields:

- `isPremium`
- `type`

### Subscription Validation

Create subscription requires:

- `plan_name`
- `price`
- `duration_days`

### Review Validation

Create review requires:

- `anime_id`
- `rating`

Rating must be from `1` to `5`.

### Watchlist Validation

Create watchlist item requires:

- `anime_id`

Status must be one of:

- `plan_to_watch`
- `watching`
- `completed`
- `dropped`

---

## File Upload Rules

Anime cover image upload uses multer.

Allowed image extensions:

- `.jpeg`
- `.jpg`
- `.png`
- `.webp`

Maximum file size:

```txt
5 MB
```

Uploaded files are stored inside:

```txt
uploads/
```

Uploaded files can be accessed through:

```txt
/uploads/filename.jpg
```

---

## Example Testing Flow

This is a recommended flow for testing in Postman. You can test manually or use the included Postman collection `wawa.json` to automate most of this flow.

### 1. Run seed

```bash
npm run seed
```

### 2. Login as admin

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

Copy the admin token.

### 3. Create anime as admin

```txt
POST /api/anime
```

Use `multipart/form-data` and include admin token.

### 4. Login as normal user

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

Copy the user token.

### 5. Get subscription plans

```txt
GET /api/subscriptions
```

Copy one plan ID.

### 6. Buy subscription

```txt
POST /api/transactions/purchase
```

Body:

```json
{
  "planId": "plan_id_here",
  "paymentMethod": "Wallet"
}
```

### 7. Watch premium anime

```txt
GET /api/anime/:id/watch
```

Use the user token.

### 8. Create review

```txt
POST /api/reviews
```

Body:

```json
{
  "anime_id": "anime_id_here",
  "rating": 5,
  "comment": "This anime is very good."
}
```

### 9. Add anime to watchlist

```txt
POST /api/watchlist
```

Body:

```json
{
  "anime_id": "anime_id_here",
  "status": "watching"
}
```

---

## Important Fixes in This Version

This version contains fixes and improvements compared to the previous code:

1. Fixed the typo `proccess.env.MONGO_URI` to `process.env.MONGO_URI`.
2. Added fallback port using `process.env.PORT || 3000`.
3. Added required checks for `MONGO_URI` and `JWT_SECRET`.
4. Added ObjectId validation to prevent MongoDB ObjectId errors.
5. Improved anime validation for create and update operations.
6. Improved boolean and number conversion from request bodies.
7. Prevented user password from being returned in user endpoints.
8. Added `GET /api/users/:id` endpoint.
9. Added `GET /api/subscriptions/:id` endpoint.
10. Added Review CRUD.
11. Added Watchlist CRUD.
12. Added cleanup logic when anime or users are deleted.
13. Fixed transaction flow for wallet and pending payment methods.
14. Added premium extension logic.
15. Removed hardcoded database connection from the seeder.
16. Added `.env.example` for easier setup.

---

## Possible Future Improvements

This project can be improved further by adding:

1. Episode CRUD for managing individual anime episodes.
2. Real video URL storage instead of fake watch URLs.
3. Payment gateway integration.
4. User profile endpoint for users to update their own profile.
5. Refresh token system.
6. Pagination for anime, reviews, watchlist, and transactions.
7. Search and filter for local anime database.
8. Cloud image upload using Cloudinary or similar services.
9. Unit testing and integration testing.
10. API documentation using Swagger/OpenAPI.

---

## Conclusion

Anime Subscription API is a backend project for an anime streaming subscription platform. It includes authentication, authorization, anime management, subscription plans, transactions, premium access checks, reviews, watchlists, file uploads, third-party API integration, and database seeding.

The project is suitable for demonstrating REST API development, CRUD implementation, authentication, database design, and backend business logic using Node.js, Express.js, and MongoDB.
