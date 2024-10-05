import db from '../config/knexConfig';
import {Like} from '../models/Like';

class LikesDAL {
    async getLikesByUserId(userId: number): Promise<Like[]> {
        try {
            const likes = await db('likes').select('*').where('user', userId);
            return likes;
        } catch (error) {
            console.error(`Erreur lors de la récupération des likes pour l'utilisateur ${userId}:`, error);
            throw {status: 500, message: 'Impossible de récupérer les likes pour cet utilisateur'};
        }
    }

    async addLike(userId: number, userLikedId: number): Promise<void> {
        try {
            // Vérifier si le like existe déjà
            const existingLike = await db('likes').where({user: userId, user_liked: userLikedId}).first();
            if (existingLike) {
                // Le like existe déjà, ne rien faire
                return;
            }
            await db('likes').insert({user: userId, user_liked: userLikedId});
        } catch (error) {
            console.error(`Erreur lors de l'ajout du like de l'utilisateur ${userId} vers ${userLikedId}:`, error);
            throw {status: 500, message: 'Impossible d\'ajouter le like'};
        }
    }

    async removeLike(userId: number, userLikedId: number): Promise<void> {
        try {
            await db('likes').where({user: userId, user_liked: userLikedId}).del();
        } catch (error) {
            console.error(`Erreur lors de la suppression du like de l'utilisateur ${userId} vers ${userLikedId}:`, error);
            throw {status: 500, message: 'Impossible de supprimer le like'};
        }
    }
}

export default new LikesDAL();