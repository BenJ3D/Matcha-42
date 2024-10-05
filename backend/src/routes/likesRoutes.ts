// src/routes/likesRoutes.ts

import {Router} from 'express';
import LikesController from '../controllers/LikesController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Récupérer tous les likes de l'utilisateur authentifié
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des likes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserLightResponseDto'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', authMiddleware, LikesController.getMyLikes);

/**
 * @swagger
 * /likes/{userId}:
 *   post:
 *     summary: Ajouter un like à un utilisateur
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à liker
 *     responses:
 *       200:
 *         description: Utilisateur liké avec succès
 *       400:
 *         description: ID invalide ou tentative de liker soi-même
 *       404:
 *         description: Utilisateur cible non trouvé
 *       409:
 *         description: Like déjà existant
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/:userId', authMiddleware, LikesController.addLike);

/**
 * @swagger
 * /likes/{userId}:
 *   delete:
 *     summary: Retirer un like d'un utilisateur
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur dont on veut retirer le like
 *     responses:
 *       200:
 *         description: Like retiré avec succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Like non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:userId', authMiddleware, LikesController.removeLike);

export default router;