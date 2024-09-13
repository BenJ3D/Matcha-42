import {Router} from 'express';
import LoginController from "../controllers/loginController";

const router = Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification utilisateur
 *     description: Connecte un utilisateur et renvoie un JWT
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Succès, retourne un access et un refresh token
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/', LoginController.loginWithPassword);
router.post('/refresh', LoginController.refreshToken);

export default router;
