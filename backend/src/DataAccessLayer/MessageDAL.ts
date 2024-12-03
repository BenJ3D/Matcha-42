import db from '../config/knexConfig';
import {Message} from "../models/Message";

class MessageDAL {
    async createMessage(messageData: Partial<Message>): Promise<Message> {
        try {
            const [message] = await db('messages')
                .insert(messageData)
                .returning('*');
            return message;
        } catch (error) {
            console.error('Error creating message:', error);
            throw new Error('Impossible de créer le message.');
        }
    }

    // Méthode pour récupérer les messages entre deux utilisateurs
    async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
        try {
            const messages = await db('messages')
                .select('*')
                .where(function () {
                    this.where('owner_user', userId1).andWhere('target_user', userId2);
                })
                .orWhere(function () {
                    this.where('owner_user', userId2).andWhere('target_user', userId1);
                })
                .orderBy('created_at', 'asc');
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw new Error('Impossible de récupérer les messages.');
        }
    }

    async getMessageById(messageId: number): Promise<Message | undefined> {
        return await db('messages')
            .select('*')
            .where({ message_id: messageId })
            .first();
    }

    async updateMessageLikeStatus(messageId: number, isLiked: boolean): Promise<void> {
        await db('messages')
            .where({ message_id: messageId })
            .update({ is_liked: isLiked });
    }
}

export default new MessageDAL();