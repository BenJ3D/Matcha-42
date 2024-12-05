import db from '../config/knexConfig';
import {Visit} from '../models/Visit';

class VisitedProfilesDAL {
    async addVisit(visiterId: number, visitedId: number): Promise<void> {
        try {
            await db('visited_profile_history').insert({
                visiter_id: visiterId,
                visited_id: visitedId,
                viewed_at: new Date(),
            });
        } catch (error: any) {
            if (error.code == 23505) {
                throw {status: 201, message: 'Visite déjà enregistrée'};
            }
            throw {status: error.status, message: 'Impossible d\'ajouter l\'enregistrement de la visite'};
        }
    }

    async getVisitsForUser(userId: number): Promise<Visit[]> {
        try {
            const visits = await db('visited_profile_history')
                .select('visiter_id', 'viewed_at')
                .where('visited_id', userId)
                .orderBy('viewed_at', 'desc');
            return visits;
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de récupérer l\'historique des visites'};
        }
    }

    async getVisitsMadeByUser(userId: number): Promise<Visit[]> {
        try {
            const visits = await db('visited_profile_history')
                .select('visited_id', 'viewed_at')
                .where('visiter_id', userId)
                .orderBy('viewed_at', 'desc');
            return visits;
        } catch (error: any) {
            throw {status: error.status, message: 'Impossible de récupérer l\'historique des visites effectuées'};
        }
    }

}

export default new VisitedProfilesDAL();