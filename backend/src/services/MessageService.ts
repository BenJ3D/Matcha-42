import {onlineUsers} from '../sockets/events/onlineUsers';
import {CreateMessageDto} from '../DTOs/chat/CreateMessageDto';
import MessageDAL from '../DataAccessLayer/MessageDAL';
import MatchesService from "./MatchesService";
import {Message} from '../models/Message';
import {Socket} from 'socket.io';
import NotificationsService from "./NotificationsService";
import {NotificationType} from "../models/Notifications";
import UnreadUserMessageService from "./UnreadUserMessageService";

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

        // Ajouter un message non lu pour le destinataire
        await UnreadUserMessageService.addUnreadChat(ownerUserId, target_user);

        // Supprimer le message non lu pour l'envoyeur (s'il existe)
        await UnreadUserMessageService.removeUnreadChat(target_user, ownerUserId);


        // Émettre le message à l'utilisateur cible s'il est en ligne
        const targetUserSockets = onlineUsers.get(target_user);
        if (targetUserSockets) {
            targetUserSockets.forEach((socket: Socket) => {
                socket.emit('message', message);
            });
            await NotificationsService.createNotification(
                target_user,
                ownerUserId,
                NotificationType.NEW_MESSAGE
            )
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