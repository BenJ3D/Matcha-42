// Définir le type User
export interface User {
    id: number;
    username: string;
    last_name: string;
    first_name: string;
    email: string;
    password?: string;
    created_at: Date;
    sso_type?: number;
}

// Définir le type Like
export interface Like {
    like_id: number;
    user: number;
    user_liked: number;
}

// Définir le type Visit
export interface Visit {
    id: number;
    visiter: number;
    visited: number;
    visited_at: Date;
}

// Autres types de relation que vous souhaitez modéliser
export interface BlockedUser {
    id: number;
    blocker_id: number;
    blocked_id: number;
    blocked_at: Date;
}

export interface Match {
    match_id: number;
    user_1: number;
    user_2: number;
    matched_at: Date;
}

// Vous pouvez ajouter d'autres interfaces comme pour les notifications, messages, etc.
