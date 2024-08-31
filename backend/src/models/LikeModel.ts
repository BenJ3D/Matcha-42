import RelationModel from '../customORM/RelationModel';
import { Like } from './types';

class LikeModel extends RelationModel<Like> {
    constructor() {
        super('likes');
    }
}

export default new LikeModel();
