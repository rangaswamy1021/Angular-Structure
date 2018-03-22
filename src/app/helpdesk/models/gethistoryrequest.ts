export interface IGetHistoryRequest{
    ProblemId: number;
    SortColumn: string;
    SortDirection: number;
    PageNumber: number;
    PageSize: number;
}