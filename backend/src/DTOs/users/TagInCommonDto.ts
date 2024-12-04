import { Tag } from "../../models/Tags";

export interface TagInCommonDto extends Tag {
    inCommon: boolean;
}