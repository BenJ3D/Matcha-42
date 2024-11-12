import { Router } from 'express';
import FakeUserController from '../controllers/FakeUserController';
import { validateIdMiddleware } from "../middlewares/validateIdMiddleware";

const router = Router();

/**
 * @swagger
 * /fake-users/{userId}:
 *   post:
 *     summary: Déclarer un utilisateur comme faux
 *     tags:
 *       - Fake Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à déclarer comme faux
 *     responses:
 *       200:
 *         description: Utilisateur déclaré comme faux avec succès
 *       400:
 *         description: ID invalide ou tentative de déclaration par soi-même
 *       404:
 *         description: Utilisateur cible non trouvé
 *       409:
 *         description: Déclaration déjà existante
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/:userId', validateIdMiddleware, FakeUserController.reportUser);

/**
 * @swagger
 * /fake-users/{userId}:
 *   delete:
 *     summary: Retirer la déclaration d'un utilisateur comme faux
 *     tags:
 *       - Fake Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur dont on veut retirer la déclaration
 *     responses:
 *       200:
 *         description: Déclaration retirée avec succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Déclaration non trouvée
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.delete('/:userId', validateIdMiddleware, FakeUserController.unreportUser);

/**
 * @swagger
 * /fake-users/{userId}/check:
 *   get:
 *     summary: Vérifier si un utilisateur est déclaré comme faux
 *     tags:
 *       - Fake Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à vérifier
 *     responses:
 *       200:
 *         description: Statut de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFake:
 *                   type: boolean
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/:userId/check', validateIdMiddleware, FakeUserController.checkIfFake);

export default router;