import LikesDAL from '../DataAccessLayer/LikesDAL';
import MatchesService from './MatchesService';
import userDAL from '../DataAccessLayer/UserDAL';
import UnlikesService from "./UnlikesService";
import NotificationsService from "./NotificationsService";
import {NotificationType} from "../models/Notifications";
import UserServices from "./UserServices";
import fameRatingConfig from "../config/fameRating.config";
import UserDAL from "../DataAccessLayer/UserDAL";
import {UserLikesResponseDto} from "../DTOs/likes/UserLikesReponseDto";

class LikesService {

    async getUserLikes(userId: number): Promise<UserLikesResponseDto> {
        // Likes donnés
        const likesGiven = await LikesDAL.getLikesByUserId(userId);
        const likesGivenUserIds = likesGiven.map(like => like.user_liked);
        const likesGivenUsers = likesGivenUserIds.length > 0 ? await userDAL.getUsersByIds(likesGivenUserIds) : [];

        // Likes reçus
        const likesReceived = await LikesDAL.getLikesReceivedByUserId(userId);
        const likesReceivedUserIds = likesReceived.map(like => like.user);
        const likesReceivedUsers = likesReceivedUserIds.length > 0 ? await userDAL.getUsersByIds(likesReceivedUserIds) : [];

        const likeResp = {likesGiven: likesGivenUsers, likesReceived: likesReceivedUsers};
        return likeResp;
    }

    async addLike(userId: number, targetUserId: number): Promise<void> {
        if (userId === targetUserId) {
            throw {status: 400, message: 'Vous ne pouvez pas liker vous-même'};
        }

        // Vérifier si l'utilisateur cible existe
        const targetExists = await UserDAL.userExists(targetUserId);
        if (!targetExists) {
            throw {status: 404, message: 'Utilisateur cible non trouvé'};
        }

        await LikesDAL.addLike(userId, targetUserId);
        await UserServices.updateFameRating(targetUserId, fameRatingConfig.like);

        //Suppression d'un eventuel unlike, catch vide pour ne pas retourné de 404 si le unlike n'existe pas
        try {
            await UnlikesService.removeUnlike(userId, targetUserId);
        } catch (e: any) {

        }

        // Vérifier si c'est un match
        const reciprocalLikes = await LikesDAL.getLikesByUserId(targetUserId);
        const isMutual = reciprocalLikes.some(like => like.user_liked === userId);
        if (isMutual) {
            await MatchesService.createMatch(userId, targetUserId);


        } else {
            // LIKE notification pour target user
            await NotificationsService.createNotification(
                targetUserId,
                userId,
                NotificationType.LIKE
            );

        }


    }

    async removeLike(userId: number, targetUserId: number): Promise<void> {
        await LikesDAL.removeLike(userId, targetUserId);
        await UserServices.updateFameRating(targetUserId, fameRatingConfig.dislike);

        if (await MatchesService.isMatched(userId, targetUserId)) {

            //Supprimer un match s'il existe
            await MatchesService.deleteMatch(userId, targetUserId);
        }
    }

    async getLikedUserIds(userId: number): Promise<number[]> {
        return await LikesDAL.getLikesFromUser(userId);
    }
}

export default new LikesService();