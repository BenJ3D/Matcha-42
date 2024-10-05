import {Request, Response} from 'express';
import LikesService from '../services/LikesService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class LikesController {
    async getMyLikes(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const likes = await LikesService.getUserLikes(userId);
            res.json({likes});
        } catch (error: any) {
            console.error('Erreur lors de la récupération des likes:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async likeUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);

            if (isNaN(targetUserId)) {
                res.status(400).json({error: 'ID de l\'utilisateur cible invalide'});
                return;
            }

            await LikesService.likeUser(userId, targetUserId);
            res.status(200).json({message: 'Utilisateur liké avec succès'});
        } catch (error: any) {
            console.error('Erreur lors du like de l\'utilisateur:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async unlikeUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);

            if (isNaN(targetUserId)) {
                res.status(400).json({error: 'ID de l\'utilisateur cible invalide'});
                return;
            }

            await LikesService.unlikeUser(userId, targetUserId);
            res.status(200).json({message: 'Like retiré avec succès'});
        } catch (error: any) {
            console.error('Erreur lors du retrait du like:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new LikesController();