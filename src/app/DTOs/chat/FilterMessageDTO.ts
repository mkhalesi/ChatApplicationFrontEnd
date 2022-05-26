import {BasePaging} from "../Common/BasePaging";
import {MessageDTO} from "./MessageDTO";

export class FilterMessageDTO implements BasePaging {
  constructor(
    public chatId: number,
    public messages: MessageDTO[]
  ) {
  }

  activePage: number = 0;
  endPage: number = 0;
  pageCount: number = 0;
  skipEntity: number = 0;
  startPage: number = 0;
  takeEntity: number = 100;
  pageId: number = 1;
}
