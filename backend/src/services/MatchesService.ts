import MatchesDAL from '../DataAccessLayer/MatchesDAL';
import userDAL from '../DataAccessLayer/UserDAL';
import { UserLightResponseDto } from '../DTOs/users/UserLightResponseDto';
import NotificationsService from "./NotificationsService";
import { NotificationType } from "../models/Notifications";
import UserServices from "./UserServices";
import fameRatingConfig from "../config/fameRating.config";

class MatchesService {
    async getUserMatches(userId: number): Promise<UserLightResponseDto[]> {
        const matches = await MatchesDAL.getMatchesByUserId(userId);

        if (matches.length === 0) {
            return [];
        }

        const matchedUserIds = matches.map(match => {
            return match.user_1 === userId ? match.user_2 : match.user_1;
        });

        const matchedUsers = await userDAL.getUsersByIds(matchedUserIds);

        return matchedUsers;
    }

    async createMatch(userId1: number, userId2: number): Promise<void> {
        await MatchesDAL.addMatch(userId1, userId2);
        await UserServices.updateFameRating(userId1, fameRatingConfig.match);
        await UserServices.updateFameRating(userId2, fameRatingConfig.match);

        await NotificationsService.createNotification(
            userId1,
            userId2,
            NotificationType.MATCH
        );
        await NotificationsService.createNotification(
            userId2,
            userId1,
            NotificationType.MATCH
        );
    }

    async deleteMatch(userId1: number, userId2: number): Promise<void> {
        try {
            await MatchesDAL.removeMatch(userId1, userId2);
            await UserServices.updateFameRating(userId1, fameRatingConfig.unmatch);
            await UserServices.updateFameRating(userId2, fameRatingConfig.unmatch);
            NotificationsService.createNotification(
                userId2,
                userId1,
                NotificationType.UNLIKE
            );
        } catch (e) {

        }
    }

    async isMatched(userId1: number, userId2: number): Promise<boolean> {
        return await MatchesDAL.isMatched(userId1, userId2);
    }
}

export default new MatchesService();