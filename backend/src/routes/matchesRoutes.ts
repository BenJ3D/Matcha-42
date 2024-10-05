import {Router} from 'express';
import MatchesController from '../controllers/MatchesController';

const router = Router();

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Récupérer les matches de l'utilisateur connecté
 *     tags:
 *       - Matches
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserLightResponseDto'
 */
router.get('/', MatchesController.getMyMatches);

export default router;