import db from '../config/knexConfig';
import { Unlike } from '../models/Unlike';
import { User } from '../models/User';

class UnlikesDAL {
    async getUnlikesByUserId(userId: number): Promise<Unlike[]> {
        try {
            const unlikes = await db('unlikes').select('*').where('user', userId);
            return unlikes;
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de récupérer les unlikes pour cet utilisateur' };
        }
    }

    async getUnlikesReceivedByUserId(userId: number): Promise<Unlike[]> {
        try {
            const unlikes = await db('unlikes').select('*').where('user_unliked', userId);
            return unlikes;
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de récupérer les unlikes reçus pour cet utilisateur' };
        }
    }

    async addUnlike(userId: number, userUnlikedId: number): Promise<void> {
        try {
            await db('unlikes').insert({ user: userId, user_unliked: userUnlikedId });
        } catch (error: any) {
            if (error.code === '23505') {
                throw { status: 409, message: 'Unlike déjà existant' };
            } else if (error.code === '23503') {
                throw { status: 404, message: 'Utilisateur cible non trouvé' };
            }
            throw { status: error.status, message: 'Impossible d\'ajouter le unlike' };
        }
    }

    async removeUnlike(userId: number, userUnlikedId: number): Promise<void> {
        try {
            const deletedCount = await db('unlikes').where({ user: userId, user_unliked: userUnlikedId }).del();
            if (deletedCount === 0) {
                throw { status: 404, message: 'Unlike non trouvé' };
            }
        } catch (error: any) {
            throw { status: error.status || 500, message: error.message || 'Impossible de supprimer le unlike' };
        }
    }

    async getUnlikesFromUser(userId: number): Promise<number[]> {
        try {
            const unlikes = await db('unlikes').select('user_unliked').where('user', userId);
            return unlikes.map(unlike => unlike.user_unliked);
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de récupérer les IDs des unlikes' };
        }
    }

    async userExists(userId: number): Promise<boolean> {
        try {
            const user: User | undefined = await db('users').select('id').where('id', userId).first();
            return !!user;
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de vérifier l\'existence de l\'utilisateur' };
        }
    }
}

export default new UnlikesDAL();