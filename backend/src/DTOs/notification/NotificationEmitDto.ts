import {Notification} from "../../models/Notifications";

export interface NotificationEmitDto extends Notification {
    source_username: string;
}