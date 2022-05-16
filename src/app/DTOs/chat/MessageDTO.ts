import {ReceiverType} from "./ReceiverType";
import {MessageType} from "./MessageType";

export class MessageDTO {
  constructor(
    public senderId: number,
    public receiverId: number,
    public senderFullName: string,
    public message: string,
    public receiverType: ReceiverType,
    public messageType: MessageType,
    public createdAt: string,
  ) {
  }
}


