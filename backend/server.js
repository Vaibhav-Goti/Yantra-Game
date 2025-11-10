import http from 'http';
import app from './app/app.js'
import { Server } from 'socket.io'

// Set timezone to Asia/Kolkata
process.env.TZ = 'Asia/Kolkata';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*", // Update this to your frontend URL in production
        methods: ["GET", "POST"]
    }
});

// Socket.IO Error Handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle socket errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    });
});

// Handle Socket.IO server-level errors
io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', {
        message: err.message,
        description: err.description,
        context: err.context,
        type: err.type
    });
});

// Handle upgrade errors
io.engine.on('upgrade_error', (err) => {
    console.error('Socket.IO upgrade error:', err);
});

server.listen(port, '0.0.0.0' ,(err) => {
    if (err) {
        console.log(`server failed to start on port ${port}`);
    }else{
        console.log(`server started on port ${port}`);
        console.log(`Socket.IO server initialized`);
    }
})