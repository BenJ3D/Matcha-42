import jwt from 'jsonwebtoken';
import transporter from '../config/mailer';
import config from '../config/config';
import db from '../config/knexConfig';

class EmailVerificationService {
    async sendVerificationEmail(userId: number, email: string, firstName: string): Promise<void> {
        try {
            // Générer un token JWT pour la vérification
            const token = jwt.sign(
                {userId},
                config.jwtEmailSecret,
                {expiresIn: config.jwtEmailExpiration}
            );

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

            console.log(`Sending verification email to ${email} with token: ${token}`);
            await transporter.sendMail(mailOptions);
            console.log(`Verification email sent successfully to ${email}`);
        } catch (error) {
            console.error(`Error sending verification email to ${email}:`, error);
            throw {
                status: 500,
                message: 'Impossible d\'envoyer l\'email de vérification.'
            };
        }
    }

    async verifyEmail(token: string): Promise<{ success: boolean, message: string }> {
        try {
            const decoded = jwt.verify(token, config.jwtEmailSecret) as { userId: number };
            const userId = decoded.userId;

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
            return {success: false, message: 'Token de vérification invalide ou expiré.'};
        }
    }
}

export default new EmailVerificationService();