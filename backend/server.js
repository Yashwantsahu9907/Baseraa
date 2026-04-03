const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
    'https://baseraa.vercel.app',
    'https://baseraa.vercel.app/',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173'
];

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on('send_message', async (data) => {
        const { sender, receiver, message } = data;
        try {
            const newMessage = await Message.create({ sender, receiver, message });
            // Emit to receiver's private room
            io.to(receiver).emit('receive_message', newMessage);
            // Also emit back to sender (for multi-device sync or simple confirmation)
            io.to(sender).emit('message_sent', newMessage);
        } catch (error) {
            console.error('Socket Error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected:', socket.id);
    });
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messRoutes = require('./routes/messRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/test', require('./routes/testRoutes'));

// Main Entry Route
app.get('/', (req, res) => {
    res.send('API is running with Socket.io...');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
