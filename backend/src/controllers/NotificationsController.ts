import {Response} from 'express';
import NotificationsService from '../services/NotificationsService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import Joi from "joi";
import {MarkAsReadDTO} from "../DTOs/users/MarkAsReadValidationDto";

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
            res
                .status(error.status)
                .json({error: error.message || 'error'});
        }
    }

    async markAsRead(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const {error, value} = MarkAsReadDTO.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: 'Validation échouée',
                    status: 400,
                    details: error.details.map(detail => detail.message),
                });
            }
            const {notificationIds} = value;
            if (!Array.isArray(notificationIds)) {
                return res
                    .status(500)
                    .json({error: 'notificationIds must be an array'});
            }
            await NotificationsService.markNotificationsAsRead(userId, notificationIds);
            res.status(200).json({message: 'Notifications marked as read'});
        } catch (error: any) {
            const statusCode = error.status || 500;
            return res.status(statusCode).json({error: error.message || 'Error'});
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
            res
                .status(400)
                .json({error: error.message || 'error'});
        }
    }
}

export default new NotificationsController();