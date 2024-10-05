import {Response} from 'express';
import LikesService from '../services/LikesService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import {checkIsValidId, isValidId} from "../utils/checkIsValidId";

class LikesController {
    async getMyLikes(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            isValidId(userId, res);
            const likes = await LikesService.getUserLikes(userId);
            res.json({likes});
        } catch (error: any) {
            console.error('Erreur lors de la récupération des likes:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }

    async addLike(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);

            await LikesService.addLike(userId, targetUserId);
            res.status(200).json({message: 'Utilisateur liké avec succès'});
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout du like:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }

    async removeLike(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);

            isValidId(userId, res);
            isValidId(targetUserId, res);
            await LikesService.removeLike(userId, targetUserId);
            res.status(200).json({message: 'Like retiré avec succès'});
        } catch (error: any) {
            console.error('Erreur lors du retrait du like:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }
}

export default new LikesController();