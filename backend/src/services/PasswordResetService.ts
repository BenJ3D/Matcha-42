import UserServices from './UserServices';
import jwtService from './JwtService';
import config from '../config/config';
import EmailVerificationService from './EmailVerificationService';
import {PasswordService} from './PasswordService';
import zxcvbn from "zxcvbn";
import UserDAL from "../DataAccessLayer/UserDAL";
import ResetPasswordDTO from "../DTOs/users/ResetPasswordDTO";

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

        const resetLink = `${config.frontUrl}callback/password-reset?token=${token}`;

        await EmailVerificationService.sendEmail({
            from: config.emailFrom,
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
                    <h2 style="color: #4B0082;">Réinitialisation de votre mot de passe</h2>
                    <p>Bonjour ${user.first_name},</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder :</p>
                    <a href="${resetLink}" style="
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: #fff;
                        background-color: #4B0082;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    ">Réinitialiser mon mot de passe</a>
                    <p>Ce lien expirera dans ${config.jwtEmailExpiration}.</p>
                    <hr style="border: none; border-top: 1px solid #eee;">
                    <p style="color: #555;">Si vous n'avez pas demandé la réinitialisation de votre mot de passe, veuillez ignorer cet email.</p>
                </div>
            `,
        });
    }

    async resetPassword(token: string, newPassword: string) {
        const {error, value} = ResetPasswordDTO.validate({token, newPassword});
        if (error) {
            throw {status: 400, message: "Validation échouée " + error.message, details: error.details};
        }

        const payload = jwtService.verifyGenericToken(value.token, config.jwtPassResetSecret);
        if (!payload || !payload.id) {
            throw {status: 401, message: 'Invalid or expired token.'};
        }

        const targetExists = await UserDAL.userExists(payload.id);
        if (!targetExists) {
            throw {status: 404, message: 'User of your token does not exist'};
        }

        const requiredScore = config.userPasswordStrengthForce;

        const passwordEvaluation = zxcvbn(value.newPassword);
        if (passwordEvaluation.score < requiredScore) {
            throw {
                status: 400,
                message: 'The password is too weak. Please choose a stronger one.'
            };
        }

        const hashedPassword = await PasswordService.hashPassword(value.newPassword);
        await UserServices.updatePassword(payload.id, hashedPassword);
    }
}

export default new PasswordResetService();