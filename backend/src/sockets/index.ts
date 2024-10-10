import {Server, Socket} from 'socket.io';
import JwtService from '../services/JwtService'; // Ensure this is the correct path
import connectionHandler from './events/connection';
import notification from './events/notification';

const onlineUsers = new Map<number, Socket>();

const initializeSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('Nouvelle connexion: ' + socket.id);


        // Authenticate the user and associate the user ID with the socket
        socket.on('authenticate', (data: { token: string }) => {
            const payload = JwtService.verifyAccessToken(data.token);
            if (payload && payload.id) {
                onlineUsers.set(payload.id, socket);
                socket.data.userId = payload.id;

                console.log(`User ${payload.id} connected with socket ${socket.id}`);

                // Optionally, emit a confirmation to the client
                socket.emit('authenticated', {message: 'You are authenticated'});
            } else {
                console.log('Invalid token detected in socket connection');
                socket.emit('unauthorized', {message: 'Invalid token'});
                socket.disconnect(true);
            }
        });

        socket.on('disconnect', () => {
            const userId = socket.data.userId;
            if (userId) {
                onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
            }
        });

        // Initialize event handlers
        connectionHandler(socket, io);
        notification(socket, io);

        // Add other event handlers here
    });
};

export {initializeSockets, onlineUsers};