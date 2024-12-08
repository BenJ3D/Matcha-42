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

        const message = await MessageDAL.createMessage(messageData);

        await UnreadUserMessageService.addUnreadChat(ownerUserId, target_user);

        await UnreadUserMessageService.removeUnreadChat(target_user, ownerUserId);

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

        const ownerUserSockets = onlineUsers.get(ownerUserId);
        if (ownerUserSockets) {
            ownerUserSockets.forEach((socket: Socket) => {
                socket.emit('message', message);
            });
        }

        return message;
    }

    async getConversation(userId1: number, userId2: number): Promise<Message[]> {
        return await MessageDAL.getMessagesBetweenUsers(userId1, userId2);
    }

    async getMessageById(messageId: number): Promise<Message | undefined> {
        return await MessageDAL.getMessageById(messageId);
    }

    async deleteMessageById(messageId: number, userId: number): Promise<void> {
        const message = await this.getMessageById(messageId);
        if (!message) {
            throw {status: 404, message: 'Message not found'};
        }
        if (message.owner_user !== userId) {
            throw {status: 403, message: 'You can only delete messages for which you are the author.'};
        }
        return await MessageDAL.deleteMessage(messageId);
    }

    async likeMessage(messageId: number, userId: number): Promise<void> {
        const message = await this.getMessageById(messageId);
        if (!message) {
            throw {status: 404, message: 'Message not found'};
        }
        if (message.target_user !== userId) {
            throw {status: 403, message: 'You can only like messages sent to you'};
        }
        if (message.is_liked) {
            throw {status: 400, message: 'Message is already liked'};
        }
        await MessageDAL.updateMessageLikeStatus(messageId, true);
        this.emitRefreshMessageToAllConcern(message);
    }

    async unlikeMessage(messageId: number, userId: number): Promise<void> {
        const message = await this.getMessageById(messageId);
        if (!message) {
            throw {status: 404, message: 'Message not found'};
        }
        if (message.target_user !== userId) {
            throw {status: 403, message: 'You can only unlike messages sent to you'};
        }
        if (!message.is_liked) {
            throw {status: 400, message: 'Message is not liked'};
        }
        await MessageDAL.updateMessageLikeStatus(messageId, false);
        this.emitRefreshMessageToAllConcern(message);
    }

    private emitRefreshMessageToAllConcern(message: Message) {
        const ownerUserSockets = onlineUsers.get(message.owner_user);
        const targetUserSockets = onlineUsers.get(message.target_user);
        if (ownerUserSockets) {
            ownerUserSockets.forEach((socket: Socket) => {
                socket.emit('refresh_message', message);
            });
        }
        if (targetUserSockets) {
            targetUserSockets.forEach((socket: Socket) => {
                socket.emit('refresh_message', message);
            });
        }
    }
}

export default new MessageService();