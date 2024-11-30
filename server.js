const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
const auth = require('./src/middleware/auth');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/public')));

// Set up rate limiter: maximum of 5 requests per minute
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later'
});

// Apply rate limiter to login endpoint
app.use('/login', limiter);

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Change this to a real secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'src/views/home.html'));
    } else {
        res.sendFile(path.join(__dirname, 'src/views/login.html'));
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = await auth.authenticateUser(req.body.username, req.body.password);
        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/home');
    } catch (error) {
        res.status(401).send('Invalid username or password');
    }
});

app.get('/home', auth.requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/home.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});