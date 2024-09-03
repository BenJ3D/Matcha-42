import {UserLightResponseDTO} from "./UserLightResponseDTO";
import Photo from "../../models/Photo";
import {Tag} from "../../models/Tags";

//Fourni un user complet pour les get ciblés byId avec toutes les infos profile / listes de like/match etc
export interface UserResponseDTO extends UserLightResponseDTO {
    id: number;
    email: string;
    created_at: Date;
    profile_id: number;
    owner_user_id: number;
    biography: string;
    gender: number;
    age: number;
    main_photo_id?: number;
    location?: {
        latitude: number;
        longitude: number;
        city_name?: string;
    };
    last_connection?: Date;
    likers_id?: number[];
    visitors_id?: number[];
    matchers_id?: number[];
    likers?: UserLightResponseDTO[];
    visitors?: UserLightResponseDTO[];
    matchers?: UserLightResponseDTO[];
    photos: Photo[];
    tags: Tag[];
}