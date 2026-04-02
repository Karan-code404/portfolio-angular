require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors()); // Angular ko allow karega
app.use(express.json()); // Frontend se aane wale JSON data ko padhega

// Email bhejne ka POST Route
app.post('/api/contact', async (req, res) => {
  const { name, email, purpose, message } = req.body;

  // Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true, // TLS use karne ke liye
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Ye line development mein security block hatati hai
    }
  });

  // Email kaisa dikhega
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER, // Khud ko hi bhej rahe hain
    subject: `Portfolio Contact: ${purpose} from ${name}`,
    text: `You have a new message from your Portfolio!\n\nName: ${name}\nEmail: ${email}\nPurpose: ${purpose}\nMessage:\n${message}`,
    replyTo: email // Reply dabane par seedha client ko reply jayega
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT} 🚀`);
});