import transporter from '../config/mailer';
import config from '../config/config';
import db from '../config/knexConfig';
import jwtService from "./JwtService";
import {IJwtPayload} from "../types/IJwtPayload";
import jwt from "jsonwebtoken";
import UserServices from "./UserServices";

class EmailVerificationService {
    async sendVerificationEmail(userId: number, email: string, firstName: string): Promise<void> {
        try {
            // Générer un token JWT pour la vérification
            const payload: IJwtPayload = {
                id: userId,
            }

            const token: string = jwtService.generateGenericToken(payload, config.jwtEmailSecret, config.jwtEmailExpiration);

            // Créer le lien de vérification
            const verificationLink = `${config.frontUrl}/callback`;
            const fullVerificationLink = `${verificationLink}/verify-email?token=${token}`;

            // Envoyer l'email de vérification
            const mailOptions = {
                from: config.emailFrom,
                to: email,
                subject: 'Vérifiez votre compte Matcha',
                html: `
                    <p>Bonjour ${firstName},</p>
                    <p>Merci de vous être inscrit sur Matcha. Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
                    <a href="${fullVerificationLink}">Vérifier mon compte</a>
                    <p>Ce lien expirera dans ${config.jwtEmailExpiration}.</p>
                `,
            };

            console.log(`Sending verification email to ${email} with token: ${token} | payload: ${JSON.stringify(payload)}`);
            console.log(`Validation link URL ${fullVerificationLink}`);
            await transporter.sendMail(mailOptions);
            console.log(`Verification email sent successfully to ${email} | id: ${JSON.stringify(userId)}`);
        } catch (error) {
            console.error(`Error sending verification email to ${email}:`, error);
            throw {
                status: 400,
                message: 'Impossible d\'envoyer l\'email de vérification.'
            };
        }
    }

    async verifyEmail(token: string): Promise<{ success: boolean, message: string }> {
        try {
            const payload = jwtService.verifyGenericToken(token, config.jwtEmailSecret);
            if (!payload) {
                throw {
                    status: 400,
                    message: 'Impossible d\'envoyer l\'email de vérification.'
                };
            }
            const userId = payload.id;

            //Verifier si l' user est déjà is_verified=true
            const user = await UserServices.getUserById(userId);
            if (user?.is_verified) {
                return {success: false, message: 'Utilisateur déjà vérifié.'};
            }

            // Mettre à jour l'utilisateur comme vérifié
            const updatedRows = await db('users').where({id: userId}).update({is_verified: true});

            if (updatedRows === 0) {
                console.log(`User with ID ${userId} not found for verification.`);
                return {success: false, message: 'Utilisateur non trouvé.'};
            }

            console.log(`Email verified successfully for user ID ${userId}`);
            return {success: true, message: 'Email vérifié avec succès.'};
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
            throw Error();
            return {success: false, message: 'Token de vérification invalide ou expiré.'};
        }
    }
}

export default new EmailVerificationService();