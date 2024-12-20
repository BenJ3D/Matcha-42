import db from '../config/knexConfig';
import { Notification, NotificationType } from '../models/Notifications';

class NotificationsDAL {
    async createNotification(
        targetUserId: number,
        sourceUserId: number,
        sourceUserName: string,
        type: NotificationType
    ): Promise<Notification> {
        try {
            const [notification] = await db('notifications')
                .insert({
                    target_user: targetUserId,
                    source_user: sourceUserId,
                    type,
                    has_read: false,
                    notified_at: new Date(),
                    source_username: sourceUserName,
                })
                .returning('*');

            return notification;
        } catch (error) {
            throw new Error('Could not create notification');
        }
    }

    async getNotificationsForUser(
        userId: number,
        includeRead: boolean = false
    ): Promise<Notification[]> {
        try {
            const query = db('notifications')
                .select('*')
                .where('target_user', userId)
                .orderBy('notified_at', 'desc');

            if (!includeRead) {
                query.andWhere('has_read', false);
            }

            const notifications = await query;
            return notifications;
        } catch (error) {
            throw new Error('Could not fetch notifications');
        }
    }

    async markNotificationsAsRead(
        userId: number,
        notificationIds: number[]
    ): Promise<void> {
        try {
            await db('notifications')
                .whereIn('notification_id', notificationIds)
                .andWhere('target_user', userId)
                .update({ has_read: true });
        } catch (error) {
            throw new Error('Could not update notifications');
        }
    }

    async deleteNotifications(
        notificationIds: number[],
        userId: number
    ): Promise<void> {
        try {
            await db('notifications')
                .whereIn('notification_id', notificationIds)
                .andWhere('target_user', userId)
                .del();
        } catch (error) {
            throw new Error('Could not delete notification');
        }
    }
}

export default new NotificationsDAL();