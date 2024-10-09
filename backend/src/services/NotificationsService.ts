import NotificationsDAL from '../DataAccessLayer/NotificationsDAL';
import {NotificationType} from '../models/Notifications';
import {Notification} from '../models/Notifications';
import {onlineUsers} from '../sockets'; // We'll modify sockets to maintain online users
import {Socket} from 'socket.io';

class NotificationsService {
    async createNotification(
        targetUserId: number,
        sourceUserId: number,
        type: NotificationType
    ): Promise<number> {
        const notificationId = await NotificationsDAL.createNotification(
            targetUserId,
            sourceUserId,
            type
        );

        // Check if the target user is online
        const targetSocket = onlineUsers.get(targetUserId);
        if (targetSocket) {
            // Emit the notification to the target user via websocket
            targetSocket.emit('notification', {
                notification_id: notificationId,
                type,
                source_user_id: sourceUserId,
            });
        }

        return notificationId;
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