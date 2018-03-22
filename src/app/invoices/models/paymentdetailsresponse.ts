export interface IPaymentDetailsResponse {
  CreatedDate: Date;
  Stmt_Literal: string;
  TotalAmount: number;
  TxnType: string;
  TotalCount: number;
  CreatedUser: string;
  SubSystem: string;
  LinkSourceName: string;
  CitationId: number;
  AmountPaid: number;
}
