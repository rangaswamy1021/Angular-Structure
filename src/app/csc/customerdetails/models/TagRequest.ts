export interface ITagRequest {
  SERIALNO:string;
  SortDirection:boolean;
  PageNumber:number;
  PageSize:number;
  ActivitySource:string;
  CustomerId:number;
  SortColumn:string;
  CurrentDateTime:Date;
}