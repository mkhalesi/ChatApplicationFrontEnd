export class LoginResponseDTO {
  constructor(
    public token: string,
    public user: UserResponseDto
  ) {
  }
}

export class UserResponseDto {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public email: string,
    public isConfirmed: boolean,
  ) {
  }
}
