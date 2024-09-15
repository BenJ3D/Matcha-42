import {Router} from 'express';
import LoginController from "../controllers/loginController";

const router = Router();

/**
 * @swagger
 * /login:
 *   post:
 *     security: []
 *     summary: Authentification utilisateur
 *     description: Authentifie un utilisateur avec son email et mot de passe, retourne un JWT.
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
 *                 description: Email de l'utilisateur
 *                 example: jean.dupont@mail.fr
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Succès de la connexion, retourne un access et un refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Identifiants incorrects.
 *       400:
 *         description: Erreur de validation.
 */
router.post('/', LoginController.loginWithPassword);

/**
 * @swagger
 * /login/refresh:
 *   post:
 *     security: []
 *     summary: Rafraîchir le token JWT
 *     description: Génère de nouveaux tokens à partir du refresh token fourni.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token de l'utilisateur
 *     responses:
 *       200:
 *         description: Retourne les nouveaux access et refresh tokens.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token invalide.
 *       400:
 *         description: Le refresh token est requis.
 */
router.post('/refresh', LoginController.refreshToken);

export default router;
