import {Request, Response} from 'express';
import TagsService from '../services/TagsService';
import {validateIdNumber} from "../utils/validateIdNumber";

class TagsController {
    async getAllTags(req: Request, res: Response) {
        try {
            const tags = await TagsService.getAllTags();
            res.json(tags);
        } catch (error: any) {
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }

    async getTagById(req: Request, res: Response) {
        try {
            const tagId = parseInt(req.params.tagId, 10);
            const tag = await TagsService.getTagById(tagId);
            if (!tag) {
                return res.status(404).json({error: 'Tag non trouvé'});
            }
            res.json(tag);
        } catch (error: any) {
            res
                .status(error.status || 500)
                .json({error: error.message || 'Erreur'});
        }
    }
}

export default new TagsController();