import {Request, Response} from 'express';
import TagsService from '../services/TagsService';

class TagsController {
    async getAllTags(req: Request, res: Response) {
        try {
            const tags = await TagsService.getAllTags();
            res.json(tags);
        } catch (error: any) {
            console.error('Erreur lors de la récupération des tags:', error);
            res
                .status(error.status || 500)
                .json({error: error.message || 'Erreur interne du serveur'});
        }
    }

    async getTagById(req: Request, res: Response) {
        try {
            const tagId = parseInt(req.params.tagId, 10);
            if (isNaN(tagId)) {
                return res.status(400).json({error: 'ID de tag invalide'});
            }
            const tag = await TagsService.getTagById(tagId);
            if (!tag) {
                return res.status(404).json({error: 'Tag non trouvé'});
            }
            res.json(tag);
        } catch (error: any) {
            console.error(
                `Erreur lors de la récupération du tag avec l'ID ${req.params.tagId}:`,
                error
            );
            res
                .status(error.status || 500)
                .json({error: error.message || 'Erreur interne du serveur'});
        }
    }
}

export default new TagsController();