import NotificationsDAL from '../DataAccessLayer/NotificationsDAL';
import {NotificationType, Notification} from '../models/Notifications';
import {onlineUsers} from '../sockets/events/onlineUsers';
import {NotificationEmitDto} from "../DTOs/notification/NotificationEmitDto";
import UserServices from "./UserServices";
import UserDAL from "../DataAccessLayer/UserDAL";

class NotificationsService {
    async createNotification(
        targetUserId: number,
        sourceUserId: number,
        type: NotificationType
    ): Promise<Notification> {
        const source_username = await UserDAL.getUsernameByUserId(sourceUserId);
        const notification = await NotificationsDAL.createNotification(
            targetUserId,
            sourceUserId,
            source_username ?? 'Bifrost63',
            type
        );

        // Vérifier si l'utilisateur cible est en ligne
        const userSockets = onlineUsers.get(targetUserId);
        if (userSockets) {
            userSockets.forEach((socket) => {
                socket.emit('notification', notification);
            });
        }
        return notification;
    }

    async getNotificationsForUser(
        userId: number,
        includeRead: boolean = false
    ): Promise<Notification[]> {
        return await NotificationsDAL.getNotificationsForUser(userId, includeRead);
    }

    async markNotificationsAsRead(
        userId: number,
        notificationIds: number[]
    ): Promise<void> {
        await NotificationsDAL.markNotificationsAsRead(userId, notificationIds);
    }

    async deleteNotification(
        userId: number,
        notificationId: number
    ): Promise<void> {
        await NotificationsDAL.deleteNotification(notificationId, userId);
    }
}

export default new NotificationsService();