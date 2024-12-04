import db from '../config/knexConfig';
import { Tag } from '../models/Tags';

class TagDAL {
    async getAllTags(): Promise<Tag[]> {
        try {
            return await db('tags').select('*');
        } catch (error) {
            throw { status: 400, message: 'Impossible de récupérer les tags' };
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
            throw { status: 400, message: 'Impossible de récupérer le tag' };
        }
    }
}

export default new TagDAL();