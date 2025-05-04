// Required modules
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Set up Express app
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up SQLite database
const db = new sqlite3.Database('./contact_form.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create a table to store form submissions
db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT
  )
`);

// POST route to handle contact form submissions
app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;

  // Insert data into SQLite database
  db.run(`
    INSERT INTO submissions (name, email, message)
    VALUES (?, ?, ?)
  `, [name, email, message], function(err) {
    if (err) {
      return res.status(500).send('Error saving data');
    }

    // Send a confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Confirmation of Your Message',
      text: `Hi ${name},\n\nThank you for reaching out! We received your message: "${message}"\n\nBest regards,\nS-Blue Energy Team`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent: ' + info.response);
      res.status(200).send('Submission successful and email sent!');
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
