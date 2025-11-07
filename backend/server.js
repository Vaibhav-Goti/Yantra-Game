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

server.listen(port, '0.0.0.0' ,(err) => {
    if (err) {
        console.log(`server failed to start on port ${port}`);
    }else{
        console.log(`server started on port ${port}`);
    }
})