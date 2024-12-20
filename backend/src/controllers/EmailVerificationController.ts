import { Request, Response } from 'express';
import EmailVerificationService from "../services/EmailVerificationService";

class EmailVerificationController {
    async verifyEmail(req: Request, res: Response) {
        const token = req.query.token as string;

        if (!token) {
            return res.status(400).json({ message: 'Token de vérification manquant.' });
        }

        try {
            const response = await EmailVerificationService.verifyEmail(token);
            if (response.success === true) {
                return res.status(200).json({ message: 'Email vérifié avec succès.' });
            } else {
                return res.status(400).json({ message: 'L\'email n\'a pas pu être vérifié' });
            }

        } catch (error) {
            return res.status(400).json({ message: 'Token de vérification invalide ou expiré.' });
        }
    }
}

export default new EmailVerificationController();