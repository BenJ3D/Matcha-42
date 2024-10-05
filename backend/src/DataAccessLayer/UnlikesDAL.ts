import db from '../config/knexConfig';
import {Unlike} from "../models/Unlike";

class UnlikesDAL {
    async getUnlikesByUserId(userId: number): Promise<Unlike[]> {
        try {
            const unlikes = await db('unlikes').select('*').where('user', userId);
            return unlikes;
        } catch (error) {
            console.error(`Erreur lors de la récupération des unlikes pour l'utilisateur ${userId}:`, error);
            throw {status: 500, message: 'Impossible de récupérer les unlikes pour cet utilisateur'};
        }
    }

    async addUnlike(userId: number, userUnlikedId: number): Promise<void> {
        try {
            // Vérifier si l'unlike existe déjà
            const existingUnlike = await db('unlikes').where({user: userId, user_unliked: userUnlikedId}).first();
            if (existingUnlike) {
                // L'unlike existe déjà, ne rien faire
                return;
            }
            await db('unlikes').insert({user: userId, user_unliked: userUnlikedId});
        } catch (error) {
            console.error(`Erreur lors de l'ajout de l'unlike de l'utilisateur ${userId} vers ${userUnlikedId}:`, error);
            throw {status: 500, message: 'Impossible d\'ajouter l\'unlike'};
        }
    }

    async removeUnlike(userId: number, userUnlikedId: number): Promise<void> {
        try {
            await db('unlikes').where({user: userId, user_unliked: userUnlikedId}).del();
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'unlike de l'utilisateur ${userId} vers ${userUnlikedId}:`, error);
            throw {status: 500, message: 'Impossible de supprimer l\'unlike'};
        }
    }
}

export default new UnlikesDAL();