import db from '../config/knexConfig';
import {Photo} from '../models/Photo';

class PhotoDAL {
    async getPhotoCountByUser(userId: number): Promise<number> {
        const result = await db('photos').count('photo_id as count').where('owner_user_id', userId);
        return parseInt(result[0].count.toString(), 10);
    }

    async insertPhoto(ownerUserId: number, url: string, description: string): Promise<Photo> {
        const [photo] = await db('photos')
            .insert({owner_user_id: ownerUserId, url, description})
            .returning('*');
        return photo;
    }

    async findPhotoById(photoId: number): Promise<Photo | null> {
        const photo = await db('photos').where('photo_id', photoId).first();
        return photo || null;
    }

    async deletePhoto(photoId: number): Promise<void> {
        await db('photos').where('photo_id', photoId).del();
    }

    async getPhotosByUser(userId: number): Promise<Photo[]> {
        return await db('photos').where('owner_user_id', userId);
    }
}

export default new PhotoDAL();