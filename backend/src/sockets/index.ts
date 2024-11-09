import {Server, Socket} from "socket.io";
import JwtService from '../services/JwtService';
import {onlineUsers} from './events/onlineUsers';
import {IJwtPayload} from '../types/IJwtPayload';
import userServices from "../services/UserServices";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import UserServices from "../services/UserServices";
import notificationEventHandler from "./events/notification";
import chatSocketEventHandler from "./events/chatSocket";

const initializeSockets = (io: Server) => {
    io.use(async (socket: Socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            return next(new Error("Authentication error: Token manquant"));
        }

        try {
            const payload: IJwtPayload | null = JwtService.verifyAccessToken(token);
            if (payload && payload.id) {
                const user = await userServices.getUserById(payload.id);
                if (!user) {
                    return next(new Error("User not found"));
                }
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
            userServices.setOnlineUser(userId);
        }
        onlineUsers.get(userId)!.add(socket);

        notificationEventHandler(socket, io);
        chatSocketEventHandler(socket, io);

        // Gérer la déconnexion
        socket.on("disconnect", () => {
            const userSet = onlineUsers.get(userId);
            if (userSet) {
                userSet.delete(socket);
                if (userSet.size === 0) {
                    onlineUsers.delete(userId);
                    userServices.setOfflineUser(userId);
                }
            }
            console.log(`User ${userId} déconnecté du socket ${socket.id}`);
        });
    });
};

export default initializeSockets;