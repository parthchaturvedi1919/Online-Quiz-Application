const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// JSON file paths (Fixing typo in the path and ensuring the correct file name)
const usersFilePath = path.resolve(__dirname, '../functional/users.json');

// Load and save users
const loadUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    } catch (error) {
        console.error('Error reading users file:', error);
        return []; // Return an empty array if file not found or error occurs
    }
};

const saveUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Signup route
router.post('/public/signup', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/public/signup.html');
    }

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/public/signup.html');
    }

    const users = loadUsers();

    if (users.some(user => user.email === email)) {
        req.flash('error', 'User already exists.');
        return res.redirect('/public/signup.html');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, email, password: hashedPassword });
    saveUsers(users);

    res.redirect('/public/login.html');
});

// Login route
router.post('/public/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/public/login.html');
    }

    const users = loadUsers();
    const user = users.find(user => user.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.redirect('/public/first_page.html');
    } else {
        req.flash('error', 'Invalid email or password.');
        res.redirect('/public/login.html');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/public/login.html');
});

// Serve protected page (Fixed the route to `/public/first_page.html`)
router.get('/public/first_page.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/public/login.html');
    }
    res.sendFile(path.join(__dirname, '../public', 'first_page.html'));
});

module.exports = router;
