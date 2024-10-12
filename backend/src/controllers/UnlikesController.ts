import {Response} from 'express';
import UnlikesService from '../services/UnlikesService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import {checkUserId} from "../utils/checkUserId";

class UnlikesController {
    async getMyUnlikes(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            checkUserId(userId, res);

            const {unlikesGiven, unlikesReceived} = await UnlikesService.getUserUnlikes(userId);
            res.json({unlikesGiven, unlikesReceived});
        } catch (error: any) {
            console.error('Erreur lors de la récupération des unlikes:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async addUnlike(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);
            checkUserId(userId, res);
            checkUserId(targetUserId, res);

            await UnlikesService.addUnlike(userId, targetUserId);
            res.status(200).json({message: 'Utilisateur unliké avec succès'});
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout du unlike:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async removeUnlike(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);

            checkUserId(userId, res);
            checkUserId(targetUserId, res);

            await UnlikesService.removeUnlike(userId, targetUserId);
            res.status(200).json({message: 'Unlike retiré avec succès'});
        } catch (error: any) {
            console.error('Erreur lors du retrait du unlike:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new UnlikesController();