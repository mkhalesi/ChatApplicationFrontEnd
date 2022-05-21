import {ReceiverType} from "./ReceiverType";
import {MessageType} from "./MessageType";

export class MessageDTO {
  constructor(
    public chatId: number,
    public chatMessageId: number,
    public senderId: number,
    public receiverId: number,
    public activeUserHasSender: boolean,
    public message: string,
    public createdAt: string,
    public updatedAt: string,
    public receiverType: ReceiverType,
    public messageType: MessageType,
  ) {
  }
}
