export interface ICloseFiscalYearResponse {
  FiscalYearId: number,
  GLAccountId: number,
  Description: string,
  OpeningBalance: number,
  DebitTxnAmount: number,
  CreditTxnAmount: number,
  Assets: number,
  Liabilities: number,
  Expenditure: number,
  Revenue: number,
  Netting: number,
  EndingBalance: number,
  UserId: number,
  LoginId: number
}