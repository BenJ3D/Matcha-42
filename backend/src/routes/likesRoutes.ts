import {Router} from 'express';
import LikesController from '../controllers/LikesController';
import {validateIdMiddleware} from "../middlewares/validateIdMiddleware";

const router = Router();

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Récupérer les likes de l'utilisateur (donnés et reçus)
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Listes des likes donnés et reçus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likesGiven:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserLightResponseDto'
 *                 likesReceived:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserLightResponseDto'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', LikesController.getMyLikes);

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
router.post('/:userId', validateIdMiddleware, LikesController.addLike);

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
router.delete('/:userId', validateIdMiddleware, LikesController.removeLike);

export default router;