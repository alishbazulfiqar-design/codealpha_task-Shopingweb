const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database State
let users = [];
let orders = [];
let products = [
    { id: 1, name: "Smart Watch Series 5", category: "Electronics", rating: 4.5, reviews: 128, price: 89.99, oldPrice: 129.99 },
    { id: 2, name: "Wireless Headphones", category: "Electronics", rating: 4.7, reviews: 98, price: 59.99, oldPrice: 89.99 },
    { id: 3, name: "Travel Backpack", category: "Accessories", rating: 4.6, reviews: 156, price: 39.99, oldPrice: 59.99 },
    { id: 4, name: "Running Shoes", category: "Sports", rating: 4.4, reviews: 78, price: 49.99, oldPrice: 79.99 },
    { id: 5, name: "Luxury Perfume", category: "Beauty", rating: 4.8, reviews: 64, price: 29.99, oldPrice: 49.99 }
];

// Auth Endpoints
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Fields required" });
    if (users.find(u => u.email === email)) return res.status(400).json({ message: "User already exists" });
    
    const newUser = { id: users.length + 1, email, password };
    users.push(newUser);
    res.status(201).json({ message: "Registration successful!", user: { email } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ message: "Login successful!", user: { email } });
});

// Products API
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Order Processing API
app.post('/api/orders', (req, res) => {
    const { userEmail, cartItems, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });
    
    const newOrder = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        userEmail: userEmail || 'Guest',
        items: cartItems,
        total: totalAmount,
        status: 'Processing',
        date: new Date()
    };
    orders.push(newOrder);
    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});