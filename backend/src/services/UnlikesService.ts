import UnlikesDAL from '../DataAccessLayer/UnlikesDAL';
import LikesService from "./LikesService";
import {UserLightResponseDto} from "../DTOs/users/UserLightResponseDto";
import userDAL from "../DataAccessLayer/UserDAL";
import UserServices from "./UserServices";
import fameRatingConfig from "../config/fameRating.config";
import BlockedUsersService from "./BlockedUsersService";
import UserDAL from "../DataAccessLayer/UserDAL";

class UnlikesService {
    async getUserUnlikes(userId: number): Promise<{
        unlikesGiven: UserLightResponseDto[],
        unlikesReceived: UserLightResponseDto[]
    }> {
        const unlikesGiven = await UnlikesDAL.getUnlikesByUserId(userId);
        const unlikesGivenUserIds = unlikesGiven.map(unlike => unlike.user_unliked);
        const unlikesGivenUsers = unlikesGivenUserIds.length > 0 ? await userDAL.getUsersByIds(unlikesGivenUserIds) : [];

        const unlikesReceived = await UnlikesDAL.getUnlikesReceivedByUserId(userId);
        const unlikesReceivedUserIds = unlikesReceived.map(unlike => unlike.user);
        const unlikesReceivedUsers = unlikesReceivedUserIds.length > 0 ? await userDAL.getUsersByIds(unlikesReceivedUserIds) : [];

        return {
            unlikesGiven: unlikesGivenUsers,
            unlikesReceived: unlikesReceivedUsers
        };
    }

    async addUnlike(userId: number, targetUserId: number): Promise<void> {
        if (userId === targetUserId) {
            throw {status: 400, message: 'You can\'t unlike yourself'};
        }

        const targetExists = await UnlikesDAL.userExists(targetUserId);
        if (!targetExists) {
            throw {status: 404, message: 'Target user not found.'};
        }

        const currentUser = await UserDAL.findOne(userId);
        if (!currentUser?.main_photo_id) {
            throw {status: 404, message: 'You can\'t unlike another profile before defining a main photo.'};
        }
        await BlockedUsersService.checkIsUserBlocked(targetUserId, userId);

        await UnlikesDAL.addUnlike(userId, targetUserId);
        await UserServices.updateFameRating(targetUserId, fameRatingConfig.unlike);

        try {
            await LikesService.removeLike(userId, targetUserId);
        } catch (e: any) {
        }
    }

    async removeUnlike(userId: number, targetUserId: number): Promise<void> {
        await UnlikesDAL.removeUnlike(userId, targetUserId);
        await UserServices.updateFameRating(targetUserId, fameRatingConfig.disunlike);
    }

    async getUnlikedUserIds(userId: number): Promise<number[]> {
        return await UnlikesDAL.getUnlikesFromUser(userId);
    }
}

export default new UnlikesService();