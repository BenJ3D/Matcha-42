import {Request, Response} from 'express';
import UnreadUserMessageService from '../services/UnreadUserMessageService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class UnreadUserMessageController {
    async addUnreadMessage(req: AuthenticatedRequest, res: Response) {
        const ownerUserId = req.userId!;
        const targetUserId = parseInt(req.params.userId, 10);

        try {
            await UnreadUserMessageService.addUnreadMessage(ownerUserId, targetUserId);
            res.status(201).json({message: 'Message non lu ajouté avec succès'});
        } catch (error: any) {
            res.status(error.status || 500).json({message: error.message || 'Erreur interne du serveur'});
        }
    }

    async removeUnreadMessage(req: AuthenticatedRequest, res: Response) {
        const ownerUserId = req.userId!;
        const targetUserId = parseInt(req.params.userId, 10);

        try {
            await UnreadUserMessageService.removeUnreadMessage(ownerUserId, targetUserId);
            res.status(200).json({message: 'Message non lu supprimé avec succès'});
        } catch (error: any) {
            res.status(error.status || 500).json({message: error.message || 'Erreur interne du serveur'});
        }
    }

    async getUnreadMessages(req: AuthenticatedRequest, res: Response) {
        const userId = req.userId!;

        try {
            const unreadMessages = await UnreadUserMessageService.getUnreadMessagesForUser(userId);
            res.status(200).json({unreadMessages});
        } catch (error: any) {
            res.status(error.status || 500).json({message: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new UnreadUserMessageController();
