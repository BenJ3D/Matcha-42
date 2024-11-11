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
        } catch (error) {
            console.error(`Erreur lors de la récupération des matches pour l'utilisateur ${userId}:`, error);
            throw {status: 400, message: 'Impossible de récupérer les matches pour cet utilisateur'};
        }
    }

    async addMatch(userId1: number, userId2: number): Promise<void> {
        try {
            // Assurez-vous que user_1 est toujours inférieur à user_2 pour maintenir l'unicité
            const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

            // Vérifier si le match existe déjà
            const existingMatch = await db('matches')
                .where({user_1: user1, user_2: user2})
                .first();

            if (existingMatch) {
                // Le match existe déjà, ne rien faire
                return;
            }

            await db('matches').insert({user_1: user1, user_2: user2});
        } catch (error) {
            console.error(`Erreur lors de l'ajout du match entre ${userId1} et ${userId2}:`, error);
            throw {status: 400, message: 'Impossible d\'ajouter le match'};
        }
    }

    async removeMatch(userId1: number, userId2: number): Promise<void> {
        try {
            const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
            await db('matches').where({user_1: user1, user_2: user2}).del();
        } catch (error) {
            console.error(`Erreur lors de la suppression du match entre ${userId1} et ${userId2}:`, error);
            throw {status: 400, message: 'Impossible de supprimer le match'};
        }
    }

    async isMatched(userId1: number, userId2: number): Promise<boolean> {
        try {
            // Assurez-vous que user_1 est toujours inférieur à user_2 pour maintenir l'unicité
            const [user1, user2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

            const match = await db('matches')
                .select('*')
                .where({user_1: user1, user_2: user2})
                .first();

            return !!match;
        } catch (error) {
            console.error(`Erreur lors de la vérification du match entre ${userId1} et ${userId2}:`, error);
            throw {status: 400, message: 'Erreur'};
        }
    }

}

export default new MatchesDAL();