import db from '../config/knexConfig';
import {BlockedUser} from '../models/BlockedUser';
import {User} from "../models/User";

class BlockedUserDAL {

    /**
     * Permet de savoir qui nous avons bloqué
     * @param userId
     */
    async getBlockedUserByUserId(userId: number): Promise<BlockedUser[]> {
        try {
            const blockedUser = await db('blocked_users').select('*').where('user', userId);
            return blockedUser;
        } catch (error) {
            console.error(`Erreur lors de la récupération des blockedUser pour l'utilisateur ${userId}:`, error);
            throw {status: 400, message: 'Impossible de récupérer les blockedUser pour cet utilisateur'};
        }
    }

    /**
     * Permet de savoir qui nous a bloqué
     * @param userId
     */
    async getBlockedUserReceivedByUserId(userId: number): Promise<BlockedUser[]> {
        try {
            const blockedUser = await db('blocked_users').select('*').where('blocked_id', userId);
            return blockedUser;
        } catch (error) {
            console.error(`Erreur lors de la récupération des blockedUser reçus pour l'utilisateur ${userId}:`, error);
            throw {status: 400, message: 'Impossible de récupérer les blockedUser reçus pour cet utilisateur'};
        }
    }

    /**
     * Bloquer un user
     * @param userId
     * @param userBlockedUserdId
     */
    async addBlockedUser(userId: number, userBlockedUserdId: number): Promise<void> {
        try {
            await db('blocked_users').insert({blocker_id: userId, blocked_id: userBlockedUserdId});
        } catch (error: any) {
            console.error(`Erreur lors de l'ajout du like de l'utilisateur ${userId} vers ${userBlockedUserdId}:`, error);
            // Vérifier si c'est une duplication
            if (error.code === '23505') { // PostgreSQL unique_violation
                throw {status: 409, message: 'BlockedUser déjà existant'};
            } else if (error.code === '23503') { // Foreign key violation
                throw {status: 404, message: 'Utilisateur cible non trouvé'};
            }
            throw {status: 400, message: 'Impossible d\'ajouter le like'};
        }
    }

    async removeBlockedUser(userId: number, userBlockedUserdId: number): Promise<void> {
        try {
            const deletedCount = await db('blocked_users').where({
                blocker_id: userId,
                blocked_id: userBlockedUserdId
            }).del();
            if (deletedCount === 0) {
                throw {status: 404, message: 'BlockedUser non trouvé'};
            }
        } catch (error: any) {
            console.error(`Erreur lors de la suppression du like de l'utilisateur ${userId} vers ${userBlockedUserdId}:`, error);
            throw {status: error.status || 400, message: error.message || 'Impossible de supprimer le like'};
        }
    }

    async getBlockedUserFromUser(userId: number): Promise<number[]> {
        try {
            const blockedUser = await db('blocked_users').select('blocker_id').where('user', userId);
            return blockedUser.map(like => like.user_liked);
        } catch (error) {
            console.error(`Erreur lors de la récupération des IDs des blockedUser pour l'utilisateur ${userId}:`, error);
            throw {status: 400, message: 'Impossible de récupérer les IDs des blockedUser'};
        }
    }

    async userExists(userId: number): Promise<boolean> {
        try {
            const user: User | undefined = await db('users').select('id').where('id', userId).first();
            return !!user;
        } catch (error) {
            console.error(`Erreur lors de la vérification de l'existence de l'utilisateur ${userId}:`, error);
            throw {status: 400, message: 'Impossible de vérifier l\'existence de l\'utilisateur'};
        }
    }
}

export default new BlockedUserDAL();