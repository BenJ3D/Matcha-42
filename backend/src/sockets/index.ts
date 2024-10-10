import {Server, Socket} from "socket.io";
import notification from './events/notification';
import JwtService from '../services/JwtService';
import {onlineUsers} from './events/onlineUsers';
import {IJwtPayload} from '../types/IJwtPayload';

const initializeSockets = (io: Server) => {
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            return next(new Error("Authentication error: Token manquant"));
        }

        try {
            const payload: IJwtPayload | null = JwtService.verifyAccessToken(token);
            if (payload && payload.id) {
                socket.data.userId = payload.id;
                return next();
            } else {
                return next(new Error("Authentication error: Token invalide"));
            }
        } catch (error) {
            return next(new Error("Authentication error: Token invalide"));
        }
    });

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.userId as number;
        console.log(`User ${userId} connecté avec le socket ${socket.id}`);

        // Ajouter le socket à la map onlineUsers
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)!.add(socket);

        // Gérer la déconnexion
        socket.on("disconnect", () => {
            const userSet = onlineUsers.get(userId);
            if (userSet) {
                userSet.delete(socket);
                if (userSet.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
            console.log(`User ${userId} déconnecté du socket ${socket.id}`);
        });

        // Initialiser les gestionnaires d'événements
        notification(socket, io);

        // Ajouter d'autres gestionnaires d'événements ici
    });
};

export default initializeSockets;