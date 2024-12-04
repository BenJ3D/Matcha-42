import db from '../config/knexConfig';
import {Like} from '../models/Like';
import {User} from '../models/User';

class LikesDAL {
    async getLikesByUserId(userId: number): Promise<Like[]> {
        try {
            const likes = await db('likes').select('*').where('user', userId);
            return likes;
        } catch (error) {
            throw {status: 400, message: 'Impossible de récupérer les likes pour cet utilisateur'};
        }
    }

    async getLikesReceivedByUserId(userId: number): Promise<Like[]> {
        try {
            const likes = await db('likes').select('*').where('user_liked', userId);
            return likes;
        } catch (error) {
            throw {status: 400, message: 'Impossible de récupérer les likes reçus pour cet utilisateur'};
        }
    }

    async addLike(userId: number, userLikedId: number): Promise<void> {
        try {
            await db('likes').insert({user: userId, user_liked: userLikedId});
        } catch (error: any) {
            if (error.code === '23505') {
                throw {status: 409, message: 'Like déjà existant'};
            } else if (error.code === '23503') {
                throw {status: 404, message: 'Utilisateur cible non trouvé'};
            }
            throw {status: 400, message: 'Impossible d\'ajouter le like'};
        }
    }

    async removeLike(userId: number, userLikedId: number): Promise<void> {
        try {
            const deletedCount = await db('likes').where({user: userId, user_liked: userLikedId}).del();
            if (deletedCount === 0) {
                throw {status: 404, message: 'Like non trouvé'};
            }
        } catch (error: any) {
            throw {status: error.status || 500, message: error.message || 'Impossible de supprimer le like'};
        }
    }

    async getLikesFromUser(userId: number): Promise<number[]> {
        try {
            const likes = await db('likes').select('user_liked').where('user', userId);
            return likes.map(like => like.user_liked);
        } catch (error) {
            throw {status: 400, message: 'Impossible de récupérer les IDs des likes'};
        }
    }

}

export default new LikesDAL();