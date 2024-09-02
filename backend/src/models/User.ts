export interface User {
    id: number;
    username: string;
    last_name: string;
    first_name: string;
    email: string;
    password?: string;
    created_at: Date;
    // sso_type?: number;
}