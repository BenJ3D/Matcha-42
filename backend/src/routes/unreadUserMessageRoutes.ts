// src/routes/unreadUserMessageRoutes.ts
import {Router} from 'express';
import UnreadUserMessageController from '../controllers/UnreadUserMessageController';
import {validateIdMiddleware} from '../middlewares/validateIdMiddleware';

const router = Router();

// /**
//  * @swagger
//  * /unread-messages/{userId}:
//  *   post:
//  *     summary: Ajouter un message non lu pour un utilisateur cible
//  *     tags:
//  *       - Messages Non Lus
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID de l'utilisateur cible
//  *     responses:
//  *       201:
//  *         description: Message non lu ajouté avec succès
//  *       400:
//  *         description: ID invalide
//  *       500:
//  *         description: Erreur interne du serveur
//  */
// router.post('/:userId', validateIdMiddleware, UnreadUserMessageController.addUnreadMessage);

/**
 * @swagger
 * /unread-messages/{userId}:
 *   delete:
 *     summary: Marquer comme lu une conversation avec un autre utilisateur
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
 *         description: La conversation à bien été marqué comme lu
 *       400:
 *         description: ID invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:userId', validateIdMiddleware, UnreadUserMessageController.removeUnreadChat);

/**
 * @swagger
 * /unread-messages:
 *   get:
 *     summary: Savoir si on a un ou plusieurs messages non lus avec un d'autre utilisateur
 *     tags:
 *       - Conversation Non Lus
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste userId de conversation avec des messages non lus.
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', UnreadUserMessageController.getUnreadMessages);

export default router;
