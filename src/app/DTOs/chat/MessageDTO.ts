import {ReceiverType} from "./ReceiverType";
import {MessageType} from "./MessageType";

export class MessageDTO {
  constructor(
    public senderId: string,
    public receiverId: string,
    public message: string,
    public receiverType: ReceiverType,
    public messageType: MessageType
  ) {
  }
}


