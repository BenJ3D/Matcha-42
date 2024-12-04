import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import BlockedUsersService from '../services/BlockedUsersService';
import { validateIdNumber } from '../utils/validateIdNumber';

class BlockedUsersController {
    async blockUser(req: AuthenticatedRequest, res: Response) {
        try {
            const blockerId = req.userId!;
            const blockedId = parseInt(req.params.userId, 10);

            validateIdNumber(blockedId, res);

            await BlockedUsersService.blockUser(blockerId, blockedId);

            res.status(200).json({ message: 'Utilisateur bloqué avec succès' });
        } catch (error: any) {
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }

    async unblockUser(req: AuthenticatedRequest, res: Response) {
        try {
            const blockerId = req.userId!;
            const blockedId = parseInt(req.params.userId, 10);

            validateIdNumber(blockedId, res);

            await BlockedUsersService.unblockUser(blockerId, blockedId);

            res.status(200).json({ message: 'Utilisateur débloqué avec succès' });
        } catch (error: any) {
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }

    async getUserBlockedData(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;

            const blockedData = await BlockedUsersService.getUserBlockedData(userId);

            res.status(200).json(blockedData);
        } catch (error: any) {
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }
}

export default new BlockedUsersController();
