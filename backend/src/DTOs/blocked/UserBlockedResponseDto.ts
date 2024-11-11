import {BlockedUserResponseDto} from "../users/BlockedUserResponseDto";

export interface UserBlockedResponseDto {
    blockedUsers: BlockedUserResponseDto[];
    blockedByUsers: BlockedUserResponseDto[];
}