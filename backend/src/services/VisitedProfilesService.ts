import VisitedProfilesDAL from '../DataAccessLayer/VisitedProfilesDAL';
import UserDAL from '../DataAccessLayer/UserDAL';
import { UserLightResponseDto } from '../DTOs/users/UserLightResponseDto';
import { NotificationType } from "../models/Notifications";
import NotificationsService from "./NotificationsService";

class VisitedProfilesService {
    async addVisit(visiterId: number, visitedId: number): Promise<void> {
        if (visiterId === visitedId) {
            throw { status: 400, message: 'Vous ne pouvez pas visiter votre propre profil' };
        }

        const visitedExists = await UserDAL.findOne(visitedId);
        if (!visitedExists) {
            throw { status: 404, message: 'Utilisateur visité non trouvé' };
        }

        await VisitedProfilesDAL.addVisit(visiterId, visitedId);

        await NotificationsService.createNotification(
            visitedId,
            visiterId,
            NotificationType.NEW_VISIT
        );
    }

    async getVisitHistoryForUser(userId: number): Promise<{
        visitsMade: (UserLightResponseDto & { viewed_at: Date })[],
        visitsReceived: (UserLightResponseDto & { viewed_at: Date })[]
    }> {
        const visitsReceived = await VisitedProfilesDAL.getVisitsForUser(userId);
        const visiterIdsReceived = visitsReceived.map(visit => visit.visiter_id);
        const visitorsReceived = visiterIdsReceived.length > 0 ? await UserDAL.getUsersByIds(visiterIdsReceived) : [];
        const visitsReceivedWithDetails = visitsReceived.map(visit => {
            const visitor = visitorsReceived.find(user => user.id === visit.visiter_id);
            return {
                ...visitor!,
                viewed_at: visit.viewed_at,
            };
        });

        const visitsMade = await VisitedProfilesDAL.getVisitsMadeByUser(userId);
        const visitedIdsMade = visitsMade.map(visit => visit.visited_id);
        const visitedUsersMade = visitedIdsMade.length > 0 ? await UserDAL.getUsersByIds(visitedIdsMade) : [];
        const visitsMadeWithDetails = visitsMade.map(visit => {
            const visitedUser = visitedUsersMade.find(user => user.id === visit.visited_id);
            return {
                ...visitedUser!,
                viewed_at: visit.viewed_at,
            };
        });

        return {
            visitsMade: visitsMadeWithDetails,
            visitsReceived: visitsReceivedWithDetails
        };
    }
}

export default new VisitedProfilesService();