export class ChatDTO {
  constructor(
    public chatId: number,
    public senderId: number,
    public receiverId: number,
    public receiverFirstName: string,
    public receiverLastName: string,
    public startedChatDate: string,
    public lastUpdatedChatDate: string,
    public latestMessageText: string,
  ) {
  }
}
