import { Photo } from "../../models/Photo";
import { Tag } from "../../models/Tags";

export interface ProfileResponseDto {
    profile_id: number;
    owner_user_id: number;
    biography: string;
    gender: number;
    age: number;
    main_photo_id?: number;
    main_photo_url?: string;
    photos?: Photo[];
    location?: {
        location_id: number;
        latitude: number;
        longitude: number;
        city_name?: string;
    };
    tags?: Tag[];
    fame_rating: number;
    last_connection?: Date;
}
