# ATELIER | Luxury Fashion E-Commerce

<div align="center">
  <h3>Curating the finest garments through a lens of architectural precision and ethical craftsmanship</h3>
</div>

---

## Overview

**ATELIER** is a full-stack luxury fashion e-commerce platform featuring a minimalist, editorial-inspired design. Built with Node.js, Express, and MongoDB, it provides a complete backend API for product management, user authentication, and order processing.

## Features

- **User Authentication** - JWT-based secure authentication
- **Product Catalog** - Browse luxury garments with detailed product information
- **Shopping Cart** - Add, update, and manage cart items
- **Order Management** - Complete checkout and order tracking
- **Responsive Design** - Elegant UI optimized for all devices
- **Dark Mode Support** - Seamless light/dark theme switching

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling
- **Vanilla JavaScript** - Interactive functionality

## Project Structure

```
atelier-ethos-couture/
├── server/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Product.js         # Product schema
│   │   └── Order.js           # Order schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── products.js        # Product routes
│   │   └── orders.js          # Order routes
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   └── scripts/
│       └── seed.js            # Database seeder
├── *.html                     # Frontend pages
├── cart.js                    # Cart functionality
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd atelier-ethos-couture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/atelier
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

6. **Open the application**
   
   Navigate to `http://localhost:5000` in your browser.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (protected) |
| PUT | `/api/products/:id` | Update product (protected) |
| DELETE | `/api/products/:id` | Delete product (protected) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user orders (protected) |
| POST | `/api/orders` | Create new order (protected) |
| GET | `/api/orders/:id` | Get single order (protected) |

## Database Models

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  isAdmin: Boolean
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number
}
```

### Order
```javascript
{
  user: ObjectId (ref: User),
  items: Array,
  total: Number,
  status: String,
  createdAt: Date
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run seed` | Seed database with sample data |

## License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with precision and passion for luxury fashion</p>
</div>
