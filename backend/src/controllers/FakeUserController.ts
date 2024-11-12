import { Response } from 'express';
import FakeUserService from '../services/FakeUserService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { validateIdNumber } from "../utils/validateIdNumber";

class FakeUserController {
    async reportUser(req: AuthenticatedRequest, res: Response) {
        try {
            const reporterId = req.userId!;
            const reportedUserId = parseInt(req.params.userId, 10);

            validateIdNumber(reporterId, res);
            validateIdNumber(reportedUserId, res);

            await FakeUserService.reportUser(reporterId, reportedUserId);
            res.status(200).json({ message: 'Utilisateur déclaré comme faux avec succès' });
        } catch (error: any) {
            console.error('Erreur lors de la déclaration de l\'utilisateur comme faux:', error);
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }

    async unreportUser(req: AuthenticatedRequest, res: Response) {
        try {
            const reporterId = req.userId!;
            const reportedUserId = parseInt(req.params.userId, 10);

            validateIdNumber(reporterId, res);
            validateIdNumber(reportedUserId, res);

            await FakeUserService.unreportUser(reporterId, reportedUserId);
            res.status(200).json({ message: 'Déclaration retirée avec succès' });
        } catch (error: any) {
            console.error('Erreur lors du retrait de la déclaration:', error);
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }

    async checkIfFake(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = parseInt(req.params.userId, 10);
            validateIdNumber(userId, res);

            const isFake = await FakeUserService.checkIfUserIsFake(userId);
            res.json({ isFake });
        } catch (error: any) {
            console.error('Erreur lors de la vérification de l\'état de l\'utilisateur:', error);
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }
}

export default new FakeUserController();