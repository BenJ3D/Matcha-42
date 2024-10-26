interface Profile {
    profile_id: number;
    owner_user_id: number;
    biography: string;
    gender: number;
    age: number;
    main_photo_id?: number; // => photo_id
    location?: Location;
    last_connection?: Date;
}
