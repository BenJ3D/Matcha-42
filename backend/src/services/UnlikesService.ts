// src/services/UnlikesService.ts

import UnlikesDAL from '../DataAccessLayer/UnlikesDAL';
import MatchesService from './MatchesService';

class UnlikesService {
    async getUserUnlikes(userId: number): Promise<number[]> {
        const unlikes = await UnlikesDAL.getUnlikesByUserId(userId);
        if (unlikes.length === 0) {
            return [];
        }

        const unlikedUserIds = unlikes.map(unlike => unlike.user_unliked);
        return unlikedUserIds;
    }

    async addUnlike(userId: number, targetUserId: number): Promise<void> {
        if (userId === targetUserId) {
            throw {status: 400, message: 'Vous ne pouvez pas unliker vous-même'};
        }

        // Vérifier si l'utilisateur cible existe
        const targetExists = await UnlikesDAL.userExists(targetUserId);
        if (!targetExists) {
            throw {status: 404, message: 'Utilisateur cible non trouvé'};
        }

        await UnlikesDAL.addUnlike(userId, targetUserId);

        // Supprimer un match si existant
        await MatchesService.deleteMatch(userId, targetUserId);
        // TODO: Implémenter un message websocket pour notifier la suppression du match
    }

    async removeUnlike(userId: number, targetUserId: number): Promise<void> {
        await UnlikesDAL.removeUnlike(userId, targetUserId);
        // Aucun impact direct sur les matches
    }

    async getUnlikedUserIds(userId: number): Promise<number[]> {
        return await UnlikesDAL.getUnlikesFromUser(userId);
    }
}

export default new UnlikesService();