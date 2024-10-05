// src/DataAccessLayer/LikesDAL.ts

import db from '../config/knexConfig';
import {Like} from '../models/Like';
import {User} from '../models/User';

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
            await db('likes').insert({user: userId, user_liked: userLikedId});
        } catch (error: any) {
            console.error(`Erreur lors de l'ajout du like de l'utilisateur ${userId} vers ${userLikedId}:`, error);
            // Vérifier si c'est une duplication
            if (error.code === '23505') { // PostgreSQL unique_violation
                throw {status: 409, message: 'Like déjà existant'};
            } else if (error.code === '23503') { // Foreign key violation
                throw {status: 404, message: 'Utilisateur cible non trouvé'};
            }
            throw {status: 500, message: 'Impossible d\'ajouter le like'};
        }
    }

    async removeLike(userId: number, userLikedId: number): Promise<void> {
        try {
            const deletedCount = await db('likes').where({user: userId, user_liked: userLikedId}).del();
            if (deletedCount === 0) {
                throw {status: 404, message: 'Like non trouvé'};
            }
        } catch (error: any) {
            console.error(`Erreur lors de la suppression du like de l'utilisateur ${userId} vers ${userLikedId}:`, error);
            throw {status: error.status || 500, message: error.message || 'Impossible de supprimer le like'};
        }
    }

    async getLikesFromUser(userId: number): Promise<number[]> {
        try {
            const likes = await db('likes').select('user_liked').where('user', userId);
            return likes.map(like => like.user_liked);
        } catch (error) {
            console.error(`Erreur lors de la récupération des IDs des likes pour l'utilisateur ${userId}:`, error);
            throw {status: 500, message: 'Impossible de récupérer les IDs des likes'};
        }
    }

    async userExists(userId: number): Promise<boolean> {
        try {
            const user: User | undefined = await db('users').select('id').where('id', userId).first();
            return !!user;
        } catch (error) {
            console.error(`Erreur lors de la vérification de l'existence de l'utilisateur ${userId}:`, error);
            throw {status: 500, message: 'Impossible de vérifier l\'existence de l\'utilisateur'};
        }
    }
}

export default new LikesDAL();