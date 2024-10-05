import {Router} from 'express';
import UnlikesController from '../controllers/UnlikesController';
import {validateIdMiddleware} from "../middlewares/validateIdMiddleware";

const router = Router();

/**
 * @swagger
 * /unlikes:
 *   get:
 *     summary: Récupérer tous les unlikes de l'utilisateur authentifié
 *     tags:
 *       - Unlikes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des unlikes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unlikes:
 *                   type: array
 *                   items:
 *                     type: integer
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', UnlikesController.getMyUnlikes);

/**
 * @swagger
 * /unlikes/{userId}:
 *   post:
 *     summary: Ajouter un unlike à un utilisateur
 *     tags:
 *       - Unlikes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à unliker
 *     responses:
 *       200:
 *         description: Utilisateur unliké avec succès
 *       400:
 *         description: ID invalide ou tentative d'unliker soi-même
 *       404:
 *         description: Utilisateur cible non trouvé
 *       409:
 *         description: Unlike déjà existant
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/:userId', validateIdMiddleware, UnlikesController.addUnlike);

/**
 * @swagger
 * /unlikes/{userId}:
 *   delete:
 *     summary: Retirer un unlike d'un utilisateur
 *     tags:
 *       - Unlikes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur dont on veut retirer le unlike
 *     responses:
 *       200:
 *         description: Unlike retiré avec succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Unlike non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:userId', validateIdMiddleware, UnlikesController.removeUnlike);

export default router;