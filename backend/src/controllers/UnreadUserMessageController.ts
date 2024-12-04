import { Response } from 'express';
import UnreadUserMessageService from '../services/UnreadUserMessageService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class UnreadUserMessageController {
    async removeUnreadChat(req: AuthenticatedRequest, res: Response) {
        const ownerUserId = req.userId!;
        const targetUserId = parseInt(req.params.userId, 10);

        try {
            await UnreadUserMessageService.removeUnreadChat(targetUserId, ownerUserId);
            res.status(200).json({ message: 'Message non lu supprimé avec succès' });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erreur' });
        }
    }

    async getUnreadMessages(req: AuthenticatedRequest, res: Response) {
        const userId = req.userId!;

        try {
            const unreadMessages = await UnreadUserMessageService.getUnreadChatForUser(userId);
            res.status(200).json({ unreadMessages });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message || 'Erreur' });
        }
    }
}

export default new UnreadUserMessageController();
