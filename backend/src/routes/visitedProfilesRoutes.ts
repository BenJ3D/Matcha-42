import {Router} from 'express';
import VisitedProfilesController from '../controllers/VisitedProfilesController';
import {validateIdMiddleware} from '../middlewares/validateIdMiddleware';

const router = Router();

/**
 * @swagger
 * /visited-profiles:
 *   get:
 *     summary: Récupérer l'historique des visites pour l'utilisateur authentifié
 *     tags:
 *       - Visited Profiles
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des visites
 *       401:
 *         description: Non autorisé
 */
router.get('/', VisitedProfilesController.getMyVisits);

/**
 * @swagger
 * /visited-profiles/{userId}:
 *   post:
 *     summary: Enregistrer une visite de profil
 *     tags:
 *       - Visited Profiles
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur visité
 *     responses:
 *       201:
 *         description: Visite enregistrée avec succès
 *       400:
 *         description: ID de l'utilisateur invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/:userId', validateIdMiddleware, VisitedProfilesController.addVisit);

export default router;