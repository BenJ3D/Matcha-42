// src/services/LikesService.ts

import LikesDAL from '../DataAccessLayer/LikesDAL';
import MatchesService from './MatchesService';
import {UserLightResponseDto} from '../DTOs/users/UserLightResponseDto';
import userDAL from '../DataAccessLayer/UserDAL';

class LikesService {
    async getUserLikes(userId: number): Promise<UserLightResponseDto[]> {
        const likes = await LikesDAL.getLikesByUserId(userId);
        if (likes.length === 0) {
            return [];
        }

        const likedUserIds = likes.map(like => like.user_liked);
        const likedUsers = await userDAL.getUsersByIds(likedUserIds);
        return likedUsers;
    }

    async addLike(userId: number, targetUserId: number): Promise<void> {
        if (userId === targetUserId) {
            throw {status: 400, message: 'Vous ne pouvez pas liker vous-même'};
        }

        // Vérifier si l'utilisateur cible existe
        const targetExists = await LikesDAL.userExists(targetUserId);
        if (!targetExists) {
            throw {status: 404, message: 'Utilisateur cible non trouvé'};
        }

        await LikesDAL.addLike(userId, targetUserId);

        // Vérifier si c'est un match
        const reciprocalLikes = await LikesDAL.getLikesByUserId(targetUserId);
        const isMutual = reciprocalLikes.some(like => like.user_liked === userId);
        if (isMutual) {
            await MatchesService.createMatch(userId, targetUserId);
            // TODO: Implémenter un message websocket pour notifier un nouveau match
        }
    }

    async removeLike(userId: number, targetUserId: number): Promise<void> {
        await LikesDAL.removeLike(userId, targetUserId);

        // Vérifier si un match doit être supprimé
        const reciprocalLikes = await LikesDAL.getLikesByUserId(targetUserId);
        const isStillMutual = reciprocalLikes.some(like => like.user_liked === userId);
        if (!isStillMutual) {
            await MatchesService.deleteMatch(userId, targetUserId);
            // TODO: Implémenter un message websocket pour notifier la suppression du match
        }
    }

    async getLikedUserIds(userId: number): Promise<number[]> {
        return await LikesDAL.getLikesFromUser(userId);
    }
}

export default new LikesService();