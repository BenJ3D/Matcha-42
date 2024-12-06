import {Request, Response} from 'express';
import PasswordResetService from '../services/PasswordResetService';
import {AuthenticatedRequest} from "../middlewares/authMiddleware";

class PasswordResetController {
    async requestPasswordReset(req: Request, res: Response) {
        const {email} = req.body;
        try {
            await PasswordResetService.sendResetEmail(email);
            res.status(200).json({message: 'Un lien de réinitialisation a été envoyé à votre email.'});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Erreur lors de l\'envoi de l\'email.'});
        }
    }

    async resetPassword(req: AuthenticatedRequest, res: Response) {
        const {token, newPassword} = req.body;
        try {
            await PasswordResetService.resetPassword(token, newPassword);
            res.status(200).json({message: 'Votre mot de passe a été réinitialisé avec succès.'});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Erreur lors de la réinitialisation du mot de passe.'});
        }
    }
}

export default new PasswordResetController();