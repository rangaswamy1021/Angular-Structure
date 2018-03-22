export interface IGeneralJournalResponse {
    GLTxnId: number,
    CustomerId: number,
    LinkId: number,
    TxnTypeLineItemId: number,
    TxnTypeId: number,
    ChartofAccountId: number,
    PostingDate: Date,
    DebitAmount: number,
    CreditAmount: number,
    TxnAmount: number,
    Description: string,
    LinkSourceName: string,
    AccountName: string,
    TxnType: string,
    StartDate: Date,
    EndDate: Date,
    ReCount: number
}