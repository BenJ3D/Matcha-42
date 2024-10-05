import UnlikesDAL from '../DataAccessLayer/UnlikesDAL';
import LikesDAL from '../DataAccessLayer/LikesDAL';
import MatchesDAL from '../DataAccessLayer/MatchesDAL';
import {Unlike} from "../models/Unlike";

class UnlikesService {
    async getUserUnlikes(userId: number): Promise<number[]> {
        const unlikes = await UnlikesDAL.getUnlikesByUserId(userId);
        return unlikes.map((unlike) => unlike.user_unliked);
    }

    async addUnlike(userId: number, targetUserId: number): Promise<void> {
        await UnlikesDAL.addUnlike(userId, targetUserId);

        // Supprimer les likes existants entre les deux utilisateurs
        await LikesDAL.removeLike(userId, targetUserId);
        await LikesDAL.removeLike(targetUserId, userId);

        // Supprimer le match s'il existe
        await MatchesDAL.removeMatch(userId, targetUserId);
        // TODO: Implémenter un message websocket pour le front
    }

    async removeUnlike(userId: number, targetUserId: number): Promise<void> {
        await UnlikesDAL.removeUnlike(userId, targetUserId);
    }
}

export default new UnlikesService();