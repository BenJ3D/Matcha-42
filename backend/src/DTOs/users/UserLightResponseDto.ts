export interface UserLightResponseDto {
    id: number;
    username: string;
    age: number;
    main_photo_url: string;
    location?: {
        latitude: number;
        longitude: number;
        city_name?: string;
    };
    gender: number;
}