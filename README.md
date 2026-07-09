# Anime Subscription API

REST API untuk project anime subscription. Project ini sekarang punya CRUD utama untuk anime dan subscription plan, plus 2 CRUD tambahan: review dan watchlist.

## Cara run

```bash
npm install
npm run seed
npm start
```

Pastikan file `.env` berisi:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Login dummy setelah seed

Admin:

```txt
email: admin@stts.edu
password: wawa123
```

User:

```txt
email: user@stts.edu
password: wawa123
```

Gunakan token dari `/api/auth/login` sebagai Bearer Token di Postman.

## Endpoint utama

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
```

### Anime CRUD

```txt
GET    /api/anime
GET    /api/anime/:id
POST   /api/anime              admin only, multipart/form-data coverImage
PUT    /api/anime/:id          admin only, multipart/form-data coverImage optional
DELETE /api/anime/:id          admin only
GET    /api/anime/:id/watch    user/admin login required
GET    /api/anime/jikan/search?q=naruto
```

Anime body:

```json
{
  "title": "One Piece",
  "synopsis": "Anime pirate adventure",
  "episodes": 1000,
  "isPremium": false,
  "type": "TV"
}
```

### Subscription Plan CRUD

```txt
GET    /api/subscriptions
GET    /api/subscriptions/:id
POST   /api/subscriptions       admin only
PUT    /api/subscriptions/:id   admin only
DELETE /api/subscriptions/:id   admin only
```

Subscription body:

```json
{
  "plan_name": "1 Month Premium Access",
  "price": 50000,
  "duration_days": 30,
  "description": "Akses penuh premium 30 hari."
}
```

### Review CRUD

```txt
GET    /api/reviews/anime/:animeId
GET    /api/reviews/my              login required
POST   /api/reviews                 login required
PUT    /api/reviews/:id             owner/admin only
DELETE /api/reviews/:id             owner/admin only
```

Review body:

```json
{
  "anime_id": "ANIME_OBJECT_ID",
  "rating": 5,
  "comment": "Great anime!"
}
```

### Watchlist CRUD

```txt
GET    /api/watchlist               login required
POST   /api/watchlist               login required
PUT    /api/watchlist/:id           owner/admin only
DELETE /api/watchlist/:id           owner/admin only
```

Watchlist body:

```json
{
  "anime_id": "ANIME_OBJECT_ID",
  "status": "plan_to_watch"
}
```

Allowed watchlist status:

```txt
plan_to_watch
watching
completed
dropped
```

### Transactions

```txt
POST   /api/transactions/purchase   login required
GET    /api/transactions/history    login required
GET    /api/transactions            admin only
PUT    /api/transactions/:id        admin only
DELETE /api/transactions/:id        admin only
```

Purchase body:

```json
{
  "planId": "PLAN_OBJECT_ID",
  "paymentMethod": "Wallet"
}
```

### Users

```txt
GET    /api/users                   admin only
GET    /api/users/:id               admin only
PUT    /api/users/:id               admin only
DELETE /api/users/:id               admin only
```

## Fix yang sudah dilakukan

- Fixed typo `proccess.env.MONGO_URI` menjadi `process.env.MONGO_URI`.
- Added default `PORT=3000` fallback.
- Added global 404 and upload error handler.
- Validation sekarang menyimpan hasil konversi Joi ke `req.body`, jadi number/boolean dari form-data ikut benar.
- Anime update sekarang divalidasi.
- ID MongoDB yang invalid sekarang return 400, bukan crash ke 500.
- Password user tidak ikut keluar di endpoint admin users.
- Transaction logic diperbaiki: Wallet langsung sukses dan mengurangi saldo; payment lain menjadi Pending sampai admin update ke Success.
- Jika premium masih aktif lalu user beli plan lagi, masa premium diperpanjang dari tanggal premium lama, bukan di-reset dari hari ini.
- Delete anime/user juga membersihkan review dan watchlist terkait.
- Hardcoded MongoDB URI di seeder dihapus; sekarang pakai `.env`.
