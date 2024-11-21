import NotificationsDAL from '../DataAccessLayer/NotificationsDAL';
import {NotificationType, Notification} from '../models/Notifications';
import {onlineUsers} from '../sockets/events/onlineUsers';
import {NotificationEmitDto} from "../DTOs/notification/NotificationEmitDto";
import UserServices from "./UserServices";
import UserDAL from "../DataAccessLayer/UserDAL";
import BlockedUsersService from "./BlockedUsersService";
import {UserBlockedResponseDto} from "../DTOs/blocked/UserBlockedResponseDto";

class NotificationsService {
    async createNotification(
        targetUserId: number,
        sourceUserId: number,
        type: NotificationType
    ): Promise<Notification> {
        const source_username = await UserDAL.getUsernameByUserId(sourceUserId);
        await BlockedUsersService.checkIsUserBlocked(targetUserId, sourceUserId);
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
                socket.emit('reload_chat', notification);
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

    async deleteNotifications(
        userId: number,
        notificationIds: number[]
    ): Promise<void> {
        await NotificationsDAL.deleteNotifications(notificationIds, userId);
    }
}


export default new NotificationsService();