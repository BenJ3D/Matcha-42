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
    location: Location;
    age: number;
    gender: string;
    is_online?: boolean;
    last_activity?: Date;
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