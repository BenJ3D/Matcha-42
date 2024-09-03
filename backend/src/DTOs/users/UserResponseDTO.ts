import {UserLightResponseDTO} from "./UserLightResponseDTO";

//Fourni un user complet pour les get ciblés byId avec toutes les infos profile / listes de like/match etc
export interface UserResponseDTO extends UserLightResponseDTO, Profile{

    main_photo_id?: number;
    likers_id?: number[];
    visitors_id?: number[];
    matchers_id?: number[];
}