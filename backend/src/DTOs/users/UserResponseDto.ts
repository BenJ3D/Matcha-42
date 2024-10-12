import {UserLightResponseDto} from "./UserLightResponseDto";
import {Photo} from "../../models/Photo";
import {Tag} from "../../models/Tags";
import {BlockedUserResponseDto} from "./BlockedUserResponseDto";
import {Gender} from "../../models/Genders"

//Fourni un user complet pour les get ciblés byId avec toutes les infos profile / listes de like/match etc
export interface UserResponseDto extends UserLightResponseDto {
    id: number;
    email: string;
    created_at: Date;
    profile_id: number;
    biography: string;
    gender: number;
    age: number;
    is_online: boolean;
    is_verified: boolean;
    last_activity: Date;
    main_photo_id?: number;
    photos: Photo[];
    sexualPreferences?: Gender[];
    tags?: Tag[];
    location?: {
        latitude: number;
        longitude: number;
        city_name?: string;
    };
    fame_rating: number;
    last_connection?: Date;
    likers?: UserLightResponseDto[];
    visitors?: UserLightResponseDto[];
    matchers?: UserLightResponseDto[];
    blocked?: BlockedUserResponseDto[];
}