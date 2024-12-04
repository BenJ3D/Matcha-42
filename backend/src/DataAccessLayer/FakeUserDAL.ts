import db from '../config/knexConfig';

class FakeUserDAL {
    async reportFakeUser(userWhoReported: number, reportedUser: number): Promise<void> {
        try {
            await db('fake_user_reporting').insert({ user_who_reported: userWhoReported, reported_user: reportedUser });
        } catch (error: any) {
            throw { status: 400, message: 'Impossible de déclarer l\'utilisateur comme faux' };
        }
    }

    async unreportFakeUser(userWhoReported: number, reportedUser: number): Promise<void> {
        try {
            const deletedCount = await db('fake_user_reporting')
                .where({ user_who_reported: userWhoReported, reported_user: reportedUser })
                .del();
            if (deletedCount === 0) {
                throw { status: 404, message: 'Déclaration non trouvée' };
            }
        } catch (error: any) {
            throw { status: error.status || 500, message: error.message || 'Impossible de retirer la déclaration' };
        }
    }

    async isUserFake(userId: number): Promise<boolean> {
        try {
            const count = await db('fake_user_reporting').where('reported_user', userId).count('id as count');
            return parseInt(count[0].count.toString(), 10) > 0;
        } catch (error) {
            throw { status: 400, message: 'Impossible de vérifier l\'état de l\'utilisateur' };
        }
    }
}

export default new FakeUserDAL();