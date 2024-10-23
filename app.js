const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path'); // Import path for file paths
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Nikita@29',
    database: 'diagnostic_center'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('MySQL Connected...');
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});

// Route to serve the booking page
app.get('/book-appointment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'book-appointment.html')); // Use path.join for cross-platform compatibility
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Use path.join for cross-platform compatibility
});

// Route to book an appointment
app.post('/book', (req, res) => {
    const { name, email, phone, test, date, time } = req.body;

    // Check if time is already taken
    const query = 'SELECT * FROM appointments WHERE appointment_date = ? AND appointment_time = ?';
    db.query(query, [date, time], (err, results) => {
        if (err) {
            console.error('Error checking appointment:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (results.length > 0) {
            return res.json({ success: false, message: 'This time is not available. Please choose a different time.' });
        }

        // Insert new appointment
        const insertQuery = 'INSERT INTO appointments (name, email, phone, test, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(insertQuery, [name, email, phone, test, date, time], (err, result) => {
            if (err) {
                console.error('Error inserting appointment:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }
            res.json({ success: true, message: 'Appointment booked successfully!' });
        });
    });
});

// Route to view appointments by email
app.get('/view', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const query = 'SELECT * FROM appointments WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error retrieving appointments:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (results.length > 0) {
            res.json({ success: true, appointments: results });
        } else {
            res.json({ success: false, message: 'No appointments found for this email.' });
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});