import GenderDAL from '../DataAccessLayer/GenderDAL';
import {Gender} from '../models/Genders';

class GendersService {
    async getAllGenders(): Promise<Gender[]> {
        return await GenderDAL.getAllGenders();
    }
}

export default new GendersService();