import {Router} from 'express';
import NotificationsController from '../controllers/NotificationsController';
import {validateIdMiddleware} from '../middlewares/validateIdMiddleware';

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeRead
 *         schema:
 *           type: boolean
 *         description: Whether to include read notifications
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', NotificationsController.getNotifications);

/**
 * @swagger
 * /notifications/markAsRead:
 *   post:
 *     summary: Mark notifications as read
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *             required:
 *               - notificationIds
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */
router.post('/markAsRead', NotificationsController.markAsRead);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted
 *       400:
 *         description: Invalid notification ID
 */
router.delete(
    '/:notificationId',
    validateIdMiddleware,
    NotificationsController.deleteNotification
);

export default router;