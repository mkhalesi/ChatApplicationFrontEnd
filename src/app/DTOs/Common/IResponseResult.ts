export interface IResponseResult<T> {
  success: boolean;
  errorCode: string;
  errorMessage: string
  data: T;
}
