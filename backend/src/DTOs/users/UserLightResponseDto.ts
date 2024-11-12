export interface UserLightResponseDto {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    age: number;
    main_photo_url: string;
    location?: {
        latitude: number;
        longitude: number;
        city_name?: string;
    };
    gender: number;
    is_online: boolean;
    is_verified: boolean;
    last_activity: Date;
}