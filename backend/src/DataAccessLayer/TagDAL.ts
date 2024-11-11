import db from '../config/knexConfig';
import {Tag} from '../models/Tags';

class TagDAL {
    async getAllTags(): Promise<Tag[]> {
        try {
            return await db('tags').select('*');
        } catch (error) {
            console.error('Erreur lors de la récupération des tags:', error);
            throw {status: 400, message: 'Impossible de récupérer les tags'};
        }
    }

    async getTagById(tagId: number): Promise<Tag | null> {
        try {
            const tag = await db('tags')
                .select('*')
                .where('tag_id', tagId)
                .first();
            return tag || null;
        } catch (error) {
            console.error(`Erreur lors de la récupération du tag avec l'ID ${tagId}:`, error);
            throw {status: 400, message: 'Impossible de récupérer le tag'};
        }
    }
}

export default new TagDAL();