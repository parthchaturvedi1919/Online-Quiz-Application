const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');


const loadUsers = () => {
    if (!fs.existsSync(usersFilePath)) return []; 
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading users.json:', err);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to users.json:', err);
    }
};

module.exports = { loadUsers, saveUsers };
