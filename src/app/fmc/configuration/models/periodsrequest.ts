
import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';
export interface IPeriodsRequest {
    FiscalYearId: string,
    SystemActivities: ISystemActivities,
    loginId?: number,
    userId?: number,
    User: string,
    isViewed?: boolean,
    activitySource?: string,
    periodStartDate: Date,
    PeriodEndDate: any,
    FiscalYearPeriod?:string,
    YYYYMM?: number,
    PeriodName:string,
    Status:string,
    EffectiveClosureThreshold?:number
}