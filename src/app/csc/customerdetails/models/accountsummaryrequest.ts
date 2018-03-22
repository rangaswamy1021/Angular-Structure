export interface IAccountSummartRequest {
  AccountId: number;
  ParentId: number;
  ActivityCount: number;
  LinkSourceName: string;
  SortColumn: string;
  CurrentDateTime : Date;
  SortDirection: boolean;
  PageSize : number;
  PageNumber: number;
}