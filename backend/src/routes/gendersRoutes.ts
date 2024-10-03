import {Router} from 'express';
import GendersController from '../controllers/gendersController';

const router = Router();

/**
 * @swagger
 * /genders:
 *   get:
 *     summary: Récupérer tous les genres
 *     tags:
 *       - Genres
 *     responses:
 *       200:
 *         description: Liste des genres
 */
router.get('/', GendersController.getAllGenders);

export default router;