import {Request, Response} from 'express';
import GendersService from '../services/GendersService';

class GendersController {
    async getAllGenders(req: Request, res: Response) {
        try {
            const genders = await GendersService.getAllGenders();
            res.json(genders);
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Erreur'});
        }
    }
}

export default new GendersController();