// src/controllers/UnlikesController.ts

import {Request, Response} from 'express';
import UnlikesService from '../services/UnlikesService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class UnlikesController {
    async getMyUnlikes(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const unlikes = await UnlikesService.getUserUnlikes(userId);
            res.json({unlikes});
        } catch (error: any) {
            console.error('Erreur lors de la récupération des unlikes:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async addUnlike(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const targetUserId = parseInt(req.params.userId, 10);

            if (isNaN(targetUserId)) {
                return res.status(400).json({error: 'ID de l\'utilisateur cible invalide'});
            }

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

            if (isNaN(targetUserId)) {
                return res.status(400).json({error: 'ID de l\'utilisateur cible invalide'});
            }

            await UnlikesService.removeUnlike(userId, targetUserId);
            res.status(200).json({message: 'Unlike retiré avec succès'});
        } catch (error: any) {
            console.error('Erreur lors du retrait du unlike:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new UnlikesController();