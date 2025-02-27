const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('express-flash');
const cors = require('cors');
const multer = require('multer');
const { loadUsers, saveUsers } = require('./functional/usersUtils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'imgs'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const quizzesFilePath = path.join(__dirname, 'public', 'quizzes.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

function checkAdminAuth(req, res, next) {
    if (req.session.user && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

app.post('/signup', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/signup.html?error=passwordsDoNotMatch');
    }

    const users = loadUsers();
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.redirect('/signup.html?error=emailExists');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
        username,
        email,
        password: hashedPassword,
        photo: '/imgs/default-profile.png',
        isAdmin: false
    };

    users.push(newUser);
    saveUsers(users);

    req.session.user = newUser;
    req.session.isAdmin = false;

    res.redirect('/dashboard.html');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();
    const user = users.find(user => user.email === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.redirect('/login.html?error=invalid');
    }

    req.session.user = user;
    req.session.isAdmin = user.isAdmin;
    return res.redirect(user.isAdmin ? '/admin-dashboard.html' : '/dashboard.html');
});

app.post('/admin/login', (req, res) => {
    const { adminEmail, adminPassword } = req.body;
    const users = loadUsers();
    const adminUser = users.find(user => user.email === adminEmail && user.isAdmin);

    if (adminUser && bcrypt.compareSync(adminPassword, adminUser.password)) {
        req.session.user = adminUser;
        req.session.isAdmin = true;
        return res.redirect('/admin-dashboard.html');
    }

    req.flash('error', 'Invalid admin credentials.');
    res.redirect('/admin/login.html');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/home.html');
    });
});

app.get('/First_page.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'First_page.html'));
});

app.get('/dashboard.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin-dashboard.html', checkAdminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/quizzes.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quizzes.json'));
});

app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/', (req, res) => {
    res.redirect('/home.html');
});

app.get('/users.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'functional', 'users.json'));
});

app.post('/updatePhoto', checkAuth, upload.single('profilePhoto'), (req, res) => {
    const users = loadUsers();
    const user = users.find(user => user.email === req.session.user.email);

    if (user) {
        user.photo = `/imgs/${req.file.filename}`;
        saveUsers(users);
        req.session.user.photo = user.photo;
        req.flash('success', 'Profile photo updated successfully.');
        res.redirect('/dashboard.html');
    } else {
        req.flash('error', 'User not found.');
        res.redirect('/settings.html');
    }
});

app.post('/updateAdminPhoto', checkAuth, checkAdminAuth, upload.single('profilePhoto'), (req, res) => {
    const users = loadUsers();
    const admin = users.find(user => user.email === req.session.user.email && user.isAdmin);

    if (admin) {
        admin.photo = `/imgs/${req.file.filename}`;
        saveUsers(users);
        req.session.user.photo = admin.photo;
        req.flash('success', 'Admin profile photo updated successfully.');
        return res.status(200).json({ message: 'Photo updated successfully.' });
    } else {
        req.flash('error', 'Admin not found.');
        return res.status(404).json({ error: 'Admin not found.' });
    }
});

app.get('/api/user-profile', checkAuth, (req, res) => {
    const user = req.session.user;
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/api/admin-profile', checkAdminAuth, (req, res) => {
    const admin = req.session.user;
    if (admin && admin.isAdmin) {
        res.json({
            username: admin.username,
            email: admin.email,
            photo: admin.photo || '/imgs/default-admin.png',
        });
    } else {
        res.status(404).json({ error: 'Admin not found' });
    }
});

app.post('/save-results', (req, res) => {
    const { quizName, user, userScore, totalQuestions, correctAnswers, scorePercentage } = req.body;

    if (!quizName || !user || !userScore || !totalQuestions || !correctAnswers || !scorePercentage) {
        return res.status(400).json({ error: 'Invalid results data' });
    }

    const results = {
        quizName,
        user,
        userScore,
        totalQuestions,
        correctAnswers,
        scorePercentage,
        date: new Date().toISOString()
    };

    const resultsFilePath = path.join(__dirname, 'public', 'quizResults.json');

    fs.readFile(resultsFilePath, 'utf8', (err, data) => {
        let allResults = [];
        if (!err) {
            allResults = JSON.parse(data);
        }

        allResults.push(results);

        fs.writeFile(resultsFilePath, JSON.stringify(allResults, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error saving results:', writeErr);
                return res.status(500).json({ error: 'Failed to save results' });
            }
            res.status(200).json({ message: 'Results saved successfully' });
        });
    });
});

app.post('/changePassword', checkAuth, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const users = loadUsers();
    const user = users.find(user => user.email === req.session.user.email);

    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
        req.flash('error', 'Current password is incorrect.');
        return res.redirect('/settings.html');
    }

    if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match.');
        return res.redirect('/settings.html');
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    saveUsers(users);

    req.flash('success', 'Password changed successfully.');

    if (req.session.isAdmin) {
        res.redirect('/admin-dashboard.html');
    } else {
        res.redirect('/dashboard.html');
    }
});

app.post('/changeAdminPassword', checkAuth, checkAdminAuth, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const users = loadUsers();
    const admin = users.find(user => user.email === req.session.user.email && user.isAdmin);

    if (!admin || !bcrypt.compareSync(currentPassword, admin.password)) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match.' });
    }

    admin.password = bcrypt.hashSync(newPassword, 10);
    saveUsers(users);

    return res.status(200).json({ message: 'Password changed successfully.' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
