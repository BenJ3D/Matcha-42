import {Response} from 'express';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';
import MessageService from '../services/MessageService';
import {CreateMessageDtoValidation} from '../DTOs/chat/MessageDtoValidation';

class MessageController {
    async sendMessage(req: AuthenticatedRequest, res: Response) {
        try {
            const ownerUserId = req.userId!;

            // Validation des données entrantes
            const {error, value} = CreateMessageDtoValidation.validate(req.body);
            if (error) {
                return res.status(400).json({error: error.details[0].message});
            }

            const createMessageDto = value;

            const message = await MessageService.createMessage(ownerUserId, createMessageDto);

            res.status(201).json({message});
        } catch (error: any) {
            console.error('Erreur lors de l\'envoi du message:', error);
            res.status(error.status || 500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    // Optionnel : Méthode pour récupérer la conversation avec un utilisateur
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
            console.error('Erreur lors de la récupération de la conversation:', error);
            res.status(500).json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new MessageController();