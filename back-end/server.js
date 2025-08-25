//back-end/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/database');
require('dotenv').config();
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'https://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - MUST be before passport.initialize()
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware - MUST be after session middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'BrewHub API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 3001;


// SSL Certificate paths
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certs/localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/localhost.crt'))
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, () => {
    console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`);
});

/*app.listen(PORT, () => {
    console.log(`Server is running. Listening on http://localhost:${PORT}`);
});*/