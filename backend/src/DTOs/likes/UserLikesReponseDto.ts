import {UserLightResponseDto} from "../users/UserLightResponseDto";

export interface UserLikesResponseDto {
    likesGiven: UserLightResponseDto[];
    likesReceived: UserLightResponseDto[];
}