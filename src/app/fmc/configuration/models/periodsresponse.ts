export interface IPeriodsresponse {
        PeriodId: number,
        FiscalYearId: string,
        PeriodName: string,
        StartDate: Date,
        EndDate: Date,
        PeriodStartDate: Date,
        PeriodEndDate: Date,
        Status: string,
        YYYYMM: number,
        EffectiveClosureThreshold: number,
        IsClosed: boolean,
        IsCurrentYearClosed: boolean,
        IsPeriodAdded:boolean,
        isChecked:boolean
}
