import UserServices from './UserServices';
import jwtService from './JwtService';
import config from '../config/config';
import EmailVerificationService from './EmailVerificationService';
import {PasswordService} from './PasswordService';

class PasswordResetService {
    async sendResetEmail(email: string) {
        if (!email) {
            throw {status: 400, message: 'Email requis.'};
        }
        const user = await UserServices.getUserByEmail(email);
        if (!user) {
            throw {status: 404, message: 'Utilisateur non trouvé.'};
        }


        const token = jwtService.generateGenericToken(
            {id: user.id, email: user.email},
            config.jwtPassResetSecret,
            config.jwtEmailExpiration
        );

        const resetLink = `${config.frontUrl}password-reset?token=${token}`;

        await EmailVerificationService.sendEmail({
            from: config.emailFrom,
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
        <p>Bonjour ${user.first_name},</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans ${config.jwtEmailExpiration}.</p>
      `,
        });
    }

    async resetPassword(token: string, newPassword: string) {
        const payload = jwtService.verifyGenericToken(token, config.jwtPassResetSecret);
        console.log(JSON.stringify(payload));
        if (!payload || !payload.id) {
            throw {status: 400, message: 'Token invalide ou expiré.'};
        }

        const hashedPassword = await PasswordService.hashPassword(newPassword);
        await UserServices.updatePassword(payload.id, hashedPassword);
    }
}

export default new PasswordResetService();