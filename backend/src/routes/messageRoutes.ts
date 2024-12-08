import {Router} from 'express';
import MessageController from '../controllers/MessageController';
import {validateIdMiddleware} from '../middlewares/validateIdMiddleware';

const router = Router();

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Envoyer un message à un autre utilisateur
 *     tags:
 *       - Messages
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageDto'
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Non autorisé à envoyer un message à cet utilisateur
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/', MessageController.sendMessage);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Récupérer la conversation avec un utilisateur
 *     tags:
 *       - Messages
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur avec qui récupérer la conversation
 *     responses:
 *       200:
 *         description: Conversation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       400:
 *         description: ID utilisateur invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/:userId', validateIdMiddleware, MessageController.getConversation);

router.post('/:messageId/like', MessageController.likeMessage);
router.post('/:messageId/unlike', MessageController.unlikeMessage);
router.delete('/:messageId', MessageController.deleteMessage);

export default router;