const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messRoutes = require('./routes/messRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/test', require('./routes/testRoutes'));

// Main Entry Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
