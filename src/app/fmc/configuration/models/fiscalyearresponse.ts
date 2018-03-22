export interface IFicalyearResponse {           
        FiscalYearId: number,
        FiscalYearName: string,
        FiscalYearDesc: string, 
        StartDate: string,
        EndDate:string,
        Period:string,
        IsCurrentYear: boolean,
        IsPeriodAdded:boolean,
        Isclosed: boolean,
        User: string
}