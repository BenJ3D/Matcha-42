import { BlockedUserResponseDto } from "../DTOs/users/BlockedUserResponseDto";
import { UserLightResponseDto } from "../DTOs/users/UserLightResponseDto";
import { Gender } from "./Genders";
import { Photo } from "./Photo";
import { Tag } from "./Tags";

// src/app/interfaces/profile.interface.ts
export interface Location {
  city_name: string;
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: number;
  username: string;
  main_photo_url: string;
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

export interface SearchFilters {
  ageRange?: { min: number; max: number };
  fameRange?: { min: number; max: number };
  location?: string;
  tags?: number[];
  preferredGenders?: number[];
  sortBy?: string;
  order?: string;
}