export class CurrentUser {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public email: string,
    public isConfirmed: boolean
  ) {
  }
}
