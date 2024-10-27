export interface BlockedUser {
    id: number;
    blocker_id: number;
    blocked_id: number;
    blocked_at: Date;
}