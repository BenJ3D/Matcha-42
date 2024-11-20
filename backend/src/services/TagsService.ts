import { TagInCommonDto } from './../DTOs/users/TagInCommonDto';
import TagDAL from '../DataAccessLayer/TagDAL';
import {Tag} from '../models/Tags';

class TagsService {
    async getAllTags(): Promise<Tag[]> {
        return await TagDAL.getAllTags();
    }

    async getTagById(tagId: number): Promise<Tag | null> {
        return await TagDAL.getTagById(tagId);
    }
}

export default new TagsService();