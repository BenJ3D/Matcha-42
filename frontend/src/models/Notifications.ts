// Enum for Notification Types
export enum NotificationType {
    LIKE = 'LIKE',
    UNLIKE = 'UNLIKE',
    MATCH = 'MATCH',
    NEW_MESSAGE = 'NEW_MESSAGE',
    NEW_VISIT = 'NEW_VISIT',
}

// Interface for Notification Model
export interface Notification {
    notification_id: number;
    type: NotificationType;
    target_user: number;
    source_user: number;
    source_username: string;
    content: string | null;
    notified_at: Date;
    has_read: boolean;
}
