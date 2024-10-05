import {Request, Response} from 'express';
import MatchesService from '../services/MatchesService';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class MatchesController {
    async getMyMatches(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const matches = await MatchesService.getUserMatches(userId);
            res.json(matches);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des matches:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new MatchesController();