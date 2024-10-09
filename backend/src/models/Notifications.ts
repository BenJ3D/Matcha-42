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
    target_user: number;
    has_read: boolean;
    notified_at: Date;
    type: NotificationType;
    source_user: number;
}