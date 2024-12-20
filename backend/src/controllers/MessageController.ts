import {Response} from 'express';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import MessageService from '../services/MessageService';
import {CreateMessageDtoValidation} from '../DTOs/chat/MessageDtoValidation';

class MessageController {
    async sendMessage(req: AuthenticatedRequest, res: Response) {
        try {
            const ownerUserId = req.userId!;
            const {error, value} = CreateMessageDtoValidation.validate(req.body);
            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }

            const createMessageDto = value;

            const message = await MessageService.createMessage(ownerUserId, createMessageDto);

            res.status(201).json({message});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Erreur'});
        }
    }

    async getConversation(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const otherUserId = parseInt(req.params.userId, 10);

            if (isNaN(otherUserId)) {
                return res.status(400).json({error: 'ID utilisateur invalide'});
            }

            const messages = await MessageService.getConversation(userId, otherUserId);
            res.status(200).json({messages});
        } catch (error: any) {
            res.status(500).json({error: error.message || 'Erreur'});
        }
    }

    async likeMessage(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const messageId = parseInt(req.params.messageId, 10);

            if (isNaN(messageId)) {
                return res.status(400).json({error: 'message id not valid'});
            }


            await MessageService.likeMessage(messageId, userId);

            res.status(200).json({message: 'Message liked successfully'});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Unable to like message'});
        }
    }

    async unlikeMessage(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const messageId = parseInt(req.params.messageId, 10);

            if (isNaN(messageId)) {
                return res.status(400).json({error: 'message id not valid'});
            }

            await MessageService.unlikeMessage(messageId, userId);

            res.status(200).json({message: 'Message unliked successfully'});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Unable to unlike message'});
        }
    }

    async deleteMessage(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const messageId = parseInt(req.params.messageId, 10);
            if (isNaN(messageId)) {
                return res.status(400).json({error: 'message id not valid'});
            }

            await MessageService.deleteMessageById(messageId, userId);
            res.status(200).json({message: 'Message deleted successfully'});
        } catch (error: any) {
            res.status(error.status || 500).json({error: error.message || 'Unable to unlike message'});
        }
    }


}

export default new MessageController();