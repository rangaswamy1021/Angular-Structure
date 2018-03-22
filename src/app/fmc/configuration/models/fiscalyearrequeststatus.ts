import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";

export interface IFiscalyearRequestStatus {
    systemActivities: ISystemActivities,
    PeriodId: number,
    FiscalYearId: string,
    FiscalYearPeriod: string,
    PeriodName: string,
    PeriodStartDate: Date,
    PeriodEndDate: Date,
    Status: string,
    YYYYMM: number,
    EffectiveClosureThreshold: number,
    PeriodIdsString: string,
    IsClosed: string,
    UserId: number,
    LoginId: number,
    FiscalYearName: any,
    FiscalYearDesc: string,
    StartDate: Date,
    EndDate: Date,
    User: string
}