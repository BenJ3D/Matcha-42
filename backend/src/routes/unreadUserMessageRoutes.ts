// src/routes/unreadUserMessageRoutes.ts
import {Router} from 'express';
import UnreadUserMessageController from '../controllers/UnreadUserMessageController';
import {validateIdMiddleware} from '../middlewares/validateIdMiddleware';

const router = Router();

/**
 * @swagger
 * /unread-messages/{userId}:
 *   post:
 *     summary: Ajouter un message non lu pour un utilisateur cible
 *     tags:
 *       - Messages Non Lus
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur cible
 *     responses:
 *       201:
 *         description: Message non lu ajouté avec succès
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/:userId', validateIdMiddleware, UnreadUserMessageController.addUnreadMessage);

/**
 * @swagger
 * /unread-messages/{userId}:
 *   delete:
 *     summary: Supprimer un message non lu pour un utilisateur cible
 *     tags:
 *       - Messages Non Lus
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur cible
 *     responses:
 *       200:
 *         description: Message non lu supprimé avec succès
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:userId', validateIdMiddleware, UnreadUserMessageController.removeUnreadMessage);

/**
 * @swagger
 * /unread-messages:
 *   get:
 *     summary: Récupérer les messages non lus pour l'utilisateur authentifié
 *     tags:
 *       - Messages Non Lus
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages non lus
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', UnreadUserMessageController.getUnreadMessages);

export default router;
