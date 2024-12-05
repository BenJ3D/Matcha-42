import UserServices from './UserServices';
import jwtService from './JwtService';
import config from '../config/config';
import EmailVerificationService from './EmailVerificationService';
import { PasswordService } from './PasswordService';

class PasswordResetService {
  async sendResetEmail(email: string) {
    const user = await UserServices.getUserByEmail(email);
    if (!user) {
      throw { status: 404, message: 'Utilisateur non trouvé.' };
    }
    

    const token = jwtService.generateGenericToken(
      { id: user.id },
      config.jwtEmailSecret + user.id,
      config.jwtEmailExpiration
    );

    const resetLink = `${config.frontUrl}password-reset?token=${token}`;

    await EmailVerificationService.sendEmail({
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
    const payload = jwtService.verifyGenericToken(token, config.jwtEmailSecret);
    if (!payload || !payload.id) {
      throw { status: 400, message: 'Token invalide ou expiré.' };
    }

    const hashedPassword = await PasswordService.hashPassword(newPassword);
    await UserServices.updatePassword(payload.id, hashedPassword);
  }
}

export default new PasswordResetService();