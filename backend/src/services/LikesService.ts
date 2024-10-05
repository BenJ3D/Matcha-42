import LikesDAL from '../DataAccessLayer/LikesDAL';
import MatchesDAL from '../DataAccessLayer/MatchesDAL';

class LikesService {
    async getUserLikes(userId: number): Promise<number[]> {
        const likes = await LikesDAL.getLikesByUserId(userId);
        return likes.map((like) => like.user_liked);
    }

    async likeUser(userId: number, targetUserId: number): Promise<void> {
        await LikesDAL.addLike(userId, targetUserId);

        // Vérifier si c'est un match
        const targetLikes = await LikesDAL.getLikesByUserId(targetUserId);
        const isMatch = targetLikes.some((like) => like.user_liked === userId);

        if (isMatch) {
            await MatchesDAL.addMatch(userId, targetUserId);
            // TODO: Implémenter un message websocket pour le front
        }
    }

    async unlikeUser(userId: number, targetUserId: number): Promise<void> {
        await LikesDAL.removeLike(userId, targetUserId);

        // Vérifier si un match existait
        const targetLikes = await LikesDAL.getLikesByUserId(targetUserId);
        const hadMatch = targetLikes.some((like) => like.user_liked === userId);

        if (hadMatch) {
            await MatchesDAL.removeMatch(userId, targetUserId);
            // TODO: Implémenter un message websocket pour le front
        }
    }
}

export default new LikesService();