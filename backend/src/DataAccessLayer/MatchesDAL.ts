import db from '../config/knexConfig';
import {Matches} from '../models/Matches';

class MatchesDAL {
    async getMatchesByUserId(userId: number): Promise<Matches[]> {
        try {
            const matches = await db('matches')
                .select('*')
                .where('user_1', userId)
                .orWhere('user_2', userId);
            return matches;
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de récupérer les matches pour cet utilisateur'};
        }
    }

    async addMatch(userId1: number, userId2: number): Promise<void> {
        try {
            const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
            const existingMatch = await db('matches')
                .where({user_1: user1, user_2: user2})
                .first();

            if (existingMatch) {
                return;
            }

            await db('matches').insert({user_1: user1, user_2: user2});
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible d\'ajouter le match'};
        }
    }

    async removeMatch(userId1: number, userId2: number): Promise<void> {
        try {
            const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
            await db('matches').where({user_1: user1, user_2: user2}).del();
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de supprimer le match'};
        }
    }

    async isMatched(userId1: number, userId2: number): Promise<boolean> {
        try {
            const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

            const match = await db('matches')
                .select('*')
                .where({user_1: user1, user_2: user2})
                .first();

            return !!match;
        } catch (error: any) {
            throw {status: error.status, message: 'Erreur'};
        }
    }

}

export default new MatchesDAL();