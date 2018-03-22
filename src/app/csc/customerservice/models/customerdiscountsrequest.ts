import { IPaging } from './../../../shared/models/paging';
import { ISystemActivities } from './../../../shared/models/systemactivitiesrequest';
import { ActivitySource, SubSystem } from "../../../shared/constants";

export interface ICustomerDiscountRequest {
    DiscountId: number;
    AvailedDiscountId: number;
    DiscountName: string;
    Description: string;
    StartEffectiveDate: any;
    EndEffectiveDate: any;
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
    //SubSystem: SubSystem;
    ActivitySource: string;
    SystemActivity: ISystemActivities;
    Paging: IPaging;
    IsSelected: boolean;
    StartDate: Date;
    EndDate: Date;
}