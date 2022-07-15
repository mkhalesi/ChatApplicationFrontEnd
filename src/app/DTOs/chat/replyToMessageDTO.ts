export class ReplyToMessageDTO {
  constructor(
    public replyToMessageId: number,
    public replyToFullName: string,
    public message: string,
  ) {
  }
}
