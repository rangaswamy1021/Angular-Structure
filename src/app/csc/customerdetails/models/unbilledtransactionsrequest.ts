export interface IUnbilledTransactionsRequest
{
    CustomerId: number;
    TransactionAmount: number;
    TransactionDateTime: Date;
    StatementLiteral: string;
    TransactionType: string;
    LinkId: number;
    LinkSourceName: string;
}