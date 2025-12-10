# 📘 Natours API

RESTful API for managing tours, users, bookings, and authentication.

A complete backend project built with **Node.js**, **Express**, **MongoDB**, and **Stripe**, following best practices for API design, security, and performance.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=node.js\&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge\&logo=json-web-tokens\&logoColor=white) ![Multer](https://img.shields.io/badge/Multer-CC0000?style=for-the-badge) ![Sharp](https://img.shields.io/badge/Sharp-00ADEF?style=for-the-badge) ![Dotenv](https://img.shields.io/badge/Dotenv-000000?style=for-the-badge) ![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge\&logo=stripe\&logoColor=white)

---

## 🚀 Features

* User registration & login
* Password hashing & reset
* JWT authentication
* Role-based access (admin, guide, user)
* CRUD operations for tours, users, reviews, bookings
* Image upload & processing
* Data filtering, sorting, pagination
* Stripe payment integration
* Global error handling
* Security best practices (Rate limiting, Helmet, Sanitization)

---

## 📂 Project Structure

```
Natours-Api
│── controllers/
│── models/
│── routes/
│── utils/
│── public/
│── uploads/
│── app.js
│── server.js
│── package.json
│── README.md
```

---

## 📦 Installation

```bash
git clone https://github.com/EkramyAshraf/Natours-Api
cd Natours-Api
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file in the root:

```
NODE_ENV="development"
PORT=3000
DATABASE_PASSWORD=
DATABASE=mongodb+srv://
JWT_SECRET=
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_PORT=587
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_FROM=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

SENDGRID_API_KEY=
```

> Example values can be added for testing, like a test MongoDB URI or Stripe sandbox keys.

---

## ▶️ Running the Project

### Development:

```bash
npm run dev
```

### Production:

```bash
npm start
```

---

## 🔐 Authentication & Payments Flow

1. **Signup**
2. **Login** → returns JWT
3. **Protected routes** → require `Authorization: Bearer <token>`
4. **Restricted routes** → only admins/guides
5. **Password reset** (if implemented)
6. **Stripe Payments** → integrate for bookings

---

## 📡 API Endpoints (Example)

### **Auth**

| Method | Endpoint                         | Description                 | Request Body Example                                                    |
| ------ | -------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/v1/users/signup`           | Create new user             | `{ "name": "John", "email": "john@example.com", "password": "123456" }` |
| POST   | `/api/v1/users/login`            | Login user                  | `{ "email": "john@example.com", "password": "123456" }`                 |
| PATCH  | `/api/v1/users/updateMyPassword` | Update logged user password | `{ "passwordCurrent": "123456", "password": "newpass123" }`             |

### **Users**

| Method | Endpoint            | Description           | Request Body Example  |
| ------ | ------------------- | --------------------- | --------------------- |
| GET    | `/api/v1/users`     | Get all users (admin) | -                     |
| GET    | `/api/v1/users/:id` | Get user by ID        | -                     |
| PATCH  | `/api/v1/users/:id` | Update user (admin)   | `{ "role": "guide" }` |
| DELETE | `/api/v1/users/:id` | Delete user (admin)   | -                     |

### **Tours**

| Method | Endpoint            | Description         | Request Body Example                 |
| ------ | ------------------- | ------------------- | ------------------------------------ |
| GET    | `/api/v1/tours`     | Get all tours       | -                                    |
| POST   | `/api/v1/tours`     | Create tour (admin) | `{ "name": "Safari", "price": 250 }` |
| GET    | `/api/v1/tours/:id` | Get tour by ID      | -                                    |
| PATCH  | `/api/v1/tours/:id` | Update tour         | `{ "price": 300 }`                   |
| DELETE | `/api/v1/tours/:id` | Delete tour         | -                                    |

### **Reviews**

| Method | Endpoint                        | Description          | Request Body Example                  |
| ------ | ------------------------------- | -------------------- | ------------------------------------- |
| GET    | `/api/v1/reviews`               | Get all reviews      | -                                     |
| POST   | `/api/v1/tours/:tourId/reviews` | Add review to a tour | `{ "review": "Great!", "rating": 5 }` |
| PATCH  | `/api/v1/reviews/:id`           | Update review        | `{ "review": "Updated review" }`      |
| DELETE | `/api/v1/reviews/:id`           | Delete review        | -                                     |

### **Bookings**

| Method | Endpoint               | Description       | Request Body Example                                   |
| ------ | ---------------------- | ----------------- | ------------------------------------------------------ |
| GET    | `/api/v1/bookings`     | Get all bookings  | -                                                      |
| POST   | `/api/v1/bookings`     | Create a booking  | `{ "tour": "tourId", "user": "userId", "price": 250 }` |
| GET    | `/api/v1/bookings/:id` | Get booking by ID | -                                                      |
| PATCH  | `/api/v1/bookings/:id` | Update booking    | `{ "status": "confirmed" }`                            |
| DELETE | `/api/v1/bookings/:id` | Delete booking    | -                                                      |

---

## 🧪 Testing

Use **Postman** collection:

```
/postman/Natours.postman_collection.json
```

---

## 📈 Roadmap

* Add Stripe payment integration
* Add booking system
* Add email sending
* Add rate reviews
* Deploy on Railway

---

## 🤝 Contributing

Pull Requests are welcome. For major changes, please open an issue first.

---

## 📜 License

MIT License © 2025
