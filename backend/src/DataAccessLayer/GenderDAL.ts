import db from '../config/knexConfig';
import {Gender} from '../models/Genders';

class GenderDAL {
    async getAllGenders(): Promise<Gender[]> {
        try {
            const genders = await db('genders').select('*');
            return genders;
        } catch (error) {
            throw {status: 500, message: 'Impossible de récupérer les genres'};
        }
    }
}

export default new GenderDAL();