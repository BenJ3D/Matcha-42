import {onlineUsers} from '../sockets/events/onlineUsers';
import {CreateMessageDto} from '../DTOs/chat/CreateMessageDto';
import MessageDAL from '../DataAccessLayer/MessageDAL';
import MatchesService from "./MatchesService";
import {Message} from '../models/Message';
import {Socket} from 'socket.io';

class MessageService {
    async createMessage(ownerUserId: number, createMessageDto: CreateMessageDto): Promise<Message> {
        const {target_user, content} = createMessageDto;

        // Vérifier si les utilisateurs sont matchés
        const isMatched = await MatchesService.isMatched(ownerUserId, target_user);
        if (!isMatched) {
            throw {status: 403, message: 'Vous pouvez seulement envoyer des messages aux utilisateurs matchés.'};
        }

        const messageData: Partial<Message> = {
            content,
            owner_user: ownerUserId,
            target_user,
            created_at: new Date(),
        };

        // Créer le message dans la base de données
        const message = await MessageDAL.createMessage(messageData);

        // Émettre le message à l'utilisateur cible s'il est en ligne
        const targetUserSockets = onlineUsers.get(target_user);
        if (targetUserSockets) {
            targetUserSockets.forEach((socket: Socket) => {
                socket.emit('message', message);
            });
        }

        // Émettre le message à l'utilisateur propriétaire (envoyeur)
        const ownerUserSockets = onlineUsers.get(ownerUserId);
        if (ownerUserSockets) {
            ownerUserSockets.forEach((socket: Socket) => {
                socket.emit('message', message);
            });
        }

        return message;
    }

    // Méthode pour récupérer l'historique des messages avec un autre utilisateur
    async getConversation(userId1: number, userId2: number): Promise<Message[]> {
        return await MessageDAL.getMessagesBetweenUsers(userId1, userId2);
    }
}

export default new MessageService();