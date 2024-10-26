export interface User {
    id: number;
    username: string;
    last_name: string;
    first_name: string;
    email: string;
    password?: string;
    created_at: Date;
    is_online: boolean;
    // sso_type?: number;
}