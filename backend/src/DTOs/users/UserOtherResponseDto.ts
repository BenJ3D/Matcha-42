import {UserLightResponseDto} from "./UserLightResponseDto";
import {Photo} from "../../models/Photo";
import {Tag} from "../../models/Tags";
import {Gender} from "../../models/Genders"

//Fourni un user complet pour les get ciblés byId avec toutes les infos profile / listes de like/match etc
export interface UserOtherResponseDto extends UserLightResponseDto {
    email: string;
    created_at: Date;
    profile_id: number;
    biography: string;
    gender: number;
    photos: Photo[];
    sexualPreferences?: Gender[];
    tags?: Tag[];
    fame_rating: number;

    isLiked: boolean;
    isUnliked: boolean;
    isMatched: boolean;
    isBlocked: boolean;
    isFakeReported: boolean;

    LikedMe: boolean;
    UnlikedMe: boolean;
    BlockedMe: boolean;
    FakeReportedMe: boolean;
}