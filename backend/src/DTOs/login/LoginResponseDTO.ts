import {UserResponseDto} from "../users/UserResponseDto";

export interface LoginResponseDTO {
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
}