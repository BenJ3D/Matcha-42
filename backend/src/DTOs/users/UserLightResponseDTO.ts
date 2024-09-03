export interface UserLightResponseDTO {
    id: number;
    username: string;
    main_photo_url: string;
    location?: {
        latitude: number;
        longitude: number;
        city_name?: string;
    };
    age: number;
    gender: number;
}