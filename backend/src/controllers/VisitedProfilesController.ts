import {Response} from 'express';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import VisitedProfilesService from '../services/VisitedProfilesService';
import {isValidId} from '../utils/validateId';

class VisitedProfilesController {
    async getMyVisits(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;

            const visits = await VisitedProfilesService.getVisitHistoryForUser(userId);

            res.json({visits});
        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'historique des visites:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async addVisit(req: AuthenticatedRequest, res: Response) {
        try {
            const visiterId = req.userId!;
            const visitedId = parseInt(req.params.userId, 10);

            // Valider l'ID de l'utilisateur
            if (!isValidId(visitedId)) {
                return res.status(400).json({error: 'ID de l\'utilisateur invalide'});
            }

            await VisitedProfilesService.addVisit(visiterId, visitedId);

            res.status(201).json({message: 'Visite enregistrée avec succès'});
        } catch (error: any) {
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }
}

export default new VisitedProfilesController();