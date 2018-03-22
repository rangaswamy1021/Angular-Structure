
export interface ICustomerContextResponse {
  AccountId: number,
  AdditionalContactUserId: number,
  UserName: string,
  IsSearched: boolean,
  IsSplitCustomer: boolean,
  AccountStatus: string,
  AccountStatusDesc: string,
  AccountSummaryUserActivity: boolean,
  CustomerPlan: string,
  CustomerParentPlan: string,
  RevenueCategory: string,
  boolIsTagRequired: string,
  AccountType: string,
  ParentId: number
  IsTagRequired: boolean,
  isNavigateFromSearch:boolean;
  ChildCustomerId:number;
  TimeSpentId:number;
}