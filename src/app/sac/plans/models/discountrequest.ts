import { IPaging } from './../../../shared/models/paging';
import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';

export interface IDiscountRequest {
    DiscountId: number;
    AvailedDiscountId: number;
    DiscountName: string;
    Description: string;
    StartEffectiveDate: Date;
    EndEffectiveDate: Date;
    Isactive: boolean;
    AccessLevel: number;
    DiscountCode: string;
    MinRange: string;
    MaxRange: string;
    Factor: string
    UpperLimit: string
    PlanId: number;
    DiscountValue: string;
    DiscountType: string;
    PerformBy: string;
    SubSystem: string;
    ActivitySource: string;
    SystemActivity: ISystemActivities;
    Paging: IPaging;
    IsSelected: boolean;
    StartDate: Date;
    EndDate: Date;
    DisNamerow_no: Date;
    DisCoderow_no: Date;
    index: number;
}