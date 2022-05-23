export class ChatDTO {
  constructor(
    public chatId: number,
    public user1: number,
    public user2: number,
    public receiverFirstName: string,
    public receiverLastName: string,
    public startedChatDate: string,
    public lastUpdatedChatDate: string,
    public latestMessageText: string,
  ) {
  }
}
