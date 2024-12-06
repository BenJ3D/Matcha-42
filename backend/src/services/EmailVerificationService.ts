import transporter from '../config/mailer';
import config from '../config/config';
import db from '../config/knexConfig';
import jwtService from "./JwtService";
import {IJwtPayload} from "../types/IJwtPayload";
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
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
                        <h2 style="color: #4B0082;">Bienvenue sur Matcha</h2>
                        <p>Bonjour ${firstName},</p>
                        <p>Merci de vous être inscrit sur Matcha. Pour vérifier votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
                        <a href="${fullVerificationLink}" style="
                            display: inline-block;
                            padding: 10px 20px;
                            font-size: 16px;
                            color: #fff;
                            background-color: #4B0082;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        ">Vérifier mon compte</a>
                        <p>Ce lien expirera dans ${config.jwtEmailExpiration}.</p>
                        <hr style="border: none; border-top: 1px solid #eee;">
                        <p style="color: #555;">Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
        } catch (error: any) {
            throw {
                status: error.status,
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
                return {success: false, message: 'Utilisateur déjà vérifié.'};
            }
            const payload = jwtService.verifyGenericToken(token, config.jwtEmailSecret + user.email);
            if (!payload) {
                throw {
                    status: 400,
                    message: 'Impossible de verifier l\'email.'
                };
            }

            const updatedRows = await db('users').where({id: userId}).update({is_verified: true});

            if (updatedRows === 0) {
                return {success: false, message: 'Utilisateur non trouvé.'};
            }

            return {success: true, message: 'Email vérifié avec succès.'};
        } catch (error) {
            throw Error();
        }
    }

    async sendEmail(mailOptions: any): Promise<void> {
        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw {
                status: 500,
                message: 'Erreur lors de l\'envoi de l\'email.'
            };
        }
    }

}

export default new EmailVerificationService();