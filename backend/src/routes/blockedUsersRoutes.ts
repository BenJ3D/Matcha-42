import {Router} from 'express';
import BlockedUsersController from '../controllers/BlockedUsersController';
import {validateIdMiddleware} from '../middlewares/validateIdMiddleware';

const router = Router();

/**
 * @swagger
 * /blocked-users:
 *   get:
 *     summary: Récupérer la liste des utilisateurs bloqués et ceux qui vous ont bloqué
 *     tags:
 *       - BlockedUsers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs bloqués et des utilisateurs qui vous ont bloqué
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBlockedResponseDto'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', BlockedUsersController.getUserBlockedData);

/**
 * @swagger
 * /blocked-users/{userId}:
 *   post:
 *     summary: Bloquer un utilisateur
 *     tags:
 *       - BlockedUsers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à bloquer
 *     responses:
 *       200:
 *         description: Utilisateur bloqué avec succès
 *       400:
 *         description: ID invalide ou tentative de se bloquer soi-même
 *       404:
 *         description: Utilisateur cible non trouvé
 *       409:
 *         description: Utilisateur déjà bloqué
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/:userId', validateIdMiddleware, BlockedUsersController.blockUser);

/**
 * @swagger
 * /blocked-users/{userId}:
 *   delete:
 *     summary: Débloquer un utilisateur
 *     tags:
 *       - BlockedUsers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à débloquer
 *     responses:
 *       200:
 *         description: Utilisateur débloqué avec succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Blocage non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:userId', validateIdMiddleware, BlockedUsersController.unblockUser);

export default router;
