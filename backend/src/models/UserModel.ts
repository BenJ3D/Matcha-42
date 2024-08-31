import Model from '../customORM/BaseModel';
import { User } from './types';

class UserModel extends Model<User> {
    constructor() {
        super('users');
    }

    // Ajoutez des méthodes spécifiques à User si nécessaire, ou utilisez simplement celles de la classe de base
}

export default new UserModel();
