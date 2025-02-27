**Quiz Platform:**

A web-based quiz platform that allows users to take quizzes, view results, and manage their profiles. This project is designed to enhance learning through engaging quizzes while providing an admin interface for managing users and quizzes.

**Features:**

- User Registration & Login: Users can sign up and log in to their accounts.
- Admin Dashboard: Admins can manage users and view statistics.
- Dynamic Quiz Selection: Users can select quizzes based on their interests.
- Result Tracking: Users can view their quiz results and performance metrics.
- Responsive Design: The platform is designed to be responsive and user-friendly.

**Technologies Used:**

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Data Storage: JSON files for user and quiz data

**Directory Structure:**

project-root/
├── public/
│   ├── home.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── admin-dashboard.html
│   ├── quizzes.json
│   ├── quizResults.json
│   ├── imgs/
│   ├── styles/
│   │   └── stylesuserdash.css
│   └── scriptdash.js
├── functional/
│   ├── usersUtils.js
│   └── users.json
├── server.js
├── app.js
├── .env
├── .gitignore
├── package.json
└── node_modules/


**Navigate to the project directory:** cd quiz-platform
**Install dependencies:** npm install
**Start the server:** node app.js


Open your browser and go to http://localhost:3000 to access the application.


**Usage:**

-**Sign Up:** Create a new account by filling out the signup form.
-**Log In**: Enter your credentials to access the dashboard.
-**Take Quizzes:** Select a quiz from the dashboard and start answering questions.
-**View Results:** After completing a quiz, view your results and statistics.
