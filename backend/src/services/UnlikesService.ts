import UnlikesDAL from '../DataAccessLayer/UnlikesDAL';
import MatchesService from './MatchesService';
import LikesService from "./LikesService";
import {NotificationType} from "../models/Notifications";
import NotificationsService from "./NotificationsService";

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

        //Suppression d'un eventuel like, catch vide pour ne pas retourné de 404 si le like n'existe pas
        try {
            await LikesService.removeLike(userId, targetUserId);

            console.log(`DBG il avait un like avec user ${targetUserId}`)
        } catch (e: any) {
            console.log(`DBG il n'y avait aucun like avec user ${targetUserId}`)
        }

    }

    async removeUnlike(userId: number, targetUserId: number): Promise<void> {
        await UnlikesDAL.removeUnlike(userId, targetUserId);
    }

    async getUnlikedUserIds(userId: number): Promise<number[]> {
        return await UnlikesDAL.getUnlikesFromUser(userId);
    }
}

export default new UnlikesService();