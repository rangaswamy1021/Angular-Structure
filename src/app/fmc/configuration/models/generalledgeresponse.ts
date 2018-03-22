
export interface IGeneralLedgerResponse {
    ChartOfAccountId: number,
    TxnDate: Date,
    AccountName: string,
    DebitAmount: number,
    CreditAmount: number,
    OpeningBalance: number,
    RunningBalance: number,
    TxnDescription: string,
    //Paging: IPaging,
    User: string,

    StartDate:  Date ,
     EndDate : Date ,
     SortColumn : string,
     SortDir : number,
     PageNumber : number,
     PageSize : number,
     ReCount :number
}