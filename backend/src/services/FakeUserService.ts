import FakeUserDAL from '../DataAccessLayer/FakeUserDAL';
import UserServices from './UserServices';
import UserDAL from '../DataAccessLayer/UserDAL';
import fameRatingConfig from "../config/fameRating.config";

class FakeUserService {

    async reportUser(userWhoReported: number, reportedUser: number): Promise<void> {
        if (userWhoReported === reportedUser) {
            throw { status: 400, message: 'Vous ne pouvez pas vous déclarer faux vous-même' };
        }

        const targetExists = await UserDAL.userExists(reportedUser);
        if (!targetExists) {
            throw { status: 404, message: 'Utilisateur cible non trouvé' };
        }

        await FakeUserDAL.reportFakeUser(userWhoReported, reportedUser);
        await UserServices.updateFameRating(reportedUser, fameRatingConfig.fake);
    }

    async unreportUser(userWhoReported: number, reportedUser: number): Promise<void> {
        await FakeUserDAL.unreportFakeUser(userWhoReported, reportedUser);
        await UserServices.updateFameRating(reportedUser, fameRatingConfig.unfake);
    }

    async checkIfUserIsFake(userId: number): Promise<boolean> {
        return await FakeUserDAL.isUserFake(userId);
    }
}

export default new FakeUserService();[]