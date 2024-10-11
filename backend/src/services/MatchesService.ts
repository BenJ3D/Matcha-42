import MatchesDAL from '../DataAccessLayer/MatchesDAL';
import userDAL from '../DataAccessLayer/UserDAL';
import {UserLightResponseDto} from '../DTOs/users/UserLightResponseDto';

class MatchesService {
    async getUserMatches(userId: number): Promise<UserLightResponseDto[]> {
        const matches = await MatchesDAL.getMatchesByUserId(userId);

        if (matches.length === 0) {
            return [];
        }

        // Récupérer les IDs des utilisateurs avec qui l'utilisateur est matché
        const matchedUserIds = matches.map(match => {
            return match.user_1 === userId ? match.user_2 : match.user_1;
        });

        // Récupérer les informations des utilisateurs matchés
        const matchedUsers = await userDAL.getUsersByIds(matchedUserIds);

        return matchedUsers;
    }

    async createMatch(userId1: number, userId2: number): Promise<void> {
        await MatchesDAL.addMatch(userId1, userId2);

        // TODO: Implémenter un message websocket pour notifier le front d'un nouveau match
    }

    async deleteMatch(userId1: number, userId2: number): Promise<void> {
        await MatchesDAL.removeMatch(userId1, userId2);

        // TODO: Implémenter un message websocket pour notifier le front de la suppression du match
    }

    async isMatched(userId1: number, userId2: number): Promise<boolean> {
        return await MatchesDAL.isMatched(userId1, userId2);
    }
}

export default new MatchesService();