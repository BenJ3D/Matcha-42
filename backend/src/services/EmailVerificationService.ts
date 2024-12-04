import transporter from '../config/mailer';
import config from '../config/config';
import db from '../config/knexConfig';
import jwtService from "./JwtService";
import { IJwtPayload } from "../types/IJwtPayload";
import UserServices from "./UserServices";

class EmailVerificationService {
    async sendVerificationEmail(userId: number, email: string, firstName: string): Promise<void> {
        try {
            const payload: IJwtPayload = {
                id: userId,
            }

            const token: string = jwtService.generateGenericToken(payload, config.jwtEmailSecret + email, config.jwtEmailExpiration);

            const verificationLink = `${config.frontUrl}callback`;
            const fullVerificationLink = `${verificationLink}/verify-email?token=${token}`;

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

            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw {
                status: 400,
                message: 'Impossible d\'envoyer l\'email de vérification.'
            };
        }
    }

    async verifyEmail(token: string): Promise<{ success: boolean, message: string }> {
        try {

            const userId = jwtService.decodeToken(token)?.id;
            if (!userId) {
                throw {
                    status: 400,
                    message: 'Token invalide.'
                };
            }

            const user = await UserServices.getUserById(userId);
            if (!user) {
                throw {
                    status: 404,
                    message: 'User not found.'
                };
            }
            if (user.is_verified) {
                return { success: false, message: 'Utilisateur déjà vérifié.' };
            }
            const payload = jwtService.verifyGenericToken(token, config.jwtEmailSecret + user.email);
            if (!payload) {
                throw {
                    status: 400,
                    message: 'Impossible de verifier l\'email.'
                };
            }

            const updatedRows = await db('users').where({ id: userId }).update({ is_verified: true });

            if (updatedRows === 0) {
                return { success: false, message: 'Utilisateur non trouvé.' };
            }

            return { success: true, message: 'Email vérifié avec succès.' };
        } catch (error) {
            throw Error();
        }
    }
}

export default new EmailVerificationService();