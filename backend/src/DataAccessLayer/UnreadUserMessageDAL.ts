import db from '../config/knexConfig';
import {UnreadUserMessage} from '../models/UnreadUserMessage';

class UnreadUserChatDAL {
    async addUnreadChat(ownerMessageUser: number, targetMessageUser: number): Promise<void> {
        try {
            await db('unread_user_message').insert({
                owner_message_user: ownerMessageUser,
                target_message_user: targetMessageUser
            });
        } catch (error: any) {
            if (error.code === '23505') {
                return;
            } else {
                throw {status: error.status, message: 'Erreur lors de l\'ajout du message non lu'};
            }
        }
    }

    async removeUnreadChat(ownerMessageUser: number, targetMessageUser: number): Promise<void> {
        try {
            await db('unread_user_message')
                .where({
                    owner_message_user: ownerMessageUser,
                    target_message_user: targetMessageUser
                })
                .del();
        } catch (error: any) {
            throw {status: error.status, message: 'Erreur lors de la suppression du message non lu'};
        }
    }

    async hasUnreadChat(ownerMessageUser: number, targetMessageUser: number): Promise<boolean> {
        try {
            const result = await db('unread_user_message')
                .select('unread_user_message_id')
                .where({
                    owner_message_user: ownerMessageUser,
                    target_message_user: targetMessageUser
                })
                .first();
            return !!result;
        } catch (error: any) {
            throw {status: error.status, message: 'Erreur lors de la vérification du message non lu'};
        }
    }

    async getUnreadChatForUser(userId: number): Promise<UnreadUserMessage[]> {
        try {
            return await db('unread_user_message')
                .select('*')
                .where('target_message_user', userId);
        } catch (error: any) {
            throw {status: error.status, message: 'Erreur lors de la récupération des messages non lus'};
        }
    }
}

export default new UnreadUserChatDAL();
