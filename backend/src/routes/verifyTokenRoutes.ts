import {Router} from 'express';
import VerifyTokenController from '../controllers/VerifyTokenController';

/**
 * @swagger
 * /verify-token:
 *   get:
 *     summary: Vérifie la validité du token JWT fourni
 *     tags:
 *       - Authentification
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Indique si le token est valide et retourne le payload si c'est le cas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 payload:
 *                   $ref: '#/components/schemas/IJwtPayload'
 *       400:
 *         description: Aucun token fourni.
 *       401:
 *         description: Token invalide ou expiré.
 */
const router = Router();

router.get('/', VerifyTokenController.verifyToken);

export default router;