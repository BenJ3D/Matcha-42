import LikesDAL from '../DataAccessLayer/LikesDAL';
import MatchesService from './MatchesService';
import userDAL from '../DataAccessLayer/UserDAL';
import UnlikesService from "./UnlikesService";
import NotificationsService from "./NotificationsService";
import { NotificationType } from "../models/Notifications";
import UserServices from "./UserServices";
import fameRatingConfig from "../config/fameRating.config";
import UserDAL from "../DataAccessLayer/UserDAL";
import { UserLikesResponseDto } from "../DTOs/likes/UserLikesReponseDto";
import BlockedUsersService from "./BlockedUsersService";

class LikesService {

    async getUserLikes(userId: number): Promise<UserLikesResponseDto> {
        const likesGiven = await LikesDAL.getLikesByUserId(userId);
        const likesGivenUserIds = likesGiven.map(like => like.user_liked);
        const likesGivenUsers = likesGivenUserIds.length > 0 ? await userDAL.getUsersByIds(likesGivenUserIds) : [];
        const likesReceived = await LikesDAL.getLikesReceivedByUserId(userId);
        const likesReceivedUserIds = likesReceived.map(like => like.user);
        const likesReceivedUsers = likesReceivedUserIds.length > 0 ? await userDAL.getUsersByIds(likesReceivedUserIds) : [];

        const likeResp = { likesGiven: likesGivenUsers, likesReceived: likesReceivedUsers };
        return likeResp;
    }

    async addLike(userId: number, targetUserId: number): Promise<void> {
        if (userId === targetUserId) {
            throw { status: 400, message: 'Vous ne pouvez pas liker vous-même' };
        }

        const targetExists = await UserDAL.userExists(targetUserId);
        if (!targetExists) {
            throw { status: 404, message: 'Utilisateur cible non trouvé' };
        }

        await BlockedUsersService.checkIsUserBlocked(targetUserId, userId);

        await LikesDAL.addLike(userId, targetUserId);
        await UserServices.updateFameRating(targetUserId, fameRatingConfig.like);

        try {
            await UnlikesService.removeUnlike(userId, targetUserId);
        } catch (e: any) {

        }

        const reciprocalLikes = await LikesDAL.getLikesByUserId(targetUserId);
        const isMutual = reciprocalLikes.some(like => like.user_liked === userId);
        const targetUnlike = await UnlikesService.getUserUnlikes(userId);
        const isUnlikedByTarget = targetUnlike.unlikesReceived.some(user => user.id == targetUserId);
        if (isMutual) {
            await MatchesService.createMatch(userId, targetUserId);
        } else if (!isUnlikedByTarget) {
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
            await MatchesService.deleteMatch(userId, targetUserId);
        }
    }

    async getLikedUserIds(userId: number): Promise<number[]> {
        return await LikesDAL.getLikesFromUser(userId);
    }
}

export default new LikesService();