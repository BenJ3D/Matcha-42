import {Request, Response} from 'express';
import GendersService from '../services/GendersService';

class GendersController {
    async getAllGenders(req: Request, res: Response) {
        try {
            const genders = await GendersService.getAllGenders();
            res.json(genders);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des genres:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new GendersController();