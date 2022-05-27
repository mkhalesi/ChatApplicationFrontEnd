import {BasePaging} from "../Common/BasePaging";
import {MessageDTO} from "./MessageDTO";

export class FilterMessageDTO implements BasePaging {
  constructor(
    public chatId: number,
    public messages: MessageDTO[]
  ) {
  }

  pageId: number = 1;
  activePage: number = 1;
  takeEntity: number = 15;
  startPage: number = 1;
  endPage: number = 1;
  pageCount: number = 0;
  skipEntity: number = 0;

}
