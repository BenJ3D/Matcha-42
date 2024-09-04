export interface ProfileCreateDTO {
    biography: string;
    gender: number;
    age: number;
    main_photo_id?: number; // => photo_id
    location?: Location;
}