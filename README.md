# Fashion E-commerce Platform

A full-stack fashion e-commerce platform built with **React.js, Node.js, Express.js, and MongoDB**. The system includes a customer-facing shopping website, an administration dashboard, RESTful APIs, authentication, product management, order processing, image uploads, and online payment integration.

## 📌 Overview

This project is designed for a fashion/clothing store to manage online shopping operations from product browsing to order processing.

The system consists of three main applications:

* **Customer Frontend** — Online shopping interface for customers
* **Admin Dashboard** — Product and order management for administrators
* **Backend API** — RESTful API, authentication, database and payment services

## ✨ Features

### Customer Website

* User registration and login
* JWT-based authentication
* Browse products by category and collection
* Product search
* Product details
* Related products
* Shopping cart
* Quantity management
* Checkout and order placement
* Cash on Delivery
* Stripe payment integration
* Order history
* Order verification
* Responsive user interface
* Toast notifications for user actions

### Admin Dashboard

* Admin authentication
* Product management
* Add new products
* Upload product images
* Remove products
* View product list
* Order management
* View customer orders
* Update order status
* Dashboard for store administration

### Backend

* RESTful API architecture
* User authentication and authorization
* JWT token authentication
* Password hashing with bcrypt
* Product CRUD operations
* Order management
* Cart management
* MongoDB database integration
* Cloudinary image upload
* Stripe payment integration
* Razorpay integration
* CORS configuration
* Environment variable configuration
* Request validation

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* React Toastify
* Tailwind CSS
* Vite

### Admin Dashboard

* React.js
* React Router
* Axios
* React Toastify
* Tailwind CSS
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Cloudinary
* Stripe
* Razorpay
* dotenv
* CORS
* Validator

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │   Customer Frontend │
                         │   React + Vite      │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │      Backend API    │
                         │ Node.js + Express   │
                         └──────┬──────┬───────┘
                                │      │
                    ┌───────────┘      └────────────┐
                    ▼                               ▼
          ┌──────────────────┐             ┌─────────────────┐
          │     MongoDB      │             │ Payment Services│
          │    Database      │             │ Stripe/Razorpay │
          └──────────────────┘             └─────────────────┘
                               
                         ┌─────────────────────┐
                         │    Admin Dashboard  │
                         │    React + Vite     │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │      Backend API    │
                         └─────────────────────┘

                         ┌─────────────────────┐
                         │      Cloudinary     │
                         │   Image Storage     │
                         └─────────────────────┘
```

## 📂 Project Structure

```text
fashion-ecommerce/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── admin/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dddat1009/fashion-ecommerce.git
cd fashion-ecommerce
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 4. Install Admin Dependencies

Open another terminal:

```bash
cd admin
npm install
```

## 🔐 Environment Variables

Environment variables are required for the backend, frontend and admin applications.

For security reasons, real `.env` files are **not included in this repository**.

### Backend

Create:

```text
backend/.env
```

Example:

```env
MONGODB_URI=your_mongodb_connection_string

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin

Create:

```text
admin/.env
```

Example:

```env
VITE_BACKEND_URL=http://localhost:4000
```

> Never commit `.env` files or API keys to GitHub.

## ▶️ Running the Application

The project contains three applications that need to run simultaneously.

### Start Backend

```bash
cd backend
npm run server
```

The backend API will run on the configured local port.

### Start Customer Frontend

```bash
cd frontend
npm run dev
```

Vite will provide a local development URL.

### Start Admin Dashboard

```bash
cd admin
npm run dev
```

The admin dashboard will run on its own Vite development port.

## 💳 Payment Integration

The application includes online payment integration using:

* Stripe
* Razorpay

Payment credentials must be configured through environment variables.

For development and testing, use the appropriate test/sandbox credentials provided by the payment providers.

## 🖼️ Image Management

Product images are uploaded and managed using **Cloudinary**.

The backend handles image uploads and stores the resulting image information for use by the frontend.

## 🔒 Authentication & Authorization

The application uses **JWT (JSON Web Token)** for authentication.

The authentication flow includes:

```text
User Login
    ↓
Backend validates credentials
    ↓
JWT token generated
    ↓
Token stored by client
    ↓
Token sent with protected API requests
    ↓
Backend middleware validates token
    ↓
Authorized request
```

Passwords are hashed using **bcrypt** before being stored.

Admin functionality is protected using authentication and authorization middleware.

## 🗄️ Database

The project uses **MongoDB** with **Mongoose** for database management.

Main data entities include:

* Users
* Products
* Orders
* Cart information

Mongoose is used to define schemas and interact with MongoDB.

## 📡 API

The backend provides RESTful API endpoints for major application operations, including:

```text
Authentication
├── User registration
├── User login
└── Authentication verification

Products
├── Add product
├── List products
├── Remove product
└── Product information

Cart
├── Add to cart
├── Update cart
└── Retrieve cart

Orders
├── Create order
├── Retrieve user orders
├── Verify order
└── Update order status

Payments
├── Stripe payment
└── Razorpay payment
```

## 📱 Responsive Design

The customer-facing website is designed to provide a responsive shopping experience across:

* Desktop
* Tablet
* Mobile devices

## 🧪 Development

### Build Frontend

```bash
cd frontend
npm run build
```

### Build Admin

```bash
cd admin
npm run build
```

### Run Linter

```bash
npm run lint
```

## 📈 Future Improvements

Potential improvements for future versions include:

* Complete Razorpay payment flow
* Product reviews and ratings
* Wishlist functionality
* Advanced product filtering
* Pagination and optimized product queries
* Inventory/stock management
* Discount and voucher management
* Sales analytics
* Email notifications
* Improved API validation and error handling
* Automated testing
* Docker containerization
* CI/CD pipeline
* Production deployment

## 🎯 Learning Outcomes

Through this project, I practiced:

* Full-stack web application development
* RESTful API design
* React component architecture
* State management
* Authentication and authorization
* MongoDB database design
* CRUD operations
* Payment gateway integration
* Cloud image storage
* Environment variable management
* Git and GitHub workflow
* Frontend and backend integration

## 📸 Screenshots

Screenshots of the customer website and admin dashboard can be added here.

### Customer Website

*Add screenshots here.*

### Admin Dashboard

*Add screenshots here.*

## 👨‍💻 Author

**dddat1009**

GitHub:
https://github.com/dddat1009

## 📄 License

This project was developed for educational and portfolio purposes.
