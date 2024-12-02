import {Message} from "../../models/Message";

export interface MessageDto extends Message    {
	"message_id": number,
	"content": string,
	"created_at": Date,
	"owner_user": number,
	"target_user": number
  }
