import {Request, Response} from 'express';
import NotificationsService from '../services/NotificationsService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class NotificationsController {
    async getNotifications(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const includeRead = req.query.includeRead === 'true';
            const notifications = await NotificationsService.getNotificationsForUser(
                userId,
                includeRead
            );
            res.json(notifications);
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            res
                .status(400)
                .json({error: error.message || 'error'});
        }
    }

    async markAsRead(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const {notificationIds} = req.body;
            if (!Array.isArray(notificationIds)) {
                return res
                    .status(400)
                    .json({error: 'notificationIds must be an array'});
            }
            await NotificationsService.markNotificationsAsRead(userId, notificationIds);
            res.status(200).json({message: 'Notifications marked as read'});
        } catch (error: any) {
            console.error('Error updating notifications:', error);
            res
                .status(400)
                .json({error: error.message || 'error'});
        }
    }

    async deleteNotification(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const notificationId = parseInt(req.params.notificationId, 10);
            if (isNaN(notificationId)) {
                return res.status(400).json({error: 'Invalid notification ID'});
            }
            await NotificationsService.deleteNotifications(userId, [notificationId]);
            res.status(200).json({message: 'Notification deleted'});
        } catch (error: any) {
            console.error('Error deleting notification:', error);
            res
                .status(400)
                .json({error: error.message || 'error'});
        }
    }
}

export default new NotificationsController();