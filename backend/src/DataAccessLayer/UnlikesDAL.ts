import db from '../config/knexConfig';
import {Unlike} from '../models/Unlike';
import {User} from '../models/User';

class UnlikesDAL {
    async getUnlikesByUserId(userId: number): Promise<Unlike[]> {
        try {
            const unlikes = await db('unlikes').select('*').where('user', userId);
            return unlikes;
        } catch (error) {
            throw {status: 400, message: 'Impossible de récupérer les unlikes pour cet utilisateur'};
        }
    }

    async getUnlikesReceivedByUserId(userId: number): Promise<Unlike[]> {
        try {
            const unlikes = await db('unlikes').select('*').where('user_unliked', userId);
            return unlikes;
        } catch (error) {
            throw {status: 400, message: 'Impossible de récupérer les unlikes reçus pour cet utilisateur'};
        }
    }

    async addUnlike(userId: number, userUnlikedId: number): Promise<void> {
        try {
            await db('unlikes').insert({user: userId, user_unliked: userUnlikedId});
        } catch (error: any) {
            // Vérifier si c'est une duplication
            if (error.code === '23505') { // PostgreSQL unique_violation
                throw {status: 409, message: 'Unlike déjà existant'};
            } else if (error.code === '23503') { // Foreign key violation
                throw {status: 404, message: 'Utilisateur cible non trouvé'};
            }
            throw {status: 400, message: 'Impossible d\'ajouter le unlike'};
        }
    }

    async removeUnlike(userId: number, userUnlikedId: number): Promise<void> {
        try {
            const deletedCount = await db('unlikes').where({user: userId, user_unliked: userUnlikedId}).del();
            if (deletedCount === 0) {
                throw {status: 404, message: 'Unlike non trouvé'};
            }
        } catch (error: any) {
            throw {status: error.status || 400, message: error.message || 'Impossible de supprimer le unlike'};
        }
    }

    async getUnlikesFromUser(userId: number): Promise<number[]> {
        try {
            const unlikes = await db('unlikes').select('user_unliked').where('user', userId);
            return unlikes.map(unlike => unlike.user_unliked);
        } catch (error) {
            throw {status: 400, message: 'Impossible de récupérer les IDs des unlikes'};
        }
    }

    async userExists(userId: number): Promise<boolean> {
        try {
            const user: User | undefined = await db('users').select('id').where('id', userId).first();
            return !!user;
        } catch (error) {
            throw {status: 400, message: 'Impossible de vérifier l\'existence de l\'utilisateur'};
        }
    }
}

export default new UnlikesDAL();