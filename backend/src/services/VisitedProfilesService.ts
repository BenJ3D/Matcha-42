import VisitedProfilesDAL from '../DataAccessLayer/VisitedProfilesDAL';
import UserDAL from '../DataAccessLayer/UserDAL';
import {UserLightResponseDto} from '../DTOs/users/UserLightResponseDto';

class VisitedProfilesService {
    async addVisit(visiterId: number, visitedId: number): Promise<void> {
        if (visiterId === visitedId) {
            throw {status: 400, message: 'Vous ne pouvez pas visiter votre propre profil'};
        }

        // Vérifier si l'utilisateur visité existe
        const visitedExists = await UserDAL.findOne(visitedId);
        if (!visitedExists) {
            throw {status: 404, message: 'Utilisateur visité non trouvé'};
        }

        await VisitedProfilesDAL.addVisit(visiterId, visitedId);
    }

    async getVisitHistoryForUser(userId: number): Promise<(UserLightResponseDto & { viewed_at: Date })[]> {
        const visits = await VisitedProfilesDAL.getVisitsForUser(userId);
        const visiterIds = visits.map(visit => visit.visiter_id);

        if (visiterIds.length === 0) {
            return [];
        }

        // Récupérer les informations des visiteurs
        const visitors = await UserDAL.getUsersByIds(visiterIds);

        // Associer les visiteurs avec leurs dates de visite
        const visitsWithDetails = visits.map(visit => {
            const visitor = visitors.find(user => user.id === visit.visiter_id);
            return {
                ...visitor!,
                viewed_at: visit.viewed_at,
            };
        });

        return visitsWithDetails;
    }
}

export default new VisitedProfilesService();