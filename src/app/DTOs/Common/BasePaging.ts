export interface BasePaging {
  pageId: number
  pageCount: number;
  startPage: number;
  endPage: number;
  takeEntity: number;
  skipEntity: number;
  activePage: number;
}
