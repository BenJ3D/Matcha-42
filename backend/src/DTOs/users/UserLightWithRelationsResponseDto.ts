import {UserLightResponseDto} from "./UserLightResponseDto";

export interface UserLightWithRelationsResponseDto extends UserLightResponseDto {
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