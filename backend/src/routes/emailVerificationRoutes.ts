import {Router} from 'express';
import EmailVerificationController from '../controllers/EmailVerificationController';
import UserController from "../controllers/userController";

const router = Router();

/**
 * @swagger
 * /verify-email:
 *   get:
 *     summary: Vérifie l'adresse email de l'utilisateur
 *     tags:
 *       - Authentification
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de vérification envoyé par email
 *     responses:
 *       200:
 *         description: Email vérifié avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email vérifié avec succès."
 *       400:
 *         description: Token de vérification manquant, invalide ou expiré.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token de vérification invalide ou expiré."
 */
router.get('/', EmailVerificationController.verifyEmail);


/**
 * @swagger
 * /verify-email/resend:
 *   get:
 *     summary: Renvoie un nouveau token de vérification à l'utilisateur
 *     description: Permet à un utilisateur dont le token de vérification a expiré de recevoir un nouveau token par email.
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Email envoyé avec succès.
 *       400:
 *         description: Email déjà validé.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.get('/resend', UserController.sendEmailForVerification);

export default router;