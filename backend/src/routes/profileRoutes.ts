// src/routes/profileRoutes.ts
import {Router} from 'express';
import profileController from '../controllers/profileController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags:
 *       - Profils
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponseDto'
 *       404:
 *         description: Profil non trouvé
 */
router.get('/me', authMiddleware, profileController.getMyProfile);

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Créer un profil pour l'utilisateur connecté
 *     tags:
 *       - Profils
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileCreateDto'
 *     responses:
 *       201:
 *         description: Profil créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profileId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Erreur de validation ou profil déjà existant
 */
router.post('/', authMiddleware, profileController.createMyProfile);

/**
 * @swagger
 * /profiles:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags:
 *       - Profils
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateDto'
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Profil non trouvé
 */
router.put('/', authMiddleware, profileController.updateMyProfile);

/**
 * @swagger
 * /profiles:
 *   delete:
 *     summary: Supprimer le profil de l'utilisateur connecté
 *     tags:
 *       - Profils
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil supprimé avec succès
 *       404:
 *         description: Profil non trouvé
 */
router.delete('/', authMiddleware, profileController.deleteMyProfile);

export default router;
