
export class ChatDTO {
  constructor(
    public user1: number,
    public user2: number,
    public receiverFullName: string,
    public createdAt: string,
  ) {
  }
}
