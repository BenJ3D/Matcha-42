import {Response} from 'express';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import VisitedProfilesService from '../services/VisitedProfilesService';
import {validateIdNumber} from "../utils/validateIdNumber";

class VisitedProfilesController {
    async getMyVisits(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            validateIdNumber(userId, res);

            const {visitsMade, visitsReceived} = await VisitedProfilesService.getVisitHistoryForUser(userId);
            res.json({visitsMade, visitsReceived});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Erreur'});
        }
    }


    async addVisit(req: AuthenticatedRequest, res: Response) {
        try {
            const visiterId = req.userId!;
            const visitedId = parseInt(req.params.userId, 10);
            validateIdNumber(visiterId, res);
            validateIdNumber(visitedId, res);

            await VisitedProfilesService.addVisit(visiterId, visitedId);

            res.status(201).json({message: 'Visite enregistrée avec succès'});
        } catch (error: any) {
            if (error.status == 201)
                res.status(error.status).json({message: error.message || 'Erreur'});
            else
                res.status(error.status || 500).json({error: error.message || 'Erreur'});
        }
    }
}

export default new VisitedProfilesController();